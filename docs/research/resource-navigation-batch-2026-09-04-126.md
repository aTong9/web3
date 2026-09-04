# 资源导航补充研究 · Batch 126

核验日期：2026-09-04。仅研究 3 项；未修改 YAML、安装模型/软件、连接账户、运行服务或上传资料。

## 去重与选择

读取本地 AI、开发数据、团队沟通分类，检索完整 `src/data/webstack.yml` 中 llama.cpp / ggerganov/llama / llama.app、SQLPage / lovasoa/sqlpage、Mumble / Murmur，均无匹配。已有 whisper.cpp、Aider、Datasette、Zulip 等未重复加入。分别补直接控制推理底层、SQL 驱动内部工具、低延迟语音频道；不是已有产品包装器。

## 开源应用 · 本地 AI

```yaml
- title: llama.cpp
  logo: finance.png
  url: https://github.com/ggml-org/llama.cpp
  description: C/C++ 本地模型推理工具｜以命令行或 API 服务运行量化模型并选择 CPU/GPU 后端；模型许可与内存需求另核对，保护服务入口并复核生成结果。
```

- [官方仓库](https://github.com/ggml-org/llama.cpp)：MIT 许可标识，C/C++ 推理、量化、CPU/GPU 混合、Apple Metal、CUDA 等后端，以及命令行和 OpenAI 兼容服务入口。区别于 Ollama 的模型管理层及 llamafile 单文件分发。
- [官方发行页](https://github.com/ggml-org/llama.cpp/releases)有预编译版本；README 另列容器和源码构建指南。不保证每个系统/设备均支持所有后端。
- 本地运行不代表下载模型、远程 API 或服务部署全程离线；框架 MIT 不覆盖下载模型的权重许可，也不保证模型真实性和生成准确性。自备硬件、云实例可能产生费用。

## 开源应用 · 开发数据

```yaml
- title: SQLPage
  logo: finance.png
  url: https://github.com/sqlpage/SQLPage
  description: MIT 开源数据应用构建器｜Windows、macOS、Linux 或 Docker 自托管，将 SQL 文件变成表格、图表与表单；限制数据库权限，审查写入查询并保护连接凭据。
```

- [官方仓库](https://github.com/sqlpage/SQLPage)：MIT，Rust Web 服务，将 SQL 查询转成页面组件，可执行读写查询；支持 SQLite、PostgreSQL、MySQL 等。不是数据库引擎或数据库 GUI。
- [发布页](https://github.com/sqlpage/SQLPage/releases)：官方二进制及版本历史。README 提供 Linux/macOS/Windows 包和容器；预编译可执行文件仅 x86_64，其他架构可选所提供的容器，不能泛称所有架构原生包。
- 网络请求与数据库写入由应用查询/配置决定，必须配置认证和最小权限。开源许可不含外部数据库、云托管或运维费用；未运行 README 的示例查询。

## 开源应用 · 团队沟通

```yaml
- title: Mumble
  logo: finance.png
  url: https://github.com/mumble-voip/mumble
  description: Windows、macOS、Linux 低延迟语音聊天｜客户端连接可自托管服务器，适合持续语音协作；核对服务器可信度与频道权限，录音前取得参与者同意。
```

- [官方仓库](https://github.com/mumble-voip/mumble)：Qt/Opus 语音客户端和 mumble-server（旧名 Murmur），客户端覆盖上述平台及 BSD；服务器自托管。补语音优先工作方式，不再添加文字消息平台。
- [许可证原文](https://github.com/mumble-voip/mumble/blob/master/LICENSE)：三条 BSD 风格条件，保留声明、二进制附带许可和不得冒用作者背书；卡片仅称开源，不把单一许可推广至全部依赖。
- [官方发布页](https://github.com/mumble-voip/mumble/releases)可读；README 区分稳定发行与 master 不稳定开发代码，并链接官方服务端容器。macOS 客户端与服务端分开分发。
- 不把客户端到服务器的安全连接误写成所有参与者间端到端加密保证；服务器、频道权限、日志和录音需要单独管理。第三方托管可收费，开源客户端不等于免费服务器资源。未连接公共语音服务器或录音。

## 限制

第一方仓库、许可证与发行记录核验，不是运行、安全或性能测试；不承诺零遥测、默认配置安全、全部架构兼容或后续维护时效。
