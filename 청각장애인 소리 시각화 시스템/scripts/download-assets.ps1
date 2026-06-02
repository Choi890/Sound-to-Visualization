param(
  [switch]$IncludeUrbanSound8K,
  [switch]$IncludeSpatialDcase,
  [switch]$SkipExtract
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Root = Resolve-Path (Join-Path $PSScriptRoot '..')
$ModelDir = Join-Path $Root 'public/models'
$WasmDir = Join-Path $Root 'public/mediapipe/wasm'
$DataDir = Join-Path $Root 'data/raw'

New-Item -ItemType Directory -Force -Path $ModelDir, $WasmDir, $DataDir | Out-Null

function Download-File {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$OutFile
  )

  if ((Test-Path $OutFile) -and ((Get-Item $OutFile).Length -gt 0)) {
    Write-Host "exists $OutFile"
    return
  }

  New-Item -ItemType Directory -Force -Path (Split-Path $OutFile) | Out-Null
  Write-Host "download $Url"
  & curl.exe --fail --location --retry 5 --continue-at - --output $OutFile $Url

  if ($LASTEXITCODE -ne 0) {
    throw "Download failed: $Url"
  }
}

function Expand-Zip {
  param(
    [Parameter(Mandatory = $true)][string]$ZipFile,
    [Parameter(Mandatory = $true)][string]$Destination,
    [Parameter(Mandatory = $true)][string]$Marker
  )

  if ($SkipExtract) {
    return
  }

  if (Test-Path $Marker) {
    Write-Host "extracted $Marker"
    return
  }

  Write-Host "extract $ZipFile"
  Expand-Archive -Path $ZipFile -DestinationPath $Destination -Force
}

Download-File `
  -Url 'https://storage.googleapis.com/mediapipe-models/audio_classifier/yamnet/float32/1/yamnet.tflite' `
  -OutFile (Join-Path $ModelDir 'yamnet.tflite')

Download-File `
  -Url 'https://raw.githubusercontent.com/tensorflow/models/master/research/audioset/yamnet/yamnet_class_map.csv' `
  -OutFile (Join-Path $ModelDir 'yamnet_class_map.csv')

$EscZip = Join-Path $DataDir 'esc50-master.zip'
Download-File `
  -Url 'https://github.com/karolpiczak/ESC-50/archive/refs/heads/master.zip' `
  -OutFile $EscZip
Expand-Zip -ZipFile $EscZip -Destination $DataDir -Marker (Join-Path $DataDir 'ESC-50-master/meta/esc50.csv')

$MiniSpeechZip = Join-Path $DataDir 'mini_speech_commands.zip'
Download-File `
  -Url 'https://storage.googleapis.com/download.tensorflow.org/data/mini_speech_commands.zip' `
  -OutFile $MiniSpeechZip
Expand-Zip -ZipFile $MiniSpeechZip -Destination $DataDir -Marker (Join-Path $DataDir 'mini_speech_commands/README.md')

if ($IncludeUrbanSound8K) {
  Download-File `
    -Url 'https://zenodo.org/records/1203745/files/UrbanSound8K.tar.gz?download=1' `
    -OutFile (Join-Path $DataDir 'UrbanSound8K.tar.gz')
}

if ($IncludeSpatialDcase) {
  $DcaseDir = Join-Path $DataDir 'TAU-Spatial-Sound-Events-2019'
  New-Item -ItemType Directory -Force -Path $DcaseDir | Out-Null

  Download-File `
    -Url 'https://zenodo.org/records/2599196/files/metadata_dev.zip?download=1' `
    -OutFile (Join-Path $DcaseDir 'metadata_dev.zip')
  Download-File `
    -Url 'https://zenodo.org/records/2599196/files/mic_dev.z01?download=1' `
    -OutFile (Join-Path $DcaseDir 'mic_dev.z01')
  Download-File `
    -Url 'https://zenodo.org/records/2599196/files/mic_dev.zip?download=1' `
    -OutFile (Join-Path $DcaseDir 'mic_dev.zip')
}

Write-Host 'asset download complete'
