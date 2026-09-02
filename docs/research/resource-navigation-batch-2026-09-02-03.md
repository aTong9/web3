# 资源导航开源应用候选核验（2026-09-02，第 3 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按不区分大小写的完整 URL 检查，以下 6 个主仓库均未收录，且当前均未归档。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库 README 证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · 团队沟通 | Nextcloud Talk | [nextcloud/spreed](https://github.com/nextcloud/spreed) | 可自托管 Nextcloud 应用 / Web 通信服务｜服务端、浏览器与 Nextcloud 客户端 | README 明确提供文字聊天、私聊与群组通话、公开或密码保护会议、跨服务器联邦聊天、屏幕共享，并与 Files、Calendar 等 Nextcloud 应用集成；生产环境可从 Nextcloud App Store 启用。适合补充组织自托管的消息和音视频协作。 |
| 开源应用 · 写作出版 | HedgeDoc | [hedgedoc/hedgedoc](https://github.com/hedgedoc/hedgedoc) | 可自托管协作写作 Web 应用｜服务器、浏览器 | README 将其定义为实时协作 Markdown 笔记工具，并直接提供自行安装指南；适合多人共同撰写、审阅和发布 Markdown 内容。仓库说明当前 `develop` 为 HedgeDoc 2 开发分支，稳定维护版仍在 `master`，实际收录描述不应暗示 2.0 已稳定。 |
| 开源应用 · 游戏互动 | Ren'Py | [renpy/renpy](https://github.com/renpy/renpy) | 可安装视觉小说引擎与 SDK｜Windows、macOS、Linux；可生成 Android、iOS、Web 运行组件 | README 将其定义为 Visual Novel Engine，并说明目标是提供创作视觉小说及相近交互形式的工具；仓库构建说明覆盖 Linux、macOS、Windows，且发行构建含 Android、iOS、Web 运行组件。适合补充叙事游戏与分支互动内容制作。 |
| 开源应用 · 服务器运维 | Beszel | [henrygd/beszel](https://github.com/henrygd/beszel) | 可自托管轻量监控平台｜Web Hub、主机 Agent、Docker 镜像 | README 明确其包含 Docker 统计、历史数据和告警，架构由集中展示与管理的 Web Hub 及运行在被监控系统上的 Agent 组成；可监控主机、Docker/Podman、磁盘、网络、GPU、ZFS 等指标，并提供官方快速安装指南。适合补充轻量服务器与容器状态监控。 |
| 开源应用 · 地图出行 | Marble | [KDE/marble](https://github.com/KDE/marble) | 可安装虚拟地球与世界地图桌面应用｜KDE / 桌面端 | README 将 Marble 定义为用于认识地球及其他行星的虚拟地球和世界地图，并链接项目官方稳定发行入口；适合补充桌面地图浏览、地理探索和出行前区域认知。 |
| 开源应用 · 自动化集成 | Automatisch | [automatisch/automatisch](https://github.com/automatisch/automatisch) | 可自托管业务流程自动化 Web 应用｜服务器、Docker Compose | README 将其定义为开源 Zapier 替代方案，可连接 Twitter、Slack 等服务自动化业务流程，并强调数据可保存在自有服务器；主仓库给出 `docker compose up` 安装方式。适合补充 SaaS 连接、事件触发和无代码业务集成。 |

## 核验边界

- 功能、安装形态与平台以各项目主仓库 README 及其直接链接的官方安装入口为依据，不采用镜像或第三方聚合列表。
- `Ren'Py` 的移动端与 Web 表述是可生成的运行组件，不等同于这些平台上提供完整编辑器。
- `Marble` README 只明确桌面项目及稳定发行入口，本批不扩张声明具体操作系统清单。
- 实际写入目录前应再次执行规范化 URL 和标题去重，并复核最新 release、系统要求、许可证及安全公告。
