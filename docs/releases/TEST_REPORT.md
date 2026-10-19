# v0.1.0 Windows 候选验收记录

## 最终交付补记（构建后）

最终候选源码固定 `9c5377673918db93ea6436f71d266d0e6473ee88`，安装ZIP 120181772字节 / SHA256 `370fe55be7309093fefea92fe899386d3df535f175eabf6bde941454ec3c58f9`；同提交源码ZIP 459984字节 / SHA256 `8c22c9815362d147881adcde145cd208b0c5224d59e511e20b20866b796d5127`。完整性与包内版本身份检查通过。后续本报告补记提交不改变这些已验收制品的源码SHA。

最终ZIP重新解压C盘中文/空格目录；最终worker按默认缓存逻辑实际下载模型至C盘全新缓存（HF_HOME也全新），24秒通过权重SHA。最终包实际WebView2/冻结ASR/完整挑战与Stub追问/Stub文案/WinVault/SQLite/词库音量/关闭重启 **1 passed in34.18s**，同时验证复制写入成功提示、安装目录文件集合无变化、页面无脚本错误、desktop.log无ERROR，云请求0。安全结果在本机release-artifacts/acceptance-summary.json，manifest与SHA文件关联该commit，不含测试口播/Key/SQLite。常规79通过5跳过/12个前端脚本结果不变。

最终候选供用户审查。人工下载双击、独立全新系统、真实AI新预算、CI配置执行、源码许可证和native分发审核仍未完成；GitHub源码仓库与Releases尚未创建，没有公开发布。

2026-10-19，本机Windows x64；CPython3.12.14，pywebview6.2.1 / PyInstaller6.22.3 / hooks2026.8 / platformdirs4.13.5，系统WebView2 155.0.4283.62。

## 阶段0：调研 / 阶段1：实现

- 指定开源项目已评估，见RESEARCH.md；匿名GitHub API元数据失败，未编造维护日期；可选fastapi-desktop源码/许可证无法完整审计，不采用。
- 独立.venv-release安装锁定依赖，pip check无冲突；新增4项桌面边界测试通过（4.23秒）。
- 桌面入口、路径分离、冻结ASR worker、spec、构建脚本已实现；下方补充实际构建和包体验收。
- 云端真实调用0次，历史3次上限已用尽；原8000服务和私人数据不动，测试用隔离目录。

## 阶段1与2：本地候选实际结果

- 完整回归：**79 passed, 5 skipped in31.49s**；另完整执行demo/tests全部12脚本exit0。默认跳过5个显式ASR/浏览器/包体验收，不标这些默认通过。
- 首次构建onedir成功约52秒，ZIP约115MiB；实际windowed主EXE加载WebView2后正常退出，worker版本和MP4探测通过。后续加入定向WinVault动态hook、Windows版本资源；AMD64和GUI/Console PE子系统检查通过。最终ZIP字节数/SHA/源码SHA以同次candidate-manifest.json为准。
- 冻结worker安装器在全新HF_HOME/模型目标下载官方固定commit，26秒完成5个文件与权重SHA校验；未读取项目models/，随后冻结ASR使用该新模型识别44.6秒MP4，5段中文。
- 最终生产逻辑修复提交d588e37：ZIP解压到**C盘独立中文空格目录**，实际EXE PATH只保留Windows系统路径，无PYTHONHOME/PYTHONPATH/VIRTUAL_ENV；使用实际WebView2 CDP并完整执行UI流程。**1 passed in40.21s**：词库导入并主动切换、学习计时、知识解释→明确Stub追问→回答→修正→SQLite、视频上传→冻结真实ASR→确认→明确Stub双版本→用户编辑保存、关闭窗口→进程退出/端口关闭→重新启动→SQLite/词库/37%音量/WinVault恢复/视频编辑稿读回/删除假Key。page_errors=[]，desktop.log无ERROR；真实云请求0。后续目录权限边界/发布元数据/文档/CI配置变化仍对最终生成包再次运行同一验收，结果附候选manifest和外部安全汇总。
- 临时假Key按测试数据目录命名空间保存到真实Windows系统凭据；正常路径删除，并以pytest finalizer保证失败也清理。没有读取、替换或打包用户实际Key。测试视频/SQLite/截图只在本机忽略/隔离目录，不进入候选包或源码ZIP。
- 正式8000开发服务未停，原用户目录/旧记录不合并到发行包。ZIP白名单与禁止后缀检查排除私人数据/模型；源码ZIP由相同Git SHA的git archive产生。

## 真实发现与修复（保留失败）

1. 首次完整测试20项失败：新增路径单测把默认预算0泄漏给后续MockTransport用例；修正为整份环境映射隔离后77项通过，没有提高真实授权额度。
2. 第一轮实际GUI验收重启词库断言失败：脚本误以为导入自动选中，实际业务设计保留原选中库；改为显式点击已有选择按钮，未改业务。
3. 第二轮核心流程通过，但日志发现Windows Proactor连接重置与退出收尾超时；拒绝将其算完整生命周期通过。桌面专用Selector事件循环、5秒graceful限制、失败退出码与日志验收门槛修复后，C盘解压版完整重验通过。ASR仍同步受控子进程，不依赖Proactor异步子进程支持。

## 阶段3与4：准备状态及未完成门槛

本地稳定后已建立手动、contents:read、自托管Windows候选Actions配置；没有公开Release job、tag自动发布或contents:write。setup-python manifest无3.12.14 Windows构建，故未配置必然失败的托管安装；需要可信同版本解释器的隔离runner。配置已做结构检查，**云端未执行/未上传Artifacts**。源码仓库/自身许可证尚待确认，未创建不存在的GitHub链接。

尚待：独立全新Windows机器/VM、用户人工下载双击、真实AI新授权验收、无WebView2/.NET/VC运行库现场、实际扬声器/原生下载保存对话框、长时间关闭中断/低配测试、代码签名、native许可证公开分发审核。当前仅本机独立路径实测，不承诺所有Windows无需系统依赖。
