# 开源应用补充与安全资料核验

核对日期：2026-10-15。新增 4 项，沿用现有分类；优先选择公开源码、明确开源许可证、可追溯官方发布及维护记录的项目。目录链接统一指向项目仓库，不使用第三方下载站。

## 核验边界

核查了官方 README、许可证说明、最新 Releases、安全政策及公开安全公告页面。没有下载或运行安装包，没有进行病毒扫描、签名验证、源码审计或可复现构建比对，因此不能证明任何安装包“无病毒”。公开安全公告为空也不等于没有漏洞。本机 Python 请求 GitHub API 遇到 TLS 证书校验失败，未关闭证书校验；以下记录依据可读取的官方网页，不声称 API 核验成功。

## 收录项目

| 项目与官方源码 | 许可证 | 核验时 latest 发布 | 安全与使用说明 |
| --- | --- | --- | --- |
| [Stats](https://github.com/exelban/stats) | MIT | [v3.0.21](https://github.com/exelban/stats/releases/tag/v3.0.21)，页面显示 10 月 11 日 | 发布说明包含 SMC helper 授权绕过修复，选最新修复版；Remote 功能将指标传到账号，不能描述成所有功能均离线。风扇控制处于 legacy 状态，本批不推荐其用途。 |
| [CotEditor](https://github.com/coteditor/CotEditor) | 源码 Apache-2.0；图像资源另有 CC BY-NC-ND 4.0 条件 | [7.1.2](https://github.com/coteditor/CotEditor/releases/tag/7.1.2)，页面显示 10 月 12 日 | 7.1.2 修复特制应用路径造成的非预期命令执行；该版本要求 macOS 26+，旧系统不可直接套用。未审计应用脚本与扩展。 |
| [MeetingBar](https://github.com/leits/MeetingBar) | Apache-2.0 | [v4.11.6](https://github.com/leits/MeetingBar/releases/tag/v4.11.6)，页面显示 6 月 13 日 | 修复 Google Calendar 集成，仓库仍有后续提交；日历与会议地址可能含敏感信息，按功能授权。未登录 Google 或实测同步。 |
| [Dangerzone](https://github.com/freedomofpress/dangerzone) | AGPL-3.0 | [v0.11.0](https://github.com/freedomofpress/dangerzone/releases/tag/v0.11.0)，页面显示 7 月 2 日 | 发布包含安全修复；隔离转换文档，不是通用杀毒软件。更新应用和容器镜像，初始获取与更新可能联网，转换可能丢失链接、表单和签名语义。 |

## 安全来源

- [Stats 安全页](https://github.com/exelban/stats/security)：页面没有独立安全政策，列有 Critical 历史公告 [GHSA-qwhf-px96-7f6v](https://github.com/exelban/stats/security/advisories/GHSA-qwhf-px96-7f6v)，影响至 v2.11.20，修复版本为 v2.11.21；v3.0.21 又包含 helper 校验修复，不能只按历史最低修复版本下载。未完成安装包检测。
- [CotEditor 安全页](https://github.com/coteditor/CotEditor/security)：有私密漏洞报告政策，仅支持最新稳定版的安全修复；列有 High 公告 [GHSA-7x4c-v6p7-83f8](https://github.com/coteditor/CotEditor/security/advisories/GHSA-7x4c-v6p7-83f8)，与 7.1.2 发布说明交叉核对。
- [MeetingBar 安全页](https://github.com/leits/MeetingBar/security)：有安全报告政策；未把未列出公告解释为无漏洞。
- [Dangerzone 安全政策](https://github.com/freedomofpress/dangerzone/security)：说明无网络非特权容器隔离、第三方依赖和镜像更新策略。
- [Dangerzone GHSA-pvwq-6vpp-2632](https://github.com/freedomofpress/dangerzone/security/advisories/GHSA-pvwq-6vpp-2632)：历史 CLI ANSI 转义问题影响 <0.4.2，公告列出修复版本 0.4.2；不能因此声称其他版本没有风险。

## 本批未收录

- [Pearcleaner](https://github.com/alienator88/Pearcleaner)：README 声明无限期暂停维护，且定位 source-available / fair-code，不作为本批标准开源推荐。
- [Mac Mouse Fix](https://github.com/noah-nuebling/mac-mouse-fix)：3.x 使用带额外限制的自定义许可，本批采用更清晰的标准开源许可筛选。
- [Keka](https://github.com/aonez/Keka)：当前仓库不足以确认完整现行应用源码与标准开源许可，不因有 GitHub 仓库就收录。
- [Latest](https://github.com/mangerlahn/Latest)：本批优先其他维护和安全资料更直接的项目，未将其判定为恶意软件。
- [AltTab](https://github.com/lwouis/alt-tab-macos)：仓库资料与本次官网返回的 Pro 产品页需进一步核对分发关系，暂不加入，未作恶意判定。

安装时从仓库说明进入官方发布渠道，核对系统版本、签名或公证与可用的校验值，保留系统安全检查；若安装包触发安全警报，不以目录收录为由绕过。

## 第二批：跨平台本地工具

核对日期：2026-10-15；新增 2 项，两批累计新增 6 项。全目录按名称与仓库地址去重，未安装应用或下载发布包。

| 项目与源码 | 许可与用途 | 维护与分发证据 | 安全核验结果与边界 |
| --- | --- | --- | --- |
| [Pinta](https://github.com/PintaProject/Pinta) | 原创代码 MIT；含 Paint.NET 来源代码及图标的各自声明，Windows、macOS、Linux 图像编辑 | [3.1.2 发布页](https://github.com/PintaProject/Pinta/releases/tag/3.1.2)，页面显示 4 月 2 日，有后续提交；发布页给出源码包 GPG 与 SHA-512 校验方式 | [安全页](https://github.com/PintaProject/Pinta/security)未配置 SECURITY.md、未列公开公告；只表示该页状态，不能证明没有漏洞。未实际验证下载文件、签名或校验值。 |
| [QOwnNotes](https://github.com/pbek/QOwnNotes) | GPL-2.0，本地纯文本 Markdown 笔记和待办；可选云集成与脚本 | [v26.10.6 发布页](https://github.com/pbek/QOwnNotes/releases/tag/v26.10.6)，页面显示 10 月 13 日；提供 Windows、macOS 和 Linux 发布文件，部分附 SHA-256 文件 | [安全页](https://github.com/pbek/QOwnNotes/security)未配置 SECURITY.md、未列公开公告。脚本、同步后端和第三方扩展增加额外信任边界；未实测脚本、同步或安装包。 |

本批暂缓：

- [Notesnook 安全页](https://github.com/streetwriters/notesnook/security)列出 5 条 2026 年公开公告，包含笔记导出和 Web Clipper 渲染的 Critical RCE。本轮尚未逐条核对受影响组件与修复版本，暂不收录，不将加密宣传当作无病毒证明。
- [TagSpaces](https://github.com/tagspaces/tagspaces)公开部分采用 AGPL-3.0，但 README 明确 Pro 组件是专有许可，当前组合分发需另核对，本批不混称完整应用全部开源。
- [LazPaint](https://github.com/bgrabitmap/lazpaint)有 GPL-3.0 源码和发布记录，但本次安全页读取失败，暂未补齐安全资料，不作恶意判断。

验收：目录现有测试验证字段、分类及 URL 唯一性、安全 HTTP(S) 协议、搜索与收藏解析，以及 Vite 虚拟目录与 YAML 一致性。这些测试只证明导航数据结构与加载，不证明被链接软件安全。

## 第三批：扫描办公与开发编辑

核对日期：2026-10-15。新增 2 项，三批累计新增 8 项；沿用现有 OCR 文字识别及开发数据分类。已按项目名和仓库地址检查存量，没有重复产品。

| 项目与源码 | 许可、用途与平台 | 发布与安全证据 | 使用边界 |
| --- | --- | --- | --- |
| [NAPS2](https://github.com/cyanfish/naps2) | 应用 GPL-2.0-or-later；部分 SDK 子项目另有 LGPL 选项；Windows、macOS、Linux 扫描、页面整理与 Tesseract OCR | [v8.5.1](https://github.com/cyanfish/naps2/releases/tag/v8.5.1)页面显示 10 月 12 日，修复 Windows Smart App Control 阻止 naps2_jpeg.dll；[官方扫描下载页](https://www.naps2.com/download)与仓库互相对应；[安全页](https://github.com/cyanfish/naps2/security)未配置 SECURITY.md、未列公开公告 | 未连接扫描仪、未安装驱动、未扫描安装包；驱动、OCR 语言包与网络扫描设备有独立信任边界。安全控制警报应核对版本与签名，不建议关闭系统检查。 |
| [VSCodium](https://github.com/VSCodium/vscodium) | MIT，Code-OSS 社区自动构建；Windows、macOS、Linux | [1.140.06880](https://github.com/VSCodium/vscodium/releases/tag/1.140.06880)页面显示 10 月 13 日，更新上游与构建依赖；[安全页](https://github.com/VSCodium/vscodium/security)未配置 SECURITY.md、未列公开公告 | 默认关闭微软遥测不等于所有插件均不联网；使用 Open VSX，部分微软扩展有许可和兼容限制。扩展与工作区任务可执行代码，独立审查其来源。不声称上游 Code-OSS/Electron 无漏洞。 |

本批未扫描二进制、未验证本地签名、公证或发布文件哈希；安全页未列公告不代表无漏洞。Strawberry 与 Notepad Next 已在目录，未重复添加。
