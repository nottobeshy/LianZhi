# 第三方与许可

本轮参考设计，没有复制以下仓库源码。实际依赖版本见requirements.txt，发布前保留依赖许可通知。项目自身开源许可待决定，未创建LICENSE。

| 来源 | 用途/许可 |
| --- | --- |
| https://github.com/fastapi/fastapi | 路由/校验，MIT，实际依赖 |
| https://fastapi.tiangolo.com/tutorial/static-files/ | 官方静态托管文档 |
| https://github.com/fastapi/sqlmodel | 评估后不引入，MIT |
| https://github.com/openai/openai-python | 客户端参考，Apache-2.0，未安装/复制 |
| https://www.python-httpx.org/ | HTTP客户端，BSD-3-Clause |
| https://www.uvicorn.org/ | 服务器，BSD-3-Clause |
| https://api-docs.deepseek.com/quick_start/pricing/ | 模型ID/端点，费用以服务商为准 |
| https://api-docs.deepseek.com/guides/thinking_mode/ | thinking请求协议 |
| https://github.com/SYSTRAN/faster-whisper | ASR候选，代码MIT，未下载 |
| https://github.com/modelscope/FunASR | ASR候选，代码MIT，权重另核 |
| https://github.com/3choff/FastWhisperAPI | 接口参考，MIT，未复制/运行 |
| https://github.com/r0x0r/pywebview | 桌面候选，BSD-3-Clause，未打包 |

已有ZzFX音效保留MIT版权头（demo/js/sound.js），未新增音视频素材。
代码许可不代表模型权重许可。SQLite是Python标准库，本轮未引入ORM/OpenAI SDK/ASR依赖。
