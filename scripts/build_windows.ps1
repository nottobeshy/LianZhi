param([string]$Python = '.venv-release\Scripts\python.exe', [switch]$SkipTests)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $root
if (-not [System.Environment]::Is64BitOperatingSystem) {throw 'Windows x64 is required'}
$pythonExe = (Resolve-Path -LiteralPath $Python).Path
& $pythonExe -c "import sys,struct; assert sys.version_info[:3]==(3,12,14) and struct.calcsize('P')==8, 'CPython 3.12.14 x64 required'"
if ($LASTEXITCODE) {throw 'Python version check failed'}
if (-not $SkipTests) {
    & $pythonExe -m pytest -q --basetemp=.test-runtime/windows-build-tests
    if ($LASTEXITCODE) {throw 'Backend tests failed'}
    Push-Location demo
    try {
        Get-ChildItem tests/test-*.js | ForEach-Object {
            node $_.FullName
            if ($LASTEXITCODE) {throw "Frontend test failed: $($_.Name)"}
        }
    } finally {Pop-Location}
}
& $pythonExe -m scripts.release_metadata
if ($LASTEXITCODE) {throw 'Build metadata failed'}
& $pythonExe -m PyInstaller --noconfirm --clean --distpath dist --workpath build/pyinstaller packaging/LianZhi.spec
if ($LASTEXITCODE) {throw 'PyInstaller failed'}
$metadata = Get-Content build/release-metadata/build-info.json -Raw | ConvertFrom-Json
$app = Join-Path $root 'dist/LianZhi'
Copy-Item -LiteralPath build/release-metadata/build-info.json -Destination $app
Copy-Item -LiteralPath build/release-metadata/dependency-inventory.json -Destination $app
Copy-Item -LiteralPath build/release-metadata/third-party-licenses -Destination $app -Recurse -Force
Copy-Item -LiteralPath packaging/下载ASR模型.cmd -Destination $app
Copy-Item -LiteralPath docs/releases/WINDOWS_QUICKSTART.md -Destination (Join-Path $app '使用说明.md')
Copy-Item -LiteralPath docs/releases/v0.1.0.md -Destination (Join-Path $app 'Release-Notes.md')
Copy-Item -LiteralPath docs/releases/THIRD_PARTY.md -Destination $app
& $pythonExe -m scripts.package_windows
if ($LASTEXITCODE) {throw 'ZIP validation failed'}
Write-Output "Candidate built from commit $($metadata.commit); GUI/clean-machine acceptance remains a separate gate."
