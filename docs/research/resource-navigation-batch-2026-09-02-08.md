# 资源导航开源应用候选核验（2026-09-02，第 8 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按不区分大小写的完整 URL 与标题检查，以下 6 个主维护 GitHub 仓库均未收录。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库 README 证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · 机器人 | Open-RMF | [open-rmf/rmf](https://github.com/open-rmf/rmf) | ROS 2 多机器人调度平台｜Ubuntu、RHEL / Fedora；amd64、aarch64；二进制包或源码安装 | [README](https://github.com/open-rmf/rmf#readme) 将其定义为多机器人车队管理平台，列出 ROS 2 Humble、Jazzy、Kilted、Rolling 支持，以及 Ubuntu Debian 包、部分 RHEL / Fedora RPM 和源码构建方式；适合补充多厂商车队、任务与设施协同。 |
| 开源应用 · 生命科学 | OpenMS | [OpenMS/OpenMS](https://github.com/OpenMS/OpenMS) | LC-MS 分析工具集、桌面可视化与 C++ / Python 库｜Windows、macOS、Linux；Conda 或源码安装 | [README](https://github.com/OpenMS/OpenMS#readme) 将其定义为 LC-MS 数据管理和分析软件库，提供 150 多个蛋白质组与代谢组分析工具、TOPPView 可视化、pyOpenMS 绑定，并明确支持 Windows、macOS、Linux；适合补充质谱数据处理与可复现分析。 |
| 开源应用 · 低代码内建 | NocoBase | [nocobase/nocobase](https://github.com/nocobase/nocobase) | 自托管无代码业务系统平台｜Node.js CLI 与 Web 管理界面 | [README](https://github.com/nocobase/nocobase#readme) 将其定义为开源 AI + 无代码业务系统平台，提供所见即所得界面，可视化配置数据模型、页面、工作流和权限，并给出 `@nocobase/cli` 安装及 `nb init --ui` 初始化流程；适合补充可扩展的内部业务应用搭建。 |
| 开源应用 · 可观测性 | Uptrace | [uptrace/uptrace](https://github.com/uptrace/uptrace) | 自托管 OpenTelemetry APM｜Docker 本地部署；ClickHouse 与 PostgreSQL 存储 | [README](https://github.com/uptrace/uptrace#readme) 说明它统一处理分布式追踪、指标和日志，提供查询、仪表盘、告警、通知及多种采集集成，并给出 Docker 本地运行入口；适合补充面向应用性能与故障定位的完整可观测平台。 |
| 开源应用 · 文档归档 | ArchiveBox | [ArchiveBox/ArchiveBox](https://github.com/ArchiveBox/ArchiveBox) | 自托管 Web 归档应用、CLI 与 API｜Docker、Linux、macOS；浏览器 Web 界面 | [README](https://github.com/ArchiveBox/ArchiveBox#readme) 将其定义为自托管网页归档工具，可保存 HTML、PNG、PDF、TXT、JSON、WARC 和 SQLite 等开放格式，提供 Docker、命令行、REST API、Webhooks 与 Web 界面；适合补充网页资料、研究来源和在线证据的长期留存。 |
| 开源应用 · 天文观测 | INDI Library | [indilib/indi](https://github.com/indilib/indi) | 天文设备控制服务器、驱动与客户端库｜Linux、macOS、Windows 构建；Debian / Ubuntu、Arch 安装依赖 | [README](https://github.com/indilib/indi#readme) 将 INDI 定义为天文仪器控制标准的开源实现，包含服务器、设备驱动和跨平台客户端库，支持赤道仪、CCD / CMOS、单反、调焦器、滤镜轮、圆顶、GPS 与气象站，并给出 CMake 安装流程；适合补充观测设备联动与自动化控制底层。 |

## 建议目录描述

- `Open-RMF`：ROS 2 多机器人车队管理平台｜Ubuntu、RHEL / Fedora｜协调不同机器人、任务和设施资源，可安装二进制包或从源码构建。
- `OpenMS`：跨平台 LC-MS 分析工具集｜Windows、macOS、Linux｜处理蛋白质组与代谢组质谱数据，并提供 TOPPView 和 Python 绑定。
- `NocoBase`：自托管无代码业务系统平台｜用数据模型、页面、工作流、权限和插件搭建可扩展内部应用。
- `Uptrace`：Docker 自托管 OpenTelemetry APM｜集中查看追踪、指标和日志，并配置仪表盘、告警与通知。
- `ArchiveBox`：Docker 或 CLI 自托管网页归档｜将网页保存为 HTML、PDF、WARC 等开放格式，并通过 Web 界面检索管理。
- `INDI Library`：跨平台天文设备控制服务器与驱动库｜连接赤道仪、相机、调焦器、滤镜轮和圆顶等观测硬件。

## 核验边界

- 项目用途、安装形态与平台仅采用各主仓库 README；目录写入前仍需复核对应版本的发行说明和安装文档。
- Open-RMF 依赖受支持的 ROS 2 发行版；不同操作系统、架构和软件源的包覆盖并不完全相同。
- OpenMS 是科研分析工具链，不替代实验设计、质控、统计验证或临床诊断。
- NocoBase 的社区版、商业插件和 AI 功能边界可能不同；“开源”描述只对应主仓库所发布代码。
- Uptrace 自托管需要维护 OpenTelemetry 采集链路、ClickHouse、PostgreSQL、容量和访问控制。
- ArchiveBox 保存公开或私有网页不自动取得复制、传播或作为法律证据使用的权利。
- INDI 提供控制协议、服务器和驱动；具体硬件是否兼容应以驱动清单、固件和实际设备测试为准。
- 实际写入目录前应再次执行规范化 URL 与标题去重，并复核仓库最新维护状态、稳定发行版、许可证和安全公告。
