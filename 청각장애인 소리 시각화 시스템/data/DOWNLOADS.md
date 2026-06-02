# Downloaded Assets

## Models

- `public/models/yamnet.tflite`
- `public/models/yamnet_class_map.csv`
- `public/mediapipe/wasm/*`

## Datasets

- `data/raw/ESC-50-master`: 2,000 WAV clips
- `data/raw/mini_speech_commands`: 8,000 WAV clips
- `data/raw/UrbanSound8K-siren`: 929 siren WAV clips plus train/test metadata
- `data/raw/TAU-Spatial-Sound-Events-2019`: DCASE/TAU direction metadata archive and extracted metadata

UrbanSound8K full Zenodo archive is supported by `scripts/download-assets.ps1 -IncludeUrbanSound8K`, but the source was extremely slow in this environment. The siren subset was downloaded from a Hugging Face mirror because it is the part this prototype needs for siren threshold calibration.
