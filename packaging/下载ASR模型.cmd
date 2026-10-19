@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 炼知：显式下载固定版本 faster-whisper-small（约486MB）。不会上传视频或API Key。
echo 网络受限时会失败并保留错误；成功后重启炼知。
"%~dp0LianZhi-worker.exe" --download-asr-model
if errorlevel 1 (echo 下载失败，请查看上方错误并按使用说明重试。) else (echo 模型下载及SHA-256校验完成。)
pause
