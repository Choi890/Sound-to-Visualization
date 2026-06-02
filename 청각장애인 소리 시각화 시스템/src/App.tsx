import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  Activity,
  BellRing,
  Compass,
  Mic,
  MicOff,
  Pause,
  Play,
  Radio,
  RefreshCcw,
  Settings,
  Siren,
  TriangleAlert,
  User,
  Volume2,
} from 'lucide-react'
import {
  AudioClassifier,
  FilesetResolver,
  type Category,
} from '@mediapipe/tasks-audio'
import './App.css'

type AlertKind = 'idle' | 'doorbell' | 'siren' | 'name'
type Direction = 'left' | 'front' | 'right' | 'unknown'
type ModelState = 'idle' | 'loading' | 'ready' | 'error'
type ListeningState = 'stopped' | 'listening' | 'error'

type SoundEvent = {
  id: number
  kind: AlertKind
  title: string
  subtitle: string
  confidence: number
  direction: Direction
  source: string
}

type AudioChunkStore = {
  chunks: Float32Array[]
  totalLength: number
}

type SpeechRecognitionAlternativeLike = {
  transcript: string
  confidence: number
}

type SpeechRecognitionResultLike = {
  readonly length: number
  readonly isFinal: boolean
  readonly [index: number]: SpeechRecognitionAlternativeLike
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: {
    readonly length: number
    readonly [index: number]: SpeechRecognitionResultLike
  }
}

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type BrowserAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

const EVENT_COPY: Record<
  AlertKind,
  Omit<SoundEvent, 'id' | 'confidence' | 'direction' | 'source'>
> = {
  idle: {
    kind: 'idle',
    title: '대기 중',
    subtitle: '주변 소리를 분석합니다',
  },
  doorbell: {
    kind: 'doorbell',
    title: '초인종',
    subtitle: '파란 원 파동',
  },
  siren: {
    kind: 'siren',
    title: '사이렌',
    subtitle: '붉은 경고',
  },
  name: {
    kind: 'name',
    title: '이름 호출',
    subtitle: '방향 표시',
  },
}

const IDLE_EVENT: SoundEvent = {
  id: 0,
  ...EVENT_COPY.idle,
  confidence: 0,
  direction: 'unknown',
  source: 'system',
}

const DIRECTION_LABEL: Record<Direction, string> = {
  left: '왼쪽',
  front: '정면',
  right: '오른쪽',
  unknown: '방향 확인 중',
}

const DIRECTION_ANGLE: Record<Direction, number> = {
  left: -92,
  front: 0,
  right: 92,
  unknown: 0,
}

const IMPORTANT_LABELS = {
  doorbell: ['doorbell', 'ding-dong', 'bell'],
  siren: ['siren', 'emergency vehicle', 'police car'],
}

function createEvent(
  kind: Exclude<AlertKind, 'idle'>,
  confidence: number,
  direction: Direction,
  source: string,
): SoundEvent {
  return {
    id: Date.now(),
    ...EVENT_COPY[kind],
    confidence,
    direction,
    source,
  }
}

function labelMatches(category: Category, terms: string[]) {
  const label = `${category.categoryName} ${category.displayName}`.toLowerCase()
  return terms.some((term) => label.includes(term))
}

function resolveImportantEvent(categories: Category[], direction: Direction) {
  // YAMNet은 많은 라벨을 반환하지만, 화면은 사용자가 바로 이해할 수 있는 알림만 보여준다.
  // 여기서 doorbell/siren 관련 라벨을 찾아 앱의 SoundEvent 형태로 변환한다.
  const doorbell = categories.find((category) =>
    labelMatches(category, IMPORTANT_LABELS.doorbell),
  )
  const siren = categories.find((category) =>
    labelMatches(category, IMPORTANT_LABELS.siren),
  )

  if (siren && siren.score >= 0.12) {
    return createEvent('siren', siren.score, direction, 'YAMNet')
  }

  if (doorbell && doorbell.score >= 0.1) {
    return createEvent('doorbell', doorbell.score, direction, 'YAMNet')
  }

  return null
}

function mergeChunks(store: AudioChunkStore) {
  const merged = new Float32Array(store.totalLength)
  let offset = 0

  for (const chunk of store.chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }

  return merged
}

function appendChunk(store: AudioChunkStore, chunk: Float32Array, maxLength: number) {
  store.chunks.push(chunk)
  store.totalLength += chunk.length

  while (store.totalLength > maxLength && store.chunks.length > 1) {
    const removed = store.chunks.shift()
    store.totalLength -= removed?.length ?? 0
  }
}

function estimateDirection(leftRms: number, rightRms: number, channelCount: number) {
  // 좌우 채널 RMS 차이로 소리 방향을 대략 추정한다.
  // 정확한 공간 추적은 아니지만, 청각 보조 UI에서 왼쪽/정면/오른쪽 안내를 주기에는 충분한 단서다.
  if (channelCount < 2) {
    return 'unknown' satisfies Direction
  }

  const balance = (rightRms - leftRms) / (leftRms + rightRms + 0.000001)

  if (Math.abs(balance) < 0.14) {
    return 'front' satisfies Direction
  }

  return balance > 0 ? ('right' satisfies Direction) : ('left' satisfies Direction)
}

function formatScore(score: number) {
  return `${Math.round(score * 100)}%`
}

function App() {
  const [modelState, setModelState] = useState<ModelState>('idle')
  const [listeningState, setListeningState] =
    useState<ListeningState>('stopped')
  const [activeEvent, setActiveEvent] = useState<SoundEvent>(IDLE_EVENT)
  const [watchedName, setWatchedName] = useState('민수')
  const [level, setLevel] = useState(0)
  const [direction, setDirection] = useState<Direction>('unknown')
  const [topLabels, setTopLabels] = useState<Category[]>([])
  const [lastTranscript, setLastTranscript] = useState('')
  const [message, setMessage] = useState('모델과 마이크가 준비되지 않았습니다')

  const classifierRef = useRef<AudioClassifier | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const chunksRef = useRef<AudioChunkStore>({ chunks: [], totalLength: 0 })
  const directionRef = useRef<Direction>('unknown')
  const sampleRateRef = useRef(48000)
  const lastInferenceRef = useRef(0)
  const speechRecognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const listeningRef = useRef(false)

  const supportsSpeechRecognition = useMemo(() => {
    const browserWindow = window as BrowserAudioWindow
    return Boolean(
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition,
    )
  }, [])

  async function ensureClassifier() {
    // YAMNet 모델과 WASM 파일은 무겁기 때문에 감지를 시작할 때 lazy-load한다.
    // 이미 로드된 classifier가 있으면 재사용해서 모델 초기화 시간을 반복해서 쓰지 않는다.
    if (classifierRef.current) {
      return classifierRef.current
    }

    setModelState('loading')
    setMessage('YAMNet 모델을 불러오는 중입니다')

    try {
      const fileset = await FilesetResolver.forAudioTasks('/mediapipe/wasm')
      const classifier = await AudioClassifier.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: '/models/yamnet.tflite',
          delegate: 'CPU',
        },
        maxResults: 8,
        scoreThreshold: 0.05,
      })

      classifierRef.current = classifier
      setModelState('ready')
      setMessage('모델이 준비되었습니다')
      return classifier
    } catch (error) {
      setModelState('error')
      setMessage(error instanceof Error ? error.message : '모델 로드 실패')
      throw error
    }
  }

  function stopSpeechRecognition() {
    speechRecognitionRef.current?.stop()
    speechRecognitionRef.current = null
  }

  function startSpeechRecognition() {
    // 이름 호출 감지는 YAMNet 대신 브라우저 SpeechRecognition을 병행 사용한다.
    // 사용자가 저장한 이름이 인식 결과에 포함되면 name 이벤트를 만들어 방향 정보와 함께 표시한다.
    if (!supportsSpeechRecognition || !watchedName.trim()) {
      return
    }

    const browserWindow = window as BrowserAudioWindow
    const Recognition =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition

    if (!Recognition) {
      return
    }

    const recognition = new Recognition()
    recognition.lang = 'ko-KR'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onerror = () => undefined
    recognition.onend = () => {
      if (listeningRef.current) {
        try {
          recognition.start()
        } catch {
          return
        }
      }
    }
    recognition.onresult = (event) => {
      const normalizedName = watchedName.trim().replace(/\s+/g, '')

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript ?? ''
        const normalizedTranscript = transcript.replace(/\s+/g, '')
        setLastTranscript(transcript)

        if (normalizedName && normalizedTranscript.includes(normalizedName)) {
          setActiveEvent(
            createEvent('name', 0.92, directionRef.current, 'SpeechRecognition'),
          )
        }
      }
    }

    try {
      recognition.start()
      speechRecognitionRef.current = recognition
    } catch {
      speechRecognitionRef.current = null
    }
  }

  function stopListening() {
    listeningRef.current = false
    processorRef.current?.disconnect()
    sourceRef.current?.disconnect()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    void audioContextRef.current?.close()
    stopSpeechRecognition()

    processorRef.current = null
    sourceRef.current = null
    streamRef.current = null
    audioContextRef.current = null
    chunksRef.current = { chunks: [], totalLength: 0 }
    setListeningState('stopped')
    setMessage('감지가 정지되었습니다')
    setLevel(0)
  }

  async function startListening() {
    // 마이크 스트림 하나를 Web Audio 그래프로 연결한다.
    // ScriptProcessor에서 레벨, 좌우 방향, 최근 샘플 버퍼를 만들고 일정 주기마다 YAMNet 분류를 실행한다.
    try {
      const classifier = await ensureClassifier()
      const browserWindow = window as BrowserAudioWindow
      const AudioContextConstructor =
        window.AudioContext ?? browserWindow.webkitAudioContext

      if (!AudioContextConstructor) {
        throw new Error('이 브라우저는 Web Audio API를 지원하지 않습니다')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: { ideal: 2 },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      const audioContext = new AudioContextConstructor()
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 2, 2)

      streamRef.current = stream
      audioContextRef.current = audioContext
      sourceRef.current = source
      processorRef.current = processor
      sampleRateRef.current = audioContext.sampleRate
      listeningRef.current = true

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer
        const left = input.getChannelData(0)
        const right =
          input.numberOfChannels > 1 ? input.getChannelData(1) : undefined
        const mixed = new Float32Array(left.length)
        let monoEnergy = 0
        let leftEnergy = 0
        let rightEnergy = 0

        for (let index = 0; index < left.length; index += 1) {
          const rightSample = right?.[index] ?? left[index]
          const sample = (left[index] + rightSample) / 2
          mixed[index] = sample
          monoEnergy += sample * sample
          leftEnergy += left[index] * left[index]
          rightEnergy += rightSample * rightSample
        }

        const rms = Math.sqrt(monoEnergy / left.length)
        const nextLevel = Math.min(1, rms * 9)
        const nextDirection = estimateDirection(
          Math.sqrt(leftEnergy / left.length),
          Math.sqrt(rightEnergy / left.length),
          input.numberOfChannels,
        )

        directionRef.current = nextDirection
        setDirection(nextDirection)
        setLevel(nextLevel)
        appendChunk(
          chunksRef.current,
          mixed,
          Math.round(sampleRateRef.current * 1.25),
        )

        const now = performance.now()
        if (now - lastInferenceRef.current < 850 || chunksRef.current.totalLength < 8000) {
          return
        }

        lastInferenceRef.current = now
        const result = classifier.classify(
          mergeChunks(chunksRef.current),
          sampleRateRef.current,
        )
        const categories = result[0]?.classifications[0]?.categories ?? []
        setTopLabels(categories)

        const importantEvent = resolveImportantEvent(categories, nextDirection)
        if (importantEvent) {
          setActiveEvent(importantEvent)
        }
      }

      source.connect(processor)
      processor.connect(audioContext.destination)
      startSpeechRecognition()
      setListeningState('listening')
      setMessage('실시간 감지 중입니다')
      setActiveEvent(IDLE_EVENT)
    } catch (error) {
      stopListening()
      setListeningState('error')
      setMessage(error instanceof Error ? error.message : '마이크 시작 실패')
    }
  }

  function injectDemo(kind: Exclude<AlertKind, 'idle'>, demoDirection: Direction) {
    setDirection(demoDirection)
    directionRef.current = demoDirection
    setActiveEvent(createEvent(kind, 0.97, demoDirection, 'demo'))
  }

  useEffect(() => {
    return () => {
      listeningRef.current = false
      processorRef.current?.disconnect()
      sourceRef.current?.disconnect()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      void audioContextRef.current?.close()
      speechRecognitionRef.current?.stop()
      classifierRef.current?.close()
    }
  }, [])

  useEffect(() => {
    if (activeEvent.kind === 'idle') {
      return undefined
    }

    if ('vibrate' in navigator) {
      const pattern =
        activeEvent.kind === 'siren'
          ? [160, 80, 160, 80, 220]
          : activeEvent.kind === 'doorbell'
            ? [80, 60, 80]
            : [120, 80, 220]
      navigator.vibrate(pattern)
    }

    const timer = window.setTimeout(() => {
      setActiveEvent(IDLE_EVENT)
    }, 5200)

    return () => window.clearTimeout(timer)
  }, [activeEvent.id, activeEvent.kind])

  const stageStyle = {
    '--level': level.toFixed(2),
    '--direction-angle': `${DIRECTION_ANGLE[activeEvent.direction]}deg`,
  } as CSSProperties

  const controlsDisabled = modelState === 'loading'
  const isListening = listeningState === 'listening'

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">실시간 접근성 오디오</p>
          <h1>청각장애인 소리 시각화 시스템</h1>
        </div>
        <div className={`system-status status-${listeningState}`}>
          <Radio aria-hidden="true" size={18} />
          <span>{message}</span>
        </div>
      </header>

      <section className="workspace" aria-label="실시간 소리 시각화">
        <section
          className={`visual-stage visual-${activeEvent.kind}`}
          style={stageStyle}
          aria-live="polite"
        >
          <div className="stage-grid" aria-hidden="true" />
          <div className="signal-meter" aria-hidden="true">
            <span />
          </div>

          <div className="visual-core">
            {activeEvent.kind === 'doorbell' && (
              <div className="doorbell-visual" aria-hidden="true">
                <span className="wave wave-1" />
                <span className="wave wave-2" />
                <span className="wave wave-3" />
                <BellRing size={76} strokeWidth={1.7} />
              </div>
            )}

            {activeEvent.kind === 'siren' && (
              <div className="siren-visual" aria-hidden="true">
                <span className="warning-band band-a" />
                <span className="warning-band band-b" />
                <Siren size={82} strokeWidth={1.75} />
              </div>
            )}

            {activeEvent.kind === 'name' && (
              <div className="name-visual" aria-hidden="true">
                <div className="direction-dial">
                  <Compass size={174} strokeWidth={1.1} />
                  <span className="direction-arrow" />
                </div>
                <User size={62} strokeWidth={1.65} />
              </div>
            )}

            {activeEvent.kind === 'idle' && (
              <div className="idle-visual" aria-hidden="true">
                <Activity size={86} strokeWidth={1.35} />
                <span />
              </div>
            )}
          </div>

          <div className="event-readout">
            <div className="event-icon" aria-hidden="true">
              {activeEvent.kind === 'doorbell' && <BellRing size={26} />}
              {activeEvent.kind === 'siren' && <TriangleAlert size={26} />}
              {activeEvent.kind === 'name' && <User size={26} />}
              {activeEvent.kind === 'idle' && <Activity size={26} />}
            </div>
            <div>
              <p className="event-title">{activeEvent.title}</p>
              <p className="event-subtitle">
                {activeEvent.subtitle}
                {activeEvent.kind !== 'idle' && (
                  <span> · {DIRECTION_LABEL[activeEvent.direction]}</span>
                )}
              </p>
            </div>
            <strong>
              {activeEvent.kind === 'idle'
                ? formatScore(level)
                : formatScore(activeEvent.confidence)}
            </strong>
          </div>
        </section>

        <aside className="control-panel" aria-label="감지 제어">
          <section className="panel-section">
            <div className="section-title">
              <Mic size={19} aria-hidden="true" />
              <h2>감지</h2>
            </div>
            <div className="button-row">
              <button
                type="button"
                className="primary-action"
                onClick={isListening ? stopListening : startListening}
                disabled={controlsDisabled}
              >
                {isListening ? <Pause size={18} /> : <Play size={18} />}
                <span>{isListening ? '정지' : '감지 시작'}</span>
              </button>
              <button
                type="button"
                className="icon-action"
                onClick={() => {
                  setActiveEvent(IDLE_EVENT)
                  setTopLabels([])
                  setLastTranscript('')
                }}
                aria-label="상태 초기화"
                title="상태 초기화"
              >
                <RefreshCcw size={18} />
              </button>
            </div>

            <label className="field">
              <span>호출 이름</span>
              <input
                value={watchedName}
                onChange={(event) => setWatchedName(event.target.value)}
                placeholder="예: 민수"
              />
            </label>

            <div className="metrics">
              <div>
                <Volume2 size={18} aria-hidden="true" />
                <span>음량</span>
                <strong>{formatScore(level)}</strong>
              </div>
              <div>
                <Compass size={18} aria-hidden="true" />
                <span>방향</span>
                <strong>{DIRECTION_LABEL[direction]}</strong>
              </div>
              <div>
                {supportsSpeechRecognition ? (
                  <Mic size={18} aria-hidden="true" />
                ) : (
                  <MicOff size={18} aria-hidden="true" />
                )}
                <span>이름</span>
                <strong>{supportsSpeechRecognition ? '가능' : '미지원'}</strong>
              </div>
            </div>
          </section>

          <section className="panel-section">
            <div className="section-title">
              <Settings size={19} aria-hidden="true" />
              <h2>테스트</h2>
            </div>
            <div className="scenario-grid">
              <button type="button" onClick={() => injectDemo('doorbell', 'front')}>
                <BellRing size={19} />
                <span>초인종</span>
              </button>
              <button type="button" onClick={() => injectDemo('siren', 'right')}>
                <Siren size={19} />
                <span>사이렌</span>
              </button>
              <button type="button" onClick={() => injectDemo('name', 'left')}>
                <User size={19} />
                <span>이름 호출</span>
              </button>
            </div>
          </section>

          <section className="panel-section">
            <div className="section-title">
              <Activity size={19} aria-hidden="true" />
              <h2>모델 출력</h2>
            </div>
            <div className="label-list">
              {topLabels.length === 0 ? (
                <p className="muted">상위 분류 결과 없음</p>
              ) : (
                topLabels.slice(0, 5).map((label) => (
                  <div key={`${label.index}-${label.categoryName}`}>
                    <span>{label.displayName || label.categoryName}</span>
                    <strong>{formatScore(label.score)}</strong>
                  </div>
                ))
              )}
            </div>
            <p className="transcript">
              {lastTranscript ? `음성: ${lastTranscript}` : '음성: 대기'}
            </p>
          </section>
        </aside>
      </section>
    </main>
  )
}

export default App
