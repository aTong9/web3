# 资源导航开源应用候选核验（2026-09-02，第 4 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按不区分大小写的完整 URL 与标题检查，以下 6 个官方或主维护 GitHub 仓库均未收录。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库 README 证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · 经营财务 | GnuCash | [Gnucash/gnucash](https://github.com/Gnucash/gnucash) | 可安装桌面复式记账应用｜GNU/Linux、FreeBSD、OpenBSD、macOS、Windows | [README](https://github.com/Gnucash/gnucash#readme) 将其定义为面向个人和小型企业的复式记账应用，并列出 Linux、BSD、macOS、Windows 构建平台；适合补充账户、交易和企业账务管理。该仓库由 GnuCash 官方组织维护，但 README 明确说明它是项目主源码库的 GitHub 镜像。 |
| 开源应用 · 数据分析 | Metabase | [metabase/metabase](https://github.com/metabase/metabase) | 可自托管商业智能与数据分析 Web 平台｜服务器、浏览器 | [README](https://github.com/metabase/metabase#readme) 将其定义为让公司成员向数据提问和学习的开源工具，明确提供自托管安装，并支持无 SQL 提问、查询、长期分析文档、指标和仪表板；适合补充团队级数据探索与可视化。 |
| 开源应用 · 照片管理 | Ente Photos | [ente-io/ente](https://github.com/ente-io/ente)（规范地址会跳转到 `ente/ente`） | 桌面、移动、Web 客户端与可自托管服务｜iOS、Android、F-Droid、Web、Linux、macOS、Windows | [README](https://github.com/ente-io/ente#readme) 说明单仓库包含各端客户端和服务端；Ente Photos 提供端到端加密、后台上传、人脸检测、语义搜索、私密分享和协作相册，并明确允许自行托管，适合补充加密照片备份与跨端图库管理。 |
| 开源应用 · 辅助阅读 | Speech Note | [mkiol/dsnote](https://github.com/mkiol/dsnote) | 可安装桌面与移动应用｜Linux、Sailfish OS | [README](https://github.com/mkiol/dsnote#readme) 将其定义为借助离线语音转文字、文字转语音和机器翻译进行记笔记、阅读与翻译的应用，并说明处理完全在本机完成；适合补充离线朗读、转写和翻译辅助。 |
| 开源应用 · 远程控制 | MeshCentral | [Ylianst/MeshCentral](https://github.com/Ylianst/MeshCentral) | 可自托管远程管理 Web 服务器与设备代理｜服务端覆盖 Windows、Linux、macOS，另有 Android Agent | [README](https://github.com/Ylianst/MeshCentral#readme) 说明用户可运行自己的 Web 服务器，通过安装代理管理局域网或互联网设备，并在浏览器中使用远程桌面、终端和文件管理；适合补充多设备自托管远程运维。 |
| 开源应用 · 备份恢复 | rdiff-backup | [rdiff-backup/rdiff-backup](https://github.com/rdiff-backup/rdiff-backup) | 可安装命令行备份工具｜Linux、Windows；支持本地、远程和两者间跨平台备份 | [README](https://github.com/rdiff-backup/rdiff-backup/blob/master/README.adoc) 说明其使用与 rsync 相同的高效协议，只保存反向增量差异，同时让最新备份保持为完整副本以便快速恢复；适合补充本地或远程增量备份工作流。 |

## 建议目录描述

- `GnuCash`：桌面应用｜Windows、macOS、Linux 与 BSD｜以复式记账管理个人及小型企业账户、交易和财务记录。
- `Metabase`：自托管商业智能平台｜连接数据源，让团队进行查询、可视化分析并共享仪表板。
- `Ente Photos`：桌面、移动、Web 与自托管服务｜端到端加密备份照片，支持搜索、人脸识别、私密分享和协作相册。
- `Speech Note`：Linux 与 Sailfish OS 应用｜在本机离线完成文字朗读、语音转写和机器翻译，辅助阅读与记录。
- `MeshCentral`：自托管远程管理平台｜通过设备代理在浏览器中访问远程桌面、终端和文件，管理局域网或互联网电脑。
- `rdiff-backup`：命令行｜Linux 与 Windows｜在本地或远程执行反向增量备份，使最新副本保持完整并可快速恢复。

## 核验边界

- 功能、安装形态与平台只采用项目主仓库 README；未把第三方软件目录、博客或 GitHub 搜索摘要作为功能证据。
- GnuCash 的 GitHub 地址是官方组织维护的镜像，不应描述成项目唯一源码上游。
- Ente Photos 同时提供托管订阅服务；“可自托管”仅表示仓库支持自行部署，不代表托管服务免费。
- rdiff-backup README 明确支持 Linux 与 Windows；FreeBSD 和 macOS 仅为用户成功使用报告，目录描述不扩张为正式平台保证。
- 实际写入目录前应再次执行规范化 URL 与标题去重，并复核仓库最新维护状态、发行版、许可证和安全公告。
