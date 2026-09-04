# 资源导航第 74 批候选核验（2026-09-04）

本批补充自动化集成、语音处理、去中心化通信，写入前各 7 项。完整 `src/data/webstack.yml` 检索 `stackstorm|silero|toxic|JFreegman` 无匹配，项目名、维护者与主仓 URL 未发现重复。Toxic 与已有 qTox 共享协议，但属于独立的终端客户端，不是别名。只核验第一方资料，未安装运行，不推测维护日期，不构成安全审计。

| 分类 | 项目与第一方证据 | 形态、许可与范围 | 建议中文描述 |
| --- | --- | --- | --- |
| 开源应用 · 自动化集成 | [StackStorm 主仓与 README](https://github.com/StackStorm/st2)、[Apache-2.0 LICENSE](https://github.com/StackStorm/st2/blob/master/LICENSE) | Linux 自托管事件驱动自动化服务；README 给出 64 位 Linux 安装入口，传感器、规则、动作与工作流连接外部服务，可经 CLI、API 与 Web UI 操作并记录执行审计。 | Linux 自托管事件驱动自动化平台｜通过传感器、规则和工作流连接服务、脚本与运维动作；安装前审查脚本，限制凭据和执行权限，保护接口并保留审计日志。 |
| 开源应用 · 语音处理 | [Silero VAD 主仓与 README](https://github.com/snakers4/silero-vad)、[MIT LICENSE](https://github.com/snakers4/silero-vad/blob/master/LICENSE) | 可用 pip 安装的 Python 语音活动检测库，提供 PyTorch 与 ONNX 模型，提取语音片段时间戳；平台取决于推理运行时支持，Python 示例列出 x86-64 要求，其他架构 ONNX 使用需适配输入输出与后处理。不是语音转写工具。 | 本地 Python 语音活动检测库｜通过 pip 安装，以 PyTorch 或 ONNX 提取音频中的语音片段时间戳；需匹配运行时与音频后端，不负责转写，录音处理须获授权并保护原始音频。 |
| 开源应用 · 去中心化通信 | [Toxic 主仓与 README](https://github.com/JFreegman/toxic)、[GPL-3.0 LICENSE](https://github.com/JFreegman/toxic/blob/master/LICENSE)、[安装文档](https://github.com/JFreegman/toxic/blob/master/INSTALL.md) | Tox 协议终端点对点客户端，提供加密消息、文件与音视频功能；安装文档涵盖 Linux 依赖、macOS 和 FreeBSD 源码编译说明，音视频依赖可选。README 说明可启用日志，也支持关闭 UDP/直接连接。 | Linux、macOS 与 FreeBSD 终端点对点聊天客户端｜从源码构建，基于 Tox 发送消息、文件并提供可选音视频；核对联系人身份，保护本地配置和聊天日志，不将加密通信等同于匿名。 |

权限、日志保护和录音授权是基于功能提出的使用建议，不是已验证的安全保障。目录写入、解析去重和页面验收由主任务执行。
