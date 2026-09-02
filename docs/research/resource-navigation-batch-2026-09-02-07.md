# 资源导航开源应用候选核验（2026-09-02，第 7 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按不区分大小写的完整 URL 与标题检查，以下 6 个主维护 GitHub 仓库均未收录。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库 README 证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · 移动设备 | Lemuroid | [Swordfish90/Lemuroid](https://github.com/Swordfish90/Lemuroid) | Android 应用｜Android 手机、平板与 Android TV | [README](https://github.com/Swordfish90/Lemuroid#readme) 将其定义为基于 Libretro 的 Android 开源模拟器，列出触控、手柄、本地多人、存档恢复、ROM 扫描和 Android TV 支持；适合补充移动端复古游戏管理与运行。 |
| 开源应用 · 终端效率 | Atuin | [atuinsh/atuin](https://github.com/atuinsh/atuin) | 命令行与终端 TUI，可选自托管同步服务｜Linux、macOS、Windows；Bash、Zsh、Fish、Nushell、Xonsh、PowerShell | [README](https://github.com/atuinsh/atuin#readme) 说明它以 SQLite 记录带目录、退出码和耗时等上下文的 Shell 历史，提供全屏搜索、端到端加密同步及自托管服务器选项，并列出支持的 Shell 和安装入口；适合补充跨会话命令检索与历史同步。 |
| 开源应用 · 字体排版 | HarfBuzz | [harfbuzz/harfbuzz](https://github.com/harfbuzz/harfbuzz) | 文本塑形库与命令行工具｜跨平台，Meson / CMake 构建 | [README](https://github.com/harfbuzz/harfbuzz#readme) 将其定义为 OpenType 文本塑形引擎，并列出 `hb-shape`、`hb-view`、`hb-subset`、`hb-info` 等命令行工具，用于字形布局、渲染、字体子集化和元数据查看；适合补充复杂文字排版底层与字体诊断工具链。 |
| 开源应用 · 工程仿真 | OpenMDAO | [OpenMDAO/OpenMDAO](https://github.com/OpenMDAO/OpenMDAO) | Python 工程分析与优化框架｜Windows、macOS、Linux；PyPI 或源码安装 | [README](https://github.com/OpenMDAO/OpenMDAO#readme) 将其定义为系统分析和多学科优化的高性能计算平台，支持耦合模型、解析导数、并行数值方法、梯度与无梯度优化，并给出 PyPI 与 GitHub 两种安装方式；适合补充复杂工程系统的建模、参数探索和设计优化。 |
| 开源应用 · 公共数据 | PortalJS | [datopian/portaljs](https://github.com/datopian/portaljs) | 可自托管数据门户框架与脚手架 CLI｜Node.js 22+、Next.js | [README](https://github.com/datopian/portaljs#readme) 将其定义为构建数据门户的开源框架，使用 `npm create portaljs@latest` 生成首页、数据目录和数据集展示页，可加载 CSV / JSON 并连接 CKAN、GitHub、Frictionless 等后端；适合补充公共数据门户的发现、展示和发布前端。 |
| 开源应用 · 社区社交 | Misskey | [misskey-dev/misskey](https://github.com/misskey-dev/misskey) | 自托管联邦社交平台｜Node.js 服务端，可用 Docker Compose 部署 | [README](https://github.com/misskey-dev/misskey#readme) 将其定义为免费开源、联邦式社交媒体平台；主项目的 [Docker Compose 安装文档](https://github.com/misskey-dev/misskey-hub/blob/main/src/en/docs/install/docker.md) 给出从该仓库克隆、配置、构建、初始化和后台启动实例的完整命令；适合补充可独立运营并跨实例互联的社区动态服务。 |

## 建议目录描述

- `Lemuroid`：Android 应用｜手机、平板与 Android TV｜基于 Libretro 管理和运行复古游戏，支持触控、手柄、本地多人及存档恢复。
- `Atuin`：跨平台命令行与终端 TUI｜用 SQLite 保存可检索的 Shell 历史，并可端到端加密同步或自托管同步服务。
- `HarfBuzz`：跨平台文本塑形库与命令行工具｜处理 OpenType 字形布局、字体查看、子集化与元数据诊断。
- `OpenMDAO`：Python 工程分析与优化框架｜Windows、macOS、Linux｜构建耦合多学科模型并执行并行设计优化。
- `PortalJS`：Node.js 数据门户框架与脚手架 CLI｜生成数据目录和展示页，并连接文件、GitHub、CKAN 等数据源。
- `Misskey`：Docker Compose 自托管联邦社交平台｜运营独立社区动态服务并通过联邦协议连接其他实例。

## 核验边界

- 功能、安装形态与平台采用项目主仓库 README；Misskey 的部署步骤采用主项目官方文档仓库，并明确指向主代码仓库。
- Lemuroid 只提供模拟器前端能力；目录描述不暗示附带游戏 ROM、固件或使用权。
- Atuin 的云同步、自托管同步和完全离线是不同部署选择；目录不承诺第三方服务器的可用性。
- HarfBuzz 是排版引擎与工具链，不是完整桌面字体设计器或页面排版应用。
- OpenMDAO 是工程建模与优化框架；数值结果仍取决于用户模型、求解器配置和验证过程。
- PortalJS 生成和呈现数据门户，但不等同于数据本身的官方性、质量或许可已经验证。
- Misskey 自托管需要管理员维护数据库、域名、反向代理和升级；联邦互联不代表其他实例的内容经过审核。
- 实际写入目录前应再次执行规范化 URL 与标题去重，并复核仓库最新维护状态、稳定发行版、许可证和安全公告。
