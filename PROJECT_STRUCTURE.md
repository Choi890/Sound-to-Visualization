# Sound to Visualization 프로젝트 구조 설명

## 프로젝트 한줄 설명

웹 기반 소리 시각화 프로젝트입니다. 브라우저에서 오디오 입력을 분석하고 파형, 스펙트럼, 시각 효과로 보여주는 프론트엔드 앱입니다.

## 기본 작동 흐름

- HTML/React 엔트리가 화면을 구성하고 사용자의 오디오 입력을 받습니다.
- JavaScript/TypeScript 로직이 Web Audio API로 신호를 분석합니다.
- CSS와 정적 자산이 시각화 화면의 레이아웃과 스타일을 담당합니다.

## 문서 기준

- 아래 목록은 `git ls-files`로 확인되는 Git 추적 파일을 기준으로 작성했습니다.
- `.git`, `node_modules`, `build`, `.gradle`, 임시 업로드/출력물처럼 Git이 관리하지 않는 폴더는 제외했습니다.
- 폴더 표는 코드와 자산이 어떤 책임으로 나뉘는지, 파일 표는 각 파일이 실제로 무엇을 담당하는지 설명합니다.

## 폴더별 설명 (13개)

| 폴더 | 설명 |
| --- | --- |
| `.` | 프로젝트 루트입니다. 실행/빌드 설정, README, 전체 구조 문서, 최상위 진입 파일이 모여 있습니다. |
| `.vscode` | VS Code에서 이 프로젝트를 열 때 사용하는 편집기 설정을 보관합니다. |
| `청각장애인 소리 시각화 시스템` | 청각장애인 소리 시각화 시스템 관련 파일을 기능별로 묶어 둔 폴더입니다. 같은 책임의 코드나 자산을 한 위치에서 관리하기 위해 사용합니다. |
| `청각장애인 소리 시각화 시스템/artifacts` | artifacts 관련 파일을 기능별로 묶어 둔 폴더입니다. 같은 책임의 코드나 자산을 한 위치에서 관리하기 위해 사용합니다. |
| `청각장애인 소리 시각화 시스템/data` | 앱 데이터 계층입니다. 로컬 DB, DAO, Entity, Repository처럼 저장소와 데이터 변환 코드를 담당합니다. |
| `청각장애인 소리 시각화 시스템/docs` | docs 관련 파일을 기능별로 묶어 둔 폴더입니다. 같은 책임의 코드나 자산을 한 위치에서 관리하기 위해 사용합니다. |
| `청각장애인 소리 시각화 시스템/public` | public 관련 파일을 기능별로 묶어 둔 폴더입니다. 같은 책임의 코드나 자산을 한 위치에서 관리하기 위해 사용합니다. |
| `청각장애인 소리 시각화 시스템/public/mediapipe` | mediapipe 관련 파일을 기능별로 묶어 둔 폴더입니다. 같은 책임의 코드나 자산을 한 위치에서 관리하기 위해 사용합니다. |
| `청각장애인 소리 시각화 시스템/public/mediapipe/wasm` | wasm 관련 파일을 기능별로 묶어 둔 폴더입니다. 같은 책임의 코드나 자산을 한 위치에서 관리하기 위해 사용합니다. |
| `청각장애인 소리 시각화 시스템/public/models` | models 관련 파일을 기능별로 묶어 둔 폴더입니다. 같은 책임의 코드나 자산을 한 위치에서 관리하기 위해 사용합니다. |
| `청각장애인 소리 시각화 시스템/scripts` | scripts 관련 파일을 기능별로 묶어 둔 폴더입니다. 같은 책임의 코드나 자산을 한 위치에서 관리하기 위해 사용합니다. |
| `청각장애인 소리 시각화 시스템/src` | src 관련 파일을 기능별로 묶어 둔 폴더입니다. 같은 책임의 코드나 자산을 한 위치에서 관리하기 위해 사용합니다. |
| `청각장애인 소리 시각화 시스템/src/assets` | assets 관련 파일을 기능별로 묶어 둔 폴더입니다. 같은 책임의 코드나 자산을 한 위치에서 관리하기 위해 사용합니다. |

## 파일별 설명 (40개)

| 파일 | 설명 |
| --- | --- |
| `.gitignore` | Git에 올리지 않을 빌드 산출물, 캐시, 개인 환경 파일을 지정하는 설정 파일입니다. 저장소에는 필요한 소스/자산만 남기도록 도와줍니다. |
| `.vscode/settings.json` | VS Code에서 이 프로젝트를 열 때 적용할 편집기/작업공간 설정을 저장하는 JSON 파일입니다. |
| `package-lock.json` | npm 의존성의 정확한 버전을 고정해 다른 PC에서도 같은 패키지 조합으로 설치되게 합니다. |
| `PROJECT_STRUCTURE.md` | 프로젝트의 모든 주요 폴더와 Git 추적 파일을 한글로 설명하는 구조 문서입니다. 처음 보는 사람이 경로별 역할을 빠르게 파악하기 위해 추가했습니다. |
| `청각장애인 소리 시각화 시스템/.gitignore` | Git에 올리지 않을 빌드 산출물, 캐시, 개인 환경 파일을 지정하는 설정 파일입니다. 저장소에는 필요한 소스/자산만 남기도록 도와줍니다. |
| `청각장애인 소리 시각화 시스템/artifacts/desktop.png` | 앱 화면 상태나 UI 변경 결과를 기록한 스크린샷 이미지입니다. 문서화와 화면 비교에 사용됩니다. |
| `청각장애인 소리 시각화 시스템/artifacts/mobile.png` | 앱 화면 상태나 UI 변경 결과를 기록한 스크린샷 이미지입니다. 문서화와 화면 비교에 사용됩니다. |
| `청각장애인 소리 시각화 시스템/data/DOWNLOADS.md` | 소리 시각화 웹 앱에 필요한 모델, 데이터셋, 외부 자산의 다운로드 위치와 준비 방법을 설명하는 문서입니다. |
| `청각장애인 소리 시각화 시스템/docs/data-and-model-plan.md` | 소리 시각화 웹 앱에서 사용할 데이터셋, 모델, 수집/학습 계획을 정리한 문서입니다. |
| `청각장애인 소리 시각화 시스템/eslint.config.js` | React/Vite 프로젝트의 ESLint 규칙을 정의해 TypeScript/JavaScript 코드 스타일과 잠재 오류를 검사합니다. |
| `청각장애인 소리 시각화 시스템/index.html` | 브라우저 앱의 기본 HTML 문서입니다. 화면 뼈대, 스크립트/CSS 연결, 주요 DOM 영역을 정의합니다. |
| `청각장애인 소리 시각화 시스템/package.json` | Node.js 프로젝트의 스크립트, 의존성, 개발 도구 설정을 정의합니다. |
| `청각장애인 소리 시각화 시스템/package-lock.json` | npm 의존성의 정확한 버전을 고정해 다른 PC에서도 같은 패키지 조합으로 설치되게 합니다. |
| `청각장애인 소리 시각화 시스템/public/app-icon.svg` | PWA와 브라우저 탭에서 사용할 앱 대표 아이콘 SVG 자산입니다. |
| `청각장애인 소리 시각화 시스템/public/favicon.svg` | 브라우저 탭 favicon으로 표시되는 소리 시각화 앱 아이콘 SVG입니다. |
| `청각장애인 소리 시각화 시스템/public/icons.svg` | 화면 여러 곳에서 재사용할 SVG 아이콘 묶음 또는 심볼 자산입니다. |
| `청각장애인 소리 시각화 시스템/public/manifest.webmanifest` | 웹 앱 이름, 아이콘, 시작 URL, 표시 방식 같은 PWA 설치 정보를 정의하는 manifest 파일입니다. |
| `청각장애인 소리 시각화 시스템/public/mediapipe/wasm/audio_wasm_internal.js` | MediaPipe 오디오 처리 WebAssembly 모듈을 브라우저에서 로드하기 위한 JavaScript 런타임 파일입니다. |
| `청각장애인 소리 시각화 시스템/public/mediapipe/wasm/audio_wasm_internal.wasm` | MediaPipe 오디오 처리를 브라우저에서 고성능으로 실행하는 WebAssembly 바이너리입니다. |
| `청각장애인 소리 시각화 시스템/public/mediapipe/wasm/audio_wasm_module_internal.js` | MediaPipe 오디오 WASM 모듈 초기화와 함수 바인딩을 담당하는 JavaScript 로더입니다. |
| `청각장애인 소리 시각화 시스템/public/mediapipe/wasm/audio_wasm_module_internal.wasm` | MediaPipe 오디오 WASM 모듈 본체 바이너리입니다. 브라우저 오디오 특징 추출에 사용됩니다. |
| `청각장애인 소리 시각화 시스템/public/mediapipe/wasm/audio_wasm_nosimd_internal.js` | SIMD 미지원 브라우저에서 사용할 MediaPipe 오디오 WASM JavaScript 로더입니다. |
| `청각장애인 소리 시각화 시스템/public/mediapipe/wasm/audio_wasm_nosimd_internal.wasm` | SIMD 없이 동작하는 MediaPipe 오디오 WebAssembly 바이너리입니다. |
| `청각장애인 소리 시각화 시스템/public/models/yamnet.tflite` | YAMNet TensorFlow Lite 소리 분류 모델입니다. 마이크/오디오 입력을 소리 종류 라벨로 분류할 때 로드합니다. |
| `청각장애인 소리 시각화 시스템/public/models/yamnet_class_map.csv` | YAMNet 모델 출력 인덱스를 사람이 읽을 수 있는 소리 라벨로 매핑하는 CSV 파일입니다. |
| `청각장애인 소리 시각화 시스템/public/sw.js` | PWA 오프라인 캐시와 정적 자산 로딩을 담당하는 서비스 워커 JavaScript 파일입니다. |
| `청각장애인 소리 시각화 시스템/README.md` | 프로젝트 개요, 실행 방법, 주요 기능을 설명하는 기본 안내 문서입니다. |
| `청각장애인 소리 시각화 시스템/scripts/download-assets.ps1` | 웹 앱 실행에 필요한 모델과 정적 자산을 내려받는 Windows PowerShell 스크립트입니다. |
| `청각장애인 소리 시각화 시스템/scripts/download-urbansound8k-siren-subset.ps1` | UrbanSound8K 중 사이렌 관련 샘플 하위 집합을 내려받아 테스트/학습 데이터로 준비하는 스크립트입니다. |
| `청각장애인 소리 시각화 시스템/src/App.css` | App React 컴포넌트에 적용되는 화면 전용 CSS입니다. 주요 섹션, 카드, 시각화 요소의 스타일을 정의합니다. |
| `청각장애인 소리 시각화 시스템/src/App.tsx` | 소리 시각화 웹 앱의 최상위 React 컴포넌트입니다. 오디오 입력, 감지 결과, 화면 상태, 주요 UI를 묶어 렌더링합니다. |
| `청각장애인 소리 시각화 시스템/src/assets/hero.png` | 앱 화면 상태나 UI 변경 결과를 기록한 스크린샷 이미지입니다. 문서화와 화면 비교에 사용됩니다. |
| `청각장애인 소리 시각화 시스템/src/assets/react.svg` | Vite/React 기본 React 로고 SVG 자산입니다. 예제 또는 기본 화면 자산으로 사용됩니다. |
| `청각장애인 소리 시각화 시스템/src/assets/vite.svg` | Vite 기본 로고 SVG 자산입니다. 개발 템플릿 또는 기본 화면 자산으로 사용됩니다. |
| `청각장애인 소리 시각화 시스템/src/index.css` | React 앱 전역 CSS입니다. 기본 레이아웃, 색상, 글꼴, 반응형 화면 스타일을 정의합니다. |
| `청각장애인 소리 시각화 시스템/src/main.tsx` | React 앱 진입점입니다. root DOM에 App 컴포넌트를 마운트하고 브라우저 실행을 시작합니다. |
| `청각장애인 소리 시각화 시스템/tsconfig.app.json` | 브라우저 앱 코드에 적용할 TypeScript 컴파일 옵션을 정의합니다. |
| `청각장애인 소리 시각화 시스템/tsconfig.json` | 프로젝트 전체 TypeScript 설정의 기준 파일입니다. 앱/Node 설정 파일을 참조합니다. |
| `청각장애인 소리 시각화 시스템/tsconfig.node.json` | Vite 설정처럼 Node 환경에서 실행되는 TypeScript 파일의 컴파일 옵션을 정의합니다. |
| `청각장애인 소리 시각화 시스템/vite.config.ts` | Vite 개발 서버와 빌드 옵션, React 플러그인 설정을 정의하는 프론트엔드 빌드 설정 파일입니다. |

## 읽는 방법

- 먼저 폴더별 설명에서 큰 기능 묶음을 확인한 다음, 파일별 설명에서 실제 구현 파일을 찾으면 됩니다.
- Android 프로젝트는 `app/src/main/java` 아래 Kotlin 파일이 핵심 코드이고, `app/src/main/res`와 `app/src/main/assets`는 화면/모델/오디오 자산입니다.
- 웹 프로젝트는 `index.html`, `styles.css`, `script.js` 또는 `app.js`가 화면 구조, 스타일, 동작을 나눠 담당합니다.
- Python 프로젝트는 루트의 실행 스크립트와 `src`, `backend`, `scripts`, `tests` 폴더를 함께 보면 처리 흐름을 이해할 수 있습니다.
