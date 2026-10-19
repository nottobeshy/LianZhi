# v0.1.0 Windows 候选验收记录

2026-10-19，本机Windows x64；CPython3.12.14，pywebview6.2.1 / PyInstaller6.22.3 / hooks2026.8 / platformdirs4.13.5，系统WebView2 155.0.4283.62。

## 阶段0：调研 / 阶段1：实现

- 指定开源项目已评估，见RESEARCH.md；匿名GitHub API元数据失败，未编造维护日期；可选fastapi-desktop源码/许可证无法完整审计，不采用。
- 独立.venv-release安装锁定依赖，pip check无冲突；新增4项桌面边界测试通过（4.23秒）。
- 桌面入口、路径分离、冻结ASR worker、spec、构建脚本已实现。**首次PyInstaller构建/GUI与ZIP验收尚待执行**；后续逐阶段追加实际结果。
- 云端真实调用0次，历史3次上限已用尽；原8000服务和私人数据不动，测试用隔离目录。

## 尚待完成

本地构建、窗口启动/关闭/重启、冻结ASR与凭据、空格中文路径、脱离开发目录、候选ZIP解压测试、Actions候选配置（本地稳定后）、独立干净Windows机器、人工双击、真实AI新授权验收、许可证公开分发审核。未执行项不标通过。
