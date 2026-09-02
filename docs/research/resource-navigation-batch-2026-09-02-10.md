# 资源导航开源应用候选核验（2026-09-02，第 10 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按完整 GitHub URL 检查，以下 6 个主维护仓库均未收录。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库 README 证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · 语言翻译 | translateLocally | [XapaJIaMnu/translateLocally](https://github.com/XapaJIaMnu/translateLocally) | 本地离线翻译桌面 GUI 与 CLI｜Windows、Linux、macOS；自动构建包或源码构建 | 固定版本 [README](https://github.com/XapaJIaMnu/translateLocally/blob/1d0d382cd6c9085cb4b8144c4a8962d74ed609c8/README.md#L1-L20) 将其定义为在本机运行的 GUI 翻译工具，并提供 Windows、Linux、macOS 自动构建下载与源码构建命令；同一 README 的 [CLI 章节](https://github.com/XapaJIaMnu/translateLocally/blob/1d0d382cd6c9085cb4b8144c4a8962d74ed609c8/README.md#L79-L96) 给出命令行用法，适合补充无需把文本发往云端的本地机器翻译。 |
| 开源应用 · 族谱家史 | HuMo-genealogy | [HuubMons/HuMo-genealogy](https://github.com/HuubMons/HuMo-genealogy) | 自托管 Web 族谱系统｜PHP 与 MySQL 服务器、浏览器；发行包安装 | [README](https://github.com/HuubMons/HuMo-genealogy#readme) 将其定义为免费开源的 Web 族谱软件，说明其使用 PHP 与 MySQL，并提供当前发行版下载入口；适合补充自行部署和在线维护家族史资料的方案。 |
| 开源应用 · 博物档案 | AtoM | [artefactual/atom](https://github.com/artefactual/atom) | 自托管档案描述与公共检索 Web 应用｜Linux 服务器、浏览器；生产安装指南，Docker 或 Vagrant 开发环境 | [README](https://github.com/artefactual/atom#readme) 将 AtoM 定义为由 Artefactual 维护、支持标准化档案描述与访问的多语言、多馆藏 Web 应用；README 说明生产环境面向 Linux，并提供 Linux、Docker 和 Vagrant 安装入口，适合补充档案馆藏描述与公开检索。 |
| 开源应用 · 农业园艺 | OpenOlitor Docker Compose | [OpenOlitor/openolitor-docker-compose](https://github.com/OpenOlitor/openolitor-docker-compose) | 社区支持农业自托管管理平台｜Docker Compose；本地、服务器或云端部署 | 固定版本 [README](https://github.com/OpenOlitor/openolitor-docker-compose/blob/48ad3b19f745ef81070679ba64f80d1d9c252914/README.md#L1-L23) 说明可在本地、服务器或云端运行 OpenOlitor，并给出克隆仓库、`docker compose up` 和访问 Web UI 的完整启动流程；[用途说明](https://github.com/OpenOlitor/openolitor-docker-compose/blob/48ad3b19f745ef81070679ba64f80d1d9c252914/README.md#L27-L36) 表明一个实例可服务一个或多个 CSA 社群，适合补充农场订阅、成员门户与后台管理。 |
| 开源应用 · 能源电网 | VeraGrid | [SanPen/VeraGrid](https://github.com/SanPen/VeraGrid) | 电力系统规划与仿真桌面 GUI、Python 库和远程 API 服务｜Windows、Linux、macOS；安装包或 pip | [README](https://github.com/SanPen/VeraGrid#readme) 将其定义为电力系统规划与仿真软件，包含计算引擎、REST API 服务和图形界面，支持潮流、短路、随机分析及多类电网格式；README 给出 Windows 安装器和 `pip install VeraGrid`、`veragrid` 启动方式，适合补充可视化电网建模与分析。 |
| 开源应用 · 电子芯片 | Magic VLSI | [RTimothyEdwards/magic](https://github.com/RTimothyEdwards/magic) | 集成电路版图设计 GUI 与命令工具｜Unix/Linux 等源码构建环境；可安装 | 固定版本 [README](https://github.com/RTimothyEdwards/magic/blob/307e22af30f483bb52ec68118454002fb5864fe5/README.md#L12-L24) 指向下载、编译、安装和完整命令参考，并说明当前发行版由 Tim Edwards 维护；[安装说明](https://github.com/RTimothyEdwards/magic/blob/307e22af30f483bb52ec68118454002fb5864fe5/INSTALL#L1-L8) 给出 `./configure`、`make`、`make install` 流程，适合补充芯片版图编辑、DRC、提取与 GDS 工作流。 |

## 建议目录描述

- `translateLocally`：本地离线翻译桌面应用与 CLI｜提供 Windows、Linux、macOS 构建，可下载模型并在本机完成文本翻译。
- `HuMo-genealogy`：自托管 Web 族谱系统｜使用 PHP 与 MySQL 在线维护家族关系和家史资料，并提供发行包安装。
- `AtoM`：自托管档案描述与公共检索平台｜按档案标准管理多语言、多馆藏资料并向公众开放检索。
- `OpenOlitor Docker Compose`：社区支持农业自托管管理平台｜部署农场订阅、成员门户与后台服务，可运行于本地或服务器。
- `VeraGrid`：跨平台电力系统仿真 GUI 与 Python 库｜进行电网建模、潮流、短路、随机和规划分析。
- `Magic VLSI`：可安装的集成电路版图设计工具｜提供图形界面与命令流程，用于版图编辑、DRC、提取及 GDS 处理。

## 核验边界

- 项目用途、安装形态与平台优先采用各主仓库 README；目录写入前仍需复核对应版本的发行说明和安装文档。
- translateLocally 在本机运行模型，但翻译质量、语言覆盖、模型大小与硬件资源需求仍应按具体模型和版本实测。
- HuMo-genealogy 的生产部署需自行维护 PHP、MySQL、Web 服务器、备份、权限和更新；README 的发行包入口不等同于托管服务。
- AtoM 面向档案描述与公共访问；元数据标准选择、隐私、版权和公开范围仍需由馆藏机构自行核验。
- OpenOlitor 的 Docker Compose 示例便于试用和自托管，但公开部署仍需另行配置强密码、TLS、访问控制、备份与更新。
- VeraGrid 的模型输出取决于网络数据、参数和算法设置，不能替代电力系统专业校核、保护整定或运行决策。
- Magic VLSI 的版图检查和提取结果取决于工艺文件、规则与流程配置；流片前仍需按目标 PDK 和签核工具链验证。
- 实际写入目录前应再次执行规范化 URL 与标题去重，并复核仓库最新维护状态、稳定发行版、许可证和安全公告。
