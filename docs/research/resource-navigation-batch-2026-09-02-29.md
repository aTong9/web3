# 资源导航第 29 批一手来源核验

日期：2026-09-02

范围：`开源应用 · 短链接服务`、`临时文件传输`、`书签管理`、`邮件测试`、`邮件营销`、`服务状态页`。候选均核对项目主仓库 README、许可证、发布页或提交状态；并与 `src/data/webstack.yml` 的全部标题及去尾斜杠、忽略大小写后的 URL 比对，无重复。

## 1. 短链接服务：Chhoto URL

- 主仓库：[SinTan1729/chhoto-url](https://github.com/SinTan1729/chhoto-url)
- 形态与平台：README 将其定义为 Rust 编写的轻量自托管 URL 缩短器，使用 SQLite，可通过 Docker/Podman 等 OCI 容器部署；支持随机或自定义短码、链接有效期、点击计数、API key 和二维码。
- 许可证与维护：主仓库为 MIT 许可证；仓库未归档，2026-08-24 仍有推送，[7.5.0](https://github.com/SinTan1729/chhoto-url/releases/tag/7.5.0) 发布于 2026-07-24。
- 安全边界：README 明示基础密码认证本身不加密传输，公网部署应置于 HTTPS 反向代理后；公开创建入口还应限制滥用并审查恶意跳转，管理凭据与 SQLite 数据库需要保护和备份。
- 一手来源：[README](https://github.com/SinTan1729/chhoto-url#readme)、[安装文档](https://github.com/SinTan1729/chhoto-url/blob/main/docs/INSTALLATION.md)、[LICENSE](https://github.com/SinTan1729/chhoto-url/blob/main/LICENSE)、[Releases](https://github.com/SinTan1729/chhoto-url/releases)
- 建议录入：`轻量自托管短链接服务｜用 Rust、SQLite 与容器创建自定义短码、有效期和点击计数；公网部署需启用 HTTPS、保护管理凭据并防范恶意跳转。`

## 2. 临时文件传输：Gokapi

- 主仓库：[Forceu/Gokapi](https://github.com/Forceu/Gokapi)
- 形态与平台：README 将其定义为现代自托管 Firefox Send 替代品，可在 Linux、macOS、Windows 裸机运行或通过 Docker 部署；文件可按天数或下载次数自动删除，并支持注册用户上传、文件请求、S3 兼容存储和可选端到端加密。
- 许可证与维护：AGPL-3.0；仓库未归档，2026-08-27 仍有推送，[v2.2.4](https://github.com/Forceu/Gokapi/releases/tag/v2.2.4) 发布于 2026-03-10。
- 安全边界：到期删除不是传输保密的替代品；敏感文件应启用 HTTPS、强认证和端到端加密，部署者还需确认对象存储、备份和日志中没有残留副本。
- 一手来源：[README](https://github.com/Forceu/Gokapi#readme)、[安装文档](https://gokapi.readthedocs.io/en/latest/setup.html)、[LICENSE](https://github.com/Forceu/Gokapi/blob/master/LICENSE.md)、[Releases](https://github.com/Forceu/Gokapi/releases)
- 建议录入：`跨平台临时文件分享服务｜用 Docker 或单机程序创建按天数、下载次数到期的链接，并支持文件请求与可选端到端加密；敏感内容仍需 HTTPS、强认证并核查存储和备份残留。`

## 3. 书签管理：ArchiveBox

- 主仓库：[ArchiveBox/ArchiveBox](https://github.com/ArchiveBox/ArchiveBox)
- 形态与平台：README 将其定义为开源自托管网页归档应用，可从书签、浏览历史、RSS 等导入 URL，保存 HTML、PNG、PDF、WARC、文本和元数据；提供 Docker/Python 安装、CLI、Web 界面、REST API 与浏览器扩展。
- 许可证与维护：MIT；仓库未归档，2026-09-01 仍有推送，[v0.7.4](https://github.com/ArchiveBox/ArchiveBox/releases/tag/v0.7.4) 发布于 2026-05-18。
- 隐私边界：归档可能永久保留登录后网页、个人浏览历史、Cookie、截图和第三方内容；应限制归档库访问，最小化凭据与个人数据采集，并在保存或公开副本前确认隐私、版权和站点规则。
- 一手来源：[README](https://github.com/ArchiveBox/ArchiveBox#readme)、[Quickstart](https://github.com/ArchiveBox/ArchiveBox/wiki/Quickstart)、[LICENSE](https://github.com/ArchiveBox/ArchiveBox/blob/dev/LICENSE)、[Releases](https://github.com/ArchiveBox/ArchiveBox/releases)
- 建议录入：`自托管书签与网页归档工具｜从书签或历史导入链接并保存 HTML、截图、PDF、WARC 等副本；归档前需最小化登录凭据与个人数据，并限制私有档案访问。`

## 4. 邮件测试：Inbucket

- 主仓库：[inbucket/inbucket](https://github.com/inbucket/inbucket)
- 形态与平台：Go 编写的自托管邮件测试服务，内置 SMTP、Web、REST、POP3 和无需外部数据库的存储；提供 Docker 镜像和多平台发布包。配置文档支持限定接收域、消息大小、邮箱容量和保留期，默认保留期为 24 小时。
- 许可证与维护：MIT；仓库未归档，2026-04-02 仍有推送，[v3.1.1](https://github.com/inbucket/inbucket/releases/tag/v3.1.1) 发布于 2025-12-06。
- 隔离边界：仅用于开发与测试，应用应把测试 SMTP 与生产投递彻底隔离；不要暴露成开放 SMTP 服务或接收真实敏感邮件，公网管理界面需 TLS、认证和网络访问控制。
- 一手来源：[README](https://github.com/inbucket/inbucket#readme)、[配置文档](https://github.com/inbucket/inbucket/blob/main/doc/config.md)、[LICENSE](https://github.com/inbucket/inbucket/blob/main/LICENSE)、[Releases](https://github.com/inbucket/inbucket/releases)
- 建议录入：`自托管邮件测试与临时邮箱服务｜内置 SMTP、Web、REST 和 POP3 接口捕获任意测试地址邮件；仅用于隔离的开发环境，勿公开成开放邮件服务或存放真实敏感内容。`

## 5. 邮件营销：BillionMail

- 主仓库：[Billionmail/BillionMail](https://github.com/Billionmail/BillionMail)
- 形态与平台：README 将其描述为 Linux/Docker 自托管邮件服务器、Newsletter 与邮件营销平台，集成 SMTP、Postfix、Dovecot 与 Rspamd，可管理联系人、活动、交易邮件、模板与投递分析。
- 许可证与维护：AGPL-3.0；主仓库未归档，2026-06-11 仍有推送；发布页记录 [v4.9](https://github.com/Billionmail/BillionMail/releases/tag/v4.9) 等版本。
- 合规边界：只应向已同意的收件人发送，并提供清晰退订、维护抑制名单、遵守适用的反垃圾邮件与隐私法规；自建发送域还需正确配置 SPF、DKIM、DMARC，保护名单数据并持续维护服务器安全与域名信誉。
- 一手来源：[README](https://github.com/Billionmail/BillionMail#readme)、[SECURITY](https://github.com/Billionmail/BillionMail/blob/dev/SECURITY.md)、[LICENSE](https://github.com/Billionmail/BillionMail/blob/dev/LICENSE)、[Releases](https://github.com/Billionmail/BillionMail/releases)
- 建议录入：`自托管邮件服务器与营销平台｜用 Docker 管理订阅者、Newsletter、交易邮件和投递分析；仅向已同意的收件人发送，并落实退订、SPF/DKIM/DMARC 与反垃圾邮件合规。`

## 6. 服务状态页：Gatus

- 主仓库：[TwiN/gatus](https://github.com/TwiN/gatus)
- 形态与平台：Go 编写的自动化自托管状态页和监控服务，支持 Docker 或单二进制部署；通过配置检查 HTTP、TCP、DNS 等端点，展示延迟和状态，并支持告警与事故记录。
- 许可证与维护：Apache-2.0；仓库未归档，2026-08-27 仍有推送，[v5.36.0](https://github.com/TwiN/gatus/releases/tag/v5.36.0) 发布于 2026-05-19。
- 信息边界：公开状态页应只展示用户需要的服务名称、影响和恢复进度，避免泄露内部主机名、地址、网络拓扑、探针细节或告警密钥；管理面需要认证，状态页也不能替代日志、追踪和完整可观测性。
- 一手来源：[README](https://github.com/TwiN/gatus#readme)、[LICENSE](https://github.com/TwiN/gatus/blob/master/LICENSE)、[Releases](https://github.com/TwiN/gatus/releases)
- 建议录入：`自动化自托管服务状态页｜按配置探测端点、展示延迟与故障并发送告警、记录事故；应保护管理面和通知凭据，避免公开内部地址或网络拓扑。`

## 去重结论

首次检查只遍历了错误的数据层级，遗漏了“网页归档”中的 `ArchiveBox`。按完整嵌套结构递归复核后，`ArchiveBox` 已确认是全站重复项，不应再次录入；书签管理改用下列 `LinkAce`。其余五项与替代项的标题、去尾斜杠且忽略大小写后的 URL 均未在当前全站目录出现。

## 书签管理替代项：LinkAce

- 主仓库：[Kovah/LinkAce](https://github.com/Kovah/LinkAce)
- 形态与平台：README 将其定义为自托管的个人链接归档与书签管理应用，可用列表和标签整理链接，支持多用户、私有或公开链接、RSS、HTML 导入导出、链接可用性监控，以及通过 Internet Archive 自动归档已保存网页；提供 Docker、PHP、Kubernetes 与云端部署方式。
- 许可证与维护：GPL-3.0；主仓库未归档，2026-08-31 仍有推送，[v2.6.1](https://github.com/Kovah/LinkAce/releases/tag/v2.6.1) 发布于 2026-08-03。
- 隐私边界：链接可以设为公开，并可生成公开 RSS；通过 Internet Archive 自动归档还可能把原本不希望传播的 URL 或页面副本交给第三方。保存前应检查可见性，避免提交含访问令牌、私人路径或个人数据的链接，并保护账户、OIDC 与备份存储凭据。
- 一手来源：[README](https://github.com/Kovah/LinkAce/blob/2.x/README.md)、[部署文档](https://www.linkace.org/docs/v2/setup/)、[LICENSE](https://github.com/Kovah/LinkAce/blob/2.x/LICENSE.md)、[Releases](https://github.com/Kovah/LinkAce/releases)
- 建议录入：`自托管书签与链接归档平台｜用列表、标签、监控和 Internet Archive 整理并保存链接；需核对公开与 RSS 可见性，避免归档含令牌、私人路径或个人数据的网址。`
