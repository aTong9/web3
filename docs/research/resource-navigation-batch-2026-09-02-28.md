# 资源导航第 28 批一手来源核验

日期：2026-09-02

范围：为“IRC 客户端、XMPP 客户端、Matrix 客户端、日历客户端、RSS 阅读、通知服务”各筛选一个官方或主维护 GitHub 项目。已递归读取 `src/data/webstack.yml`，按 title 不区分大小写、URL 不区分大小写并忽略末尾斜杠检查；以下六项均未出现，六个目标分类当前各有 6 项。

## 推荐项目

### 1. 开源应用 · IRC 客户端 — Irssi

- 主仓库：https://github.com/irssi/irssi
- 形态与能力：面向类 Unix 环境的模块化终端聊天客户端，内置 IRC 支持，可用 Perl 脚本、主题和第三方协议模块扩展；README 提供源码与正式版本构建入口。[README](https://github.com/irssi/irssi#irssi) · [下载说明](https://irssi.org/download/)
- 许可证：GPL-2.0，并带项目 `COPYING` 所列 OpenSSL 链接例外。[COPYING](https://github.com/irssi/irssi/blob/master/COPYING)
- 维护信号：master 分支最近一次提交为 2026-01-27；最新正式版 1.4.5 发布较早，属于仍有维护但发布节奏偏慢的项目。[提交](https://github.com/irssi/irssi/commits/master/) · [Releases](https://github.com/irssi/irssi/releases)
- 通信边界：IRC 通常不提供默认端到端加密；TLS 只保护客户端到 IRC 服务器的链路。应启用 TLS/SASL、保护 NickServ/SASL 凭据和本地日志，只安装可信脚本，敏感内容不要仅因使用 TLS 就视为对服务器不可见。[TLS 配置](https://github.com/irssi/irssi/blob/master/docs/manual.txt#L325-L344) · [脚本目录](https://scripts.irssi.org/)
- 建议描述：`终端 IRC 客户端｜通过键盘连接多个网络和频道，并用 Perl 脚本、主题与模块扩展；IRC 通常不是端到端加密。`

### 2. 开源应用 · XMPP 客户端 — Psi

- 主仓库：https://github.com/psi-im/psi
- 形态与能力：Qt 桌面 XMPP 客户端，支持 GNU/Linux、Windows、macOS、FreeBSD、NetBSD 与 Haiku，可处理聊天、群组、文件分享、音视频，并通过相应插件使用 OpenPGP、OTR 或 OMEMO。[README](https://github.com/psi-im/psi#psi-ndash-qt-based-xmpp-client)
- 许可证：GPL-2.0，并带项目 `COPYING` 所列 Qt 与插件链接例外。[COPYING](https://github.com/psi-im/psi/blob/master/COPYING)
- 维护信号：README 明示开发集中于 master，Psi+ 作为滚动开发线；master 在 2026-09-01 仍有提交。[开发模型](https://github.com/psi-im/psi#development) · [提交](https://github.com/psi-im/psi/commits/master/)
- 加密边界：TLS 只保护客户端到服务器的传输；OMEMO、OpenPGP 与 OTR 依赖相应插件、双方能力和正确配置，并非所有会话自动端到端加密。服务器仍可能看到账号与通信元数据，应核验设备密钥并保护账号凭据。
- 建议描述：`跨平台 Qt XMPP 客户端｜管理聊天、群组、文件与音视频，并可通过插件启用 OMEMO 等加密；需核验会话是否真正端到端加密。`

### 3. 开源应用 · Matrix 客户端 — Element X iOS

- 主仓库：https://github.com/element-hq/element-x-ios
- 形态与能力：Element 官方下一代 Matrix 客户端，使用 SwiftUI 与 Matrix Rust SDK，目标平台为 iOS 18+；README 明示项目正被积极开发和支持。[README](https://github.com/element-hq/element-x-ios#element-x-ios)
- 许可证：AGPL-3.0-or-later 或 Element 商业许可证双许可。[LICENSE](https://github.com/element-hq/element-x-ios/blob/develop/LICENSE) · [README 许可说明](https://github.com/element-hq/element-x-ios#copyright--license)
- 维护信号：develop 分支在 2026-09-01 仍有提交，26.08.4 于 2026-08-25 发布。[提交](https://github.com/element-hq/element-x-ios/commits/develop/) · [26.08.4](https://github.com/element-hq/element-x-ios/releases/tag/release%2F26.08.4)
- 加密边界：Element X 聚焦私密端到端加密消息，但公开房间等场景仍可能不启用 E2EE；E2EE 也不隐藏全部通信元数据。恢复密钥与账户密码不同，丢失所有已验证设备且没有恢复密钥时，旧加密历史可能无法恢复；应离线保存恢复密钥并核验新设备。[产品定位](https://github.com/element-hq/element-x-ios/blob/develop/CONTRIBUTING.md#product-philosophy) · [恢复密钥说明](https://docs.element.io/latest/element-support/device-verification/how-to-ensure-you-have-a-recovery-key/)
- 建议描述：`iOS 18+ 原生 Matrix 客户端｜基于 Rust SDK 提供房间、媒体、通话和端到端加密聊天；需保存恢复密钥并核验新设备。`

### 4. 开源应用 · 日历客户端 — calcurse

- 主仓库：https://github.com/lfos/calcurse
- 形态与能力：类 Unix 平台的 ncurses 终端日历、日程和待办客户端，本地管理重复事件与提醒；仓库附带 CalDAV 双向同步脚本。[README](https://github.com/lfos/calcurse#calcurse) · [CalDAV 脚本](https://github.com/lfos/calcurse/tree/pu/contrib/caldav)
- 许可证：BSD-2-Clause。[COPYING](https://github.com/lfos/calcurse/blob/pu/COPYING)
- 维护信号：README 指定当前维护者，pu 分支在 2026-08-04 仍有提交；4.8.2 于 2025-08-07 发布。[维护者](https://github.com/lfos/calcurse#authors) · [提交](https://github.com/lfos/calcurse/commits/pu/) · [4.8.2](https://github.com/lfos/calcurse/releases/tag/v4.8.2)
- 隐私与凭据边界：本地保存不代表数据已静态加密；启用 CalDAV 后，事件会同步到所选服务器。账号密码或 OAuth 凭据不应写入共享配置、命令历史或日志，优先通过 `PasswordCommand` 或系统密钥工具读取，并备份后再处理双向同步冲突。[示例配置](https://github.com/lfos/calcurse/blob/pu/contrib/caldav/config.sample)
- 建议描述：`终端日历与待办客户端｜在本地管理日程、重复事件和提醒，并可通过脚本同步 CalDAV；凭据应交由安全命令或密钥工具读取。`

### 5. 开源应用 · RSS 阅读 — FeedFlow

- 主仓库：https://github.com/prof18/feed-flow
- 形态与能力：面向 Android、iOS、macOS、Windows 与 Linux 的跨平台 RSS 阅读器，支持本地资料库、OPML、离线阅读，以及通过云存储或 FreshRSS、Miniflux 等服务同步；官方列出了各平台安装入口。[README](https://github.com/prof18/feed-flow#feedflow) · [下载](https://github.com/prof18/feed-flow#download)
- 许可证：Apache-2.0。[LICENSE](https://github.com/prof18/feed-flow/blob/main/LICENSE)
- 维护信号：main 分支在 2026-09-01 仍有提交，1.16.1-all 于 2026-08-16 发布。[提交](https://github.com/prof18/feed-flow/commits/main/) · [1.16.1-all](https://github.com/prof18/feed-flow/releases/tag/1.16.1-all)
- 隐私边界：直接抓取 Feed 会向源站暴露 IP、访问时间和客户端特征，文章或内置浏览器内容还可能载入追踪资源；接入云盘或阅读服务会把订阅、阅读状态或内容交给相应服务。含令牌的私有 Feed URL、同步凭据和 OPML 不应公开。
- 建议描述：`跨平台 RSS 阅读器｜在 Android、iOS 与桌面端管理本地订阅、离线文章，并可连接云盘或 FreshRSS、Miniflux；私有 Feed 与同步凭据勿公开。`

### 6. 开源应用 · 通知服务 — Bark

- 主仓库：https://github.com/finb/bark
- 形态与能力：面向 Apple 平台的推送通知应用，可通过简单 GET/POST 请求发送分组、声音、时效性或关键提醒；支持自托管 Bark Server，并提供加密推送参数。[README](https://github.com/finb/bark#bark) · [官方文档](https://bark.day.app/#/en-us/)
- 许可证：MIT。[LICENSE](https://github.com/finb/bark/blob/master/LICENSE)
- 维护信号：master 分支在 2026-09-01 仍有提交，仓库未归档。[提交](https://github.com/finb/bark/commits/master/)
- 通知边界：推送 URL 中的设备 key 等同发送凭据，不应放进公开仓库、浏览器历史或共享日志；通知正文可能显示在锁屏并经 APNs 或所配服务器传递，敏感载荷应最小化并显式启用加密，服务端需使用 TLS、鉴权与访问限制。关键提醒可绕过静音/勿扰，只有确有紧急需求时才应使用。[请求格式与加密参数](https://github.com/finb/bark#usage)
- 建议描述：`Apple 平台推送通知工具｜通过 HTTP 请求发送分组、时效性或关键提醒，并可自托管服务端；需保护设备 key 并避免锁屏泄露敏感内容。`

## 结论

六项均为当前可访问、未归档且仍有维护信号的官方或主维护 GitHub 项目，并与目录现有 title/规范化 URL 不重复。录入时应保留 Irssi 的“TLS 不等于 E2EE”、Psi 和 Element X 的会话/密钥核验、calcurse 的 CalDAV 凭据、FeedFlow 的订阅与同步隐私，以及 Bark 的设备 key 和锁屏泄露边界。
