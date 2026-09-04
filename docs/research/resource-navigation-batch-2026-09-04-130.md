# 资源导航补充研究 · Batch 130

日期：2026-09-04。范围：时间与习惯管理、文档归档、密码管理各 1 项。仅公开资料研究，未安装、创建账户或上传数据。

## 去重与互补性

已阅读三个目标分类现有条目，对完整 `src/data/webstack.yml` 搜索产品名、仓库与别名。Timewarrior、ActivityWatch、Traggo 和 KeePassXC 已在其他分类，排除。Habo / xpavle00、SingleFile / gildas-lormeau、AuthPass / authpass.app 未出现。

Habo 补充 iOS 与 Android 习惯记录及可选同步；SingleFile 补充无需归档服务器的浏览器单文件保存，不替代 ArchiveBox 批量归档；AuthPass 补充覆盖 iOS 的 KeePass 文件工作流，不重复录入 KeePassXC 或 KeePassDX。

## 终身成长 · 时间与习惯管理

```yaml
title: Habo
logo: finance.png
url: https://github.com/xpavle00/Habo
description: Android、iOS 开源习惯追踪器｜自定义习惯、提醒、笔记与统计；基础记录无需账户，可选同步需另核对订阅或自托管条件，并保管加密与备份凭据
```

- [官方仓库](https://github.com/xpavle00/Habo)：GPL-3.0，Flutter 应用；说明 Android/iOS 支持与无需账户的基础使用。当前 README 介绍端到端加密同步和自托管 Supabase 后端；其加密说明是作者声明，不是本次安全审计结论。
- [官方 Releases](https://github.com/xpavle00/Habo/releases)：可查看发布与升级记录。商店、源代码和同步服务不是同一费用承诺；自托管无需同步订阅不等于云资源永久免费。
- 检索缓存中的 raw README 较旧，没有新版同步段落；平台与核心记录功能一致，新同步表述仅依据当前 GitHub 页面，不固定版本号。数据备份与恢复要自行验证。

## 开源应用 · 文档归档

```yaml
title: SingleFile
logo: finance.png
url: https://github.com/gildas-lormeau/SingleFile
description: 浏览器网页归档扩展｜将页面保存为单个 HTML，支持 Chrome、Firefox、Edge 与 Safari 等；默认本地处理，云存储另行授权，归档前检查敏感内容与页面完整性
```

- [官方仓库与安装说明](https://github.com/gildas-lormeau/SingleFile)：AGPL-3.0，附带第三方代码有各自许可；提供浏览器商店入口与 CLI 关联工具，可保存页面、选区并注释。不是浏览器交互行为或所有媒体的完整复制保证。
- [官方隐私说明](https://github.com/gildas-lormeau/SingleFile/blob/master/privacy.md)：默认本地处理；Google Drive、Dropbox、GitHub 等目标会接收内容，浏览器同步会传送选项，存在性证明服务会接收哈希。保存过程仍可能请求页面资源，因此“本地处理”不等于断网运行。
- [官方发布记录](https://github.com/gildas-lormeau/SingleFile/releases)：存在版本入口；商店与仓库版本应分别核对，不将某个缓存发布号写入卡片。
- 浏览器权限须核查；保存的页面可能含登录后私密内容，分享前检查。遵守版权与访问授权；开源代码许可不覆盖被归档网页的内容权利，也不承诺所有商店渠道价格相同。

## 开源应用 · 密码管理

```yaml
title: AuthPass
logo: finance.png
url: https://github.com/authpass/authpass
description: Android、iOS 与桌面 KeePass 兼容密码管理器｜管理 KDBX 保险库，可选 Drive、Dropbox 或 WebDAV 同步；使用强主密码、保护密钥文件并保留可验证离线备份
```

- [官方仓库](https://github.com/authpass/authpass)：GPL-3.0，列 Android、iOS、macOS、Linux、Windows 分发入口与源码。README 有历史路线图，不将其所有待办项当成已发布功能。
- [官方产品页](https://authpass.app/)：说明密码或密钥文件解锁、搜索分组、跨平台使用与 Google Drive/Dropbox/WebDAV 同步；网站明确 Android 自动填充，故不承诺 iOS 自动填充或跨平台功能一致。
- [官方 Releases](https://github.com/authpass/authpass/releases)：有发布记录可核对；仅文档核验，没有用真实保险库验证兼容性、恢复或安全性。
- 官方称免费开源；第三方存储的账户、费用和权限独立适用。保险库同步不等于备份，主密码或密钥丢失可能导致无法恢复；不要上传测试凭据之外的真实秘密来验证工具。

## 边界

仅建立来源支持的候选卡片；未修改 YAML，未执行安装、网页保存、密码读取、云同步或数据上传。上线前按当前目录再去重；公开文档不构成隐私、安全或长期维护保证。
