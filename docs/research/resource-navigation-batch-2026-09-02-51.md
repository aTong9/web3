# 资源导航第 51 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按标题及去除末尾 `/`、忽略大小写后的 URL 检查
`src/data/webstack.yml`，下列 6 项均未在全局目录中出现。

| 分类 | 建议条目 | 平台 / 形态 | 许可与近期维护 | 通信隐私、反滥用或部署安全边界及推荐中文描述 |
| --- | --- | --- | --- | --- |
| 开源应用 · 团队沟通 | [Tinode](https://github.com/tinode/chat) | 自托管即时通信服务与 Web、Android、iOS 客户端；主仓 README 覆盖一对一、群组、文件和音视频消息。 | [GPL-3.0](https://github.com/tinode/chat/blob/master/LICENSE)；主分支 2026-08-23 仍有提交。 | 自托管不自动等于端到端加密；应限制注册、上传与管理接口，设置留存策略并防范骚扰和滥用。推荐描述：**自托管即时通信平台｜提供 Web 与移动端的一对一、群组、文件及音视频消息；部署前需核实加密模型，限制注册和上传权限，并落实内容留存、举报与反滥用策略。** |
| 开源应用 · 通信服务 | [LiveKit](https://github.com/livekit/livekit) | Go 编写的开源 WebRTC 实时音视频服务器；可自托管并通过 SDK 构建会议、直播和语音代理。 | [Apache-2.0](https://github.com/livekit/livekit/blob/master/LICENSE)；2026-08-26 发布 v1.13.6，主分支 2026-09-01 仍有提交。 | 服务端令牌应短期、最小权限签发；需启用 TLS、保护 TURN 凭据，并获得录音、转写和参会者数据处理同意。推荐描述：**自托管 WebRTC 实时通信服务器｜通过 SDK 构建音视频会议、直播和语音应用；生产环境须保护 API 密钥与 TURN 凭据，并对录音、转写和参会数据取得明确同意。** |
| 开源应用 · 邮件服务器 | [Maddy](https://github.com/foxcpp/maddy) | 单体式 Go 邮件服务器；整合 SMTP、IMAP、账号存储、DKIM、SPF 与反垃圾能力。 | [GPL-3.0](https://github.com/foxcpp/maddy/blob/master/LICENSE)；2026-05-23 发布 v0.9.5，主分支 2026-07-24 仍有提交。 | 上线需正确配置 TLS、SPF、DKIM、DMARC、反中继和备份，并持续监控队列、退信与 IP 声誉。推荐描述：**轻量自托管邮件服务器｜单个服务整合 SMTP、IMAP、账号与域名验证；上线前须配置 TLS、SPF、DKIM、DMARC 和反中继，并持续维护备份、队列及发送信誉。** |
| 开源应用 · 邮件客户端 | [SnappyMail](https://github.com/the-djmaze/snappymail) | PHP 自托管 Web 邮件客户端；连接 IMAP / SMTP，支持多账户、OpenPGP 与扩展。 | [AGPL-3.0](https://github.com/the-djmaze/snappymail/blob/master/LICENSE)；主分支 2026-03-11 仍有提交，最近稳定版为 v2.38.2。 | 服务器会处理邮箱凭据和正文；必须使用 HTTPS、及时修补 PHP 与插件、限制管理入口，并优先采用应用专用密码。推荐描述：**轻量自托管 Web 邮件客户端｜通过浏览器连接 IMAP、SMTP 并管理多账户与 OpenPGP；部署方会接触邮箱凭据和正文，须启用 HTTPS、限制管理入口并及时更新依赖。** |
| 开源应用 · 邮件订阅 | [Read You](https://github.com/ReadYouApp/ReadYou) | Android RSS 阅读器；支持 RSS、Atom、JSON Feed、本地 OPML 与多种同步服务。 | [GPL-3.0](https://github.com/ReadYouApp/ReadYou/blob/main/LICENSE)；主分支 2026-08-11 仍有提交。 | 连接第三方同步服务会披露订阅清单与阅读状态；导入来源前应核对隐私政策，并谨慎打开未知 Feed 中的外链。推荐描述：**Android 开源订阅阅读器｜集中阅读 RSS、Atom 与 JSON Feed，并支持 OPML 和同步服务；连接第三方账户前需评估订阅及阅读记录的隐私边界，谨慎打开未知来源链接。** |
| 开源应用 · 邮件营销 | [Dittofeed](https://github.com/dittofeed/dittofeed) | 自托管客户沟通与消息自动化平台；支持事件分群、邮件旅程、模板和交易消息。 | [MIT](https://github.com/dittofeed/dittofeed/blob/main/LICENSE)；2025-12-01 发布 v0.23.0，主分支 2026-03-28 仍有提交。 | 仅向已同意的收件人发送；必须提供退订、抑制名单和频率控制，保护联系人及事件数据，并配置 SPF、DKIM、DMARC。推荐描述：**自托管邮件自动化平台｜按用户事件构建分群、营销旅程和交易消息；仅面向已同意收件人，须落实退订与抑制名单、发送频率控制、域名认证和联系人数据保护。** |

## 结论

六项分别补充团队消息、实时音视频底座、完整邮件服务、浏览器邮件客户端、移动订阅阅读和事件驱动邮件自动化。许可证均由主仓明确给出，且有 2026 年提交或近期正式发布；其中 SnappyMail 的正式版本发布时间相对较早，纳入时应把持续补丁维护和部署加固作为显式提示。
