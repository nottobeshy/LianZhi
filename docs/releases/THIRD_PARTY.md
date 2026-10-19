# 第三方许可与分发核查

构建脚本从当前已锁定wheel中原样收集LICENSE/COPYING/NOTICE及Python许可证，输出third-party-licenses/与dependency-inventory.json（包括构建依赖，未声称每项都进入运行包）。实际版本见requirements-desktop.txt/requirements-asr.txt及同次build-info。

- pywebview BSD-3-Clause；platformdirs/pythonnet/keyring/faster-whisper/CTranslate2 MIT；Python PSF条款。
- PyInstaller GPLv2+及bootloader exception，运行时hooks另有Apache条款；hooks-contrib按文件SPDX区分。没有复制其整个仓库。
- PyAV自身BSD-3-Clause，不能据此推断其附带FFmpeg DLL均为BSD；wheel附带原生库的LGPL/GPL、编译选项、源代码获取/替换要求需要在正式分发前逐项确认。[PyAV项目](https://github.com/PyAV-Org/PyAV)与[FFmpeg许可证说明](https://ffmpeg.org/legal.html)是原生库审计入口。
- CTranslate2/onnxruntime/numpy等附带DLL可能包含其他许可；以wheel内NOTICE/LICENSE及对应上游构建来源核对。收集文件不等于完成法律审核。
- small模型为Systran固定commit，原始Whisper许可MIT；下载器保存MODEL_INFO.json与上游README。没有将开发者本机缓存当发行资源。
- WebView2 Runtime不打入ZIP；用户从微软安装，运行库分发遵守微软条款。

**当前自身源码许可证尚待用户指定，native许可证分发核查未完成，是公开发布门槛。** 本地候选不等于已获准公开分发全部第三方二进制。
