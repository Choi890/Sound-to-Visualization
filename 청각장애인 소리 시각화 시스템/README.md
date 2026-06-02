# 청각장애인 소리 시각화 시스템

실시간 주변 소리를 초인종, 사이렌, 이름 호출 같은 시각 신호로 바꾸는 접근성 앱 프로토타입입니다. 첫 화면이 실제 감지 화면이며, PWA로 설치할 수 있도록 매니페스트와 서비스워커를 포함했습니다.

## 실행

```powershell
npm.cmd install
npm.cmd run dev
```

마이크 권한이 필요하므로 로컬 실행은 `http://localhost:5173`에서 확인합니다.

## 현재 기능

- MediaPipe Audio Classifier + YAMNet TFLite 기반 실시간 소리 분류
- 초인종: 파란 원형 파동
- 사이렌: 붉은 경고 시각화
- 이름 호출: 한국어 SpeechRecognition 이름 매칭 + 방향 표시
- 스테레오 입력이 있을 때 좌/우 RMS 기반 방향 추정
- 테스트 이벤트 버튼, 진동 피드백, PWA 캐싱

## 모델과 데이터

모델은 `public/models/yamnet.tflite`에 저장됩니다. 데이터셋은 `data/raw`에 받습니다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/download-assets.ps1
```

대용량 데이터까지 받을 때:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/download-assets.ps1 -IncludeUrbanSound8K -IncludeSpatialDcase
```

사이렌 보정용 UrbanSound8K 부분 데이터만 받을 때:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/download-urbansound8k-siren-subset.ps1
```

다운로드 대상:

- YAMNet TFLite: 브라우저/모바일 온디바이스 오디오 분류
- ESC-50: 환경음 분류 학습/검증
- Mini Speech Commands: 이름 호출/키워드 스팟팅 파이프라인 검증
- UrbanSound8K-siren: 사이렌 임계값 보정용 부분 데이터
- TAU Spatial Sound Events 2019: 방향 추정/SELD 메타데이터

## 검증

```powershell
npm.cmd run lint
npm.cmd run build
```
