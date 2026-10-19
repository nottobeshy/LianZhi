# 炼知 v0.1.0 Windows x64 候选包

**候选包，尚未公开发布。** 当前验收状态见同版本测试记录，不把构建成功当作完整可用声明。

1. Windows11 x64，解压整个ZIP，保持LianZhi.exe、LianZhi-worker.exe与_internal同目录；不要只复制EXE。可放中文/空格路径，不需要安装Python。
2. 需要系统Edge WebView2 Evergreen Runtime与.NET Framework（pywebview要求至少4.6.2，Windows11通常已有较新版本）；缺失时从[微软官方](https://developer.microsoft.com/microsoft-edge/webview2/)安装，不从不明站点获取DLL。
3. 双击LianZhi.exe。仅绑定本机127.0.0.1:8765；端口或同数据目录被占用时先关闭旧进程。关闭窗口会停止自己的服务/媒体子进程；不会停止另一个开发服务。
4. 首次本地ASR需关闭应用后显式运行“下载ASR模型.cmd”，网络下载固定版本small（约486MB）并验证SHA-256；成功后再启动。不会上传媒体、不会自动下载其他模型。网络/代理限制可能导致失败；保留错误并重试，不能把失败当成功。未安装模型时其他功能仍可用。
5. 云AI在设置中配置用户自己的DeepSeek端点/模型/API Key，可勾选“记住”保存到Windows系统凭据，不把Key写入SQLite/日志。**本轮候选默认LLM_MAX_REQUESTS=0**，既有联调3次已用尽；未经新明确授权不发真实请求。未来用户自付费使用时可由启动环境设置额度，正式默认值尚待发布确认。

## 数据位置与升级

- 默认SQLite/视频/非敏感设置：`%LOCALAPPDATA%\KnowledgeCompass`，继续沿用原应用身份。
- 模型/浏览器缓存：`%LOCALAPPDATA%\KnowledgeCompass\Cache` 下models与webview（具体由platformdirs确定）。日志：同应用目录的Logs，最多3个约1MiB轮转文件。
- Windows上user_config_dir与user_data_dir可能相同，既有llm-settings.json继续位于data_dir；Key只在系统凭据。删除ZIP或升级程序不会删除这些目录。
- 可用LIANZHI_DATA_DIR/LIANZHI_ASR_MODEL_DIR指定目录。数据目录变化会改变凭据命名空间，需要重新配置Key，不跨目录读取原Key。
- 维护者此前演示记录在开发目录`.test-runtime/browser`；候选包不包含这些私人记录，不自动合并。若确需打开原记录，先备份并关闭占用该目录的开发服务，再显式指向原数据目录启动；不要同时运行两个写入进程。普通评委从空用户目录开始。
- 不要删除未知进程、数据库或模型来解决启动问题；日志仅供诊断，提交问题前检查并去除个人信息。

## 限制

仅本机单用户。没有安装器/自动更新/代码签名，SmartScreen或杀毒可能提示未知发行者；SHA只能校验文件一致性，不能替代签名。模型建议不代表事实验证，ASR需人工校对。实际测试与未验项见Release-Notes.md及项目docs/releases/TEST_REPORT.md。
