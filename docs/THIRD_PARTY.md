# 第三方与许可

本轮参考设计，没有复制以下仓库源码。实际依赖版本见requirements.txt，发布前保留依赖许可通知。项目自身开源许可待决定，未创建LICENSE。

| 来源 | 用途/许可 |
| --- | --- |
| https://github.com/fastapi/fastapi | 路由/校验，MIT，实际依赖 |
| https://fastapi.tiangolo.com/tutorial/static-files/ | 官方静态托管文档 |
| https://github.com/fastapi/sqlmodel | 评估后不引入，MIT |
| https://github.com/openai/openai-python | 客户端参考，Apache-2.0，未安装/复制 |
| https://www.python-httpx.org/ | HTTP客户端，BSD-3-Clause |
| https://github.com/jaraco/keyring | 实际keyring 25.7.0，MIT；明确选用Windows WinVaultKeyring，不使用第三方后端自动选择 |
| https://github.com/enthought/pywin32-ctypes | 实际pywin32-ctypes 0.2.3，BSD-3-Clause；Windows凭据API支持 |
| https://www.uvicorn.org/ | 服务器，BSD-3-Clause |
| https://api-docs.deepseek.com/quick_start/pricing/ | 模型ID/端点，费用以服务商为准 |
| https://api-docs.deepseek.com/guides/thinking_mode/ | thinking请求协议 |
| https://github.com/SYSTRAN/faster-whisper | 已实际安装1.2.1，MIT；本地CPU ASR |
| https://huggingface.co/Systran/faster-whisper-small | 唯一下载的主ASR模型，固定536b066，模型卡MIT，详细SHA见ASR.md |
| https://github.com/PyAV-Org/PyAV | 实际16.1.0，BSD-3-Clause；wheel内含FFmpeg，保留wheel附带的构建/许可通知，不能将FFmpeg统称MIT |
| https://github.com/OpenNMT/CTranslate2 | 实际4.8.3，MIT，CPU INT8推理 |
| https://github.com/snakers4/silero-vad | faster-whisper自带VAD，MIT；本轮不下载另一大型模型 |
| https://huggingface.co/datasets/google/fleurs | 可公开获取中文测试资源，CC-BY-4.0；链接及使用限制见ASR.md，本轮未下载整个语料 |
| https://github.com/modelscope/FunASR | ASR候选，代码MIT，权重另核 |
| https://github.com/3choff/FastWhisperAPI | 接口参考，MIT，未复制/运行 |
| https://github.com/r0x0r/pywebview | 桌面候选，BSD-3-Clause，未打包 |

已有ZzFX音效保留MIT版权头（demo/js/sound.js），未新增音视频素材。
代码许可不代表模型权重许可。SQLite是Python标准库，本轮未引入ORM/OpenAI SDK/ASR依赖。
