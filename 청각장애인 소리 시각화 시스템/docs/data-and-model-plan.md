# 데이터·모델 계획

## 앱 내 추론

YAMNet TFLite를 MediaPipe Audio Classifier로 실행합니다. YAMNet은 AudioSet 521개 이벤트 클래스를 예측하는 MobileNet 계열 모델이고, TFLite 버전은 웹·모바일 배포에 적합합니다.

## 학습 데이터

| 용도 | 데이터셋 | 경로 | 비고 |
| --- | --- | --- | --- |
| 환경음 기본 분류 | ESC-50 | `data/raw/ESC-50-master` | 50개 환경음, 2,000개 WAV |
| 이름 호출/키워드 파이프라인 | Mini Speech Commands | `data/raw/mini_speech_commands` | 1초 단어 발화, 소형 검증용 |
| 사이렌/도시음 강화 | UrbanSound8K-siren | `data/raw/UrbanSound8K-siren` | 사이렌 클래스 929개 WAV |
| 방향 추정 | TAU Spatial Sound Events 2019 | `data/raw/TAU-Spatial-Sound-Events-2019` | DOA 메타데이터 다운로드 완료, MIC 오디오는 선택 다운로드 |

## 출시 전 보강

- 사용자가 직접 이름을 5~20회 녹음해 개인화된 키워드 스팟팅 헤드를 학습합니다.
- 방향 표시는 단일 마이크 환경에서 제한되므로, 모바일에서는 기기별 마이크 채널 접근 가능성을 검증해야 합니다.
- 사이렌·초인종은 YAMNet 클래스 점수를 그대로 쓰지 말고, 앱 데이터로 클래스별 임계값을 보정합니다.
- SpeechRecognition은 브라우저/OS 의존성이 있으므로 앱 출시용은 온디바이스 KWS 또는 네이티브 음성 인식으로 대체합니다.
