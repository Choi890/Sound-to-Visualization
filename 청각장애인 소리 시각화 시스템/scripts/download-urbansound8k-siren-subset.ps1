$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Root = Resolve-Path (Join-Path $PSScriptRoot '..')
$SubsetRoot = Join-Path $Root 'data/raw/UrbanSound8K-siren'
$CsvDir = Join-Path $SubsetRoot 'csv_files'
$BaseUrl = 'https://huggingface.co/datasets/MahiA/UrbanSound8K/resolve/main'

New-Item -ItemType Directory -Force -Path $CsvDir | Out-Null

foreach ($CsvFile in @('train.csv', 'test.csv')) {
  $OutFile = Join-Path $CsvDir $CsvFile

  if (-not (Test-Path $OutFile)) {
    Invoke-WebRequest -Uri "$BaseUrl/csv_files/$CsvFile" -OutFile $OutFile
  }
}

$Rows = Import-Csv (Join-Path $CsvDir 'train.csv'), (Join-Path $CsvDir 'test.csv') |
  Where-Object { $_.classname -eq 'siren' } |
  Sort-Object path -Unique

$Index = 0
foreach ($Row in $Rows) {
  $Index += 1
  $OutFile = Join-Path $SubsetRoot $Row.path

  if (Test-Path $OutFile) {
    continue
  }

  New-Item -ItemType Directory -Force -Path (Split-Path $OutFile) | Out-Null
  Invoke-WebRequest -Uri "$BaseUrl/$($Row.path)" -OutFile $OutFile

  if (($Index % 50) -eq 0) {
    Write-Host "downloaded $Index / $($Rows.Count)"
  }
}

Write-Host "UrbanSound8K siren subset complete: $($Rows.Count) files"
