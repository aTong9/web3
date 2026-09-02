# 资源导航第 20 批主仓库核验（2026-09-02）

## 范围与方法

- 目标分类：容器云、无人机、教育平台、会议活动、实验室管理、邮件服务器，各补 1 项。
- 读取 `src/data/webstack.yml` 后，将标题转小写、URL 转小写并移除末尾 `/` 做全文件去重；现有 2,414 项、2,414 个规范化 URL，零重复。下列 6 个标题和 URL 均未收录。
- 只采信项目主仓库 README、许可证、GitHub Releases、提交记录和官方文档。维护日期是核验时的 GitHub 状态，不代表长期支持承诺。

## 推荐结果

### 开源应用 · 容器云 — Rancher

- 主仓库：<https://github.com/rancher/rancher>
- 形态与适配：可自托管的 Kubernetes 管理平台；主仓库 README 提供 Docker 快速启动和 Kubernetes/Helm 安装入口，适合补充现有编排器与集群管理工具。
- 许可证与维护：Apache-2.0；非归档。主仓库于 2026-09-01 仍有推送，v2.15.1 于 2026-08-28 发布。
- 一手来源：[README 与许可证](https://github.com/rancher/rancher)、[v2.15.1](https://github.com/rancher/rancher/releases/tag/v2.15.1)、[提交记录](https://github.com/rancher/rancher/commits/main/)。
- 建议文案：`Kubernetes 集群管理平台｜自托管管理集群、工作负载、权限、应用目录和多集群运维。`

### 开源应用 · 无人机 — MAVProxy

- 主仓库：<https://github.com/ArduPilot/MAVProxy>
- 形态与适配：Python 编写的 MAVLink 代理与命令行地面站，可在 Windows、macOS 和 Linux 使用；仅描述开发、遥测和地面站软件用途，不构成飞行安全或法规合规保证。
- 许可证与维护：GPL-3.0-or-later；非归档。主仓库于 2026-08-30 仍有推送，提交记录显示 2026 年持续维护。
- 一手来源：[README、许可证与维护者](https://github.com/ArduPilot/MAVProxy)、[提交记录](https://github.com/ArduPilot/MAVProxy/commits/master/)、[官方文档](https://ardupilot.org/mavproxy/)。
- 建议文案：`跨平台 MAVLink 命令行地面站｜转发遥测连接、加载模块并辅助无人机开发与地面测试。`

### 开源应用 · 教育平台 — OpenOLAT

- 主仓库：<https://github.com/OpenOLAT/OpenOLAT>
- 形态与适配：Java 自托管学习管理系统，仓库和官方文档提供生产安装、管理员、用户与开发指南，覆盖课程、测评、协作和学习管理。
- 许可证与维护：Apache-2.0；非归档。主仓库于 2026-09-01 仍有推送，版本号已进入 21.1-SNAPSHOT。
- 一手来源：[README](https://github.com/OpenOLAT/OpenOLAT)、[许可证](https://github.com/OpenOLAT/OpenOLAT/blob/master/LICENSE)、[官方文档](https://docs.openolat.org/)、[提交记录](https://github.com/OpenOLAT/OpenOLAT/commits/master/)。
- 建议文案：`Java 自托管学习管理系统｜组织课程、测评、学习路径、协作空间和教学管理。`

### 开源应用 · 会议活动 — Conference Hall

- 主仓库：<https://github.com/conference-hall/conference-hall>
- 形态与适配：可自行部署的会议与 Meetup 征稿平台；README 覆盖 CFP、讲者提交、评审、通知、日程和导出，并给出 Node、PostgreSQL、Redis 与 Docker 的本地运行步骤。
- 许可证与维护：AGPL-3.0；非归档。提交记录显示 2026-08-29 仍在更新。
- 一手来源：[README 与部署步骤](https://github.com/conference-hall/conference-hall)、[许可证](https://github.com/conference-hall/conference-hall/blob/main/LICENSE.md)、[提交记录](https://github.com/conference-hall/conference-hall/commits/main/)。
- 建议文案：`可自托管会议征稿平台｜管理讲者、提案评审、录取通知、日程和活动数据导出。`

### 开源应用 · 实验室管理 — SciNote

- 主仓库：<https://github.com/scinote-eln/scinote-web>
- 形态与适配：可自托管的 Web 电子实验记录本，README 定位于集中管理实验工作与实验数据，仓库提供 Docker 与生产 Compose 文件；仅描述记录与协作功能，不暗示实验质量或认证合规。
- 许可证与维护：MPL-2.0；非归档。主仓库于 2026-09-01 仍有推送，1.49.1 于 2026-07-01 发布。
- 一手来源：[README 与许可证](https://github.com/scinote-eln/scinote-web)、[1.49.1](https://github.com/scinote-eln/scinote-web/releases/tag/1.49.1)、[提交记录](https://github.com/scinote-eln/scinote-web/commits/develop/)。
- 建议文案：`自托管电子实验记录本｜集中记录实验、任务、库存和研究数据，支持团队协作与追踪。`

### 开源应用 · 邮件服务器 — Modoboa

- 主仓库：<https://github.com/modoboa/modoboa>
- 形态与适配：Python/Django/Vue 自托管邮件托管与管理平台，整合 Postfix、Dovecot、管理面板、网页邮箱、日历和通讯录；官方安装器可在 Debian/Ubuntu 部署完整邮件栈。
- 许可证与维护：ISC；非归档。主仓库于 2026-09-01 仍有推送，2.9.3 于 2026-08-05 发布。
- 一手来源：[README 与功能](https://github.com/modoboa/modoboa)、[官方安装器](https://github.com/modoboa/modoboa-installer)、[2.9.3](https://github.com/modoboa/modoboa/releases/tag/2.9.3)、[提交记录](https://github.com/modoboa/modoboa/commits/master/)。
- 建议文案：`自托管邮件托管平台｜整合 Postfix、Dovecot、管理面板、网页邮箱、日历和通讯录。`

## 去重结论

候选 `Rancher`、`MAVProxy`、`OpenOLAT`、`Conference Hall`、`SciNote`、`Modoboa` 的规范化标题与规范化 GitHub URL 在当前全目录中均为 0 次命中，可各安全新增 1 项。
