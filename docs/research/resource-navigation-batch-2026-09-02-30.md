# 资源导航第 30 批：Android 工具与开源浏览器一手来源核验

日期：2026-09-02

## 范围与方法

本批为以下六个分类各核验一个可安装的官方或主维护 GitHub 项目：Android 短信、Android
键盘、Android 启动器、Android 文件管理、Android 应用商店、开源浏览器。仅使用项目 README、
仓库代码/清单、许可证、发布页和提交记录等一手来源，不把搜索摘要或第三方商店介绍作为结论依据。

读取 `src/data/webstack.yml` 的完整嵌套结构（2 个顶层分类、345 个分组、2474 条链接），以
`trim → 移除末尾 / → lowercase` 规范化 URL，并对 title 做 `trim → lowercase` 比对。下面六个
title 与 URL 在全站均为 0 次命中，可直接新增；没有把相似功能或星标数当作维护状态证明。

## 推荐条目

### 1. 开源应用 · Android 短信 — SMSGate

- **仓库：** [capcom6/android-sms-gateway](https://github.com/capcom6/android-sms-gateway)
- **形态与平台：** 可安装 Android APK；README 说明它把 Android 5.0+ 手机变成短信网关，
  通过本机或云端 API 发送 SMS/MMS，并以 webhook 接收消息事件。项目同时提供预构建 APK。
  来源：[README](https://github.com/capcom6/android-sms-gateway#about-the-project)、
  [安装说明](https://github.com/capcom6/android-sms-gateway#installation-from-apk)
- **许可证与维护：** Apache-2.0；仓库未归档。GitHub 发布页在核验时显示最新版本
  `v1.73.0` 于 2026-08-27 发布，仓库在 2026-09-01 仍有推送。
  来源：[LICENSE](https://github.com/capcom6/android-sms-gateway/blob/master/LICENSE)、
  [Releases](https://github.com/capcom6/android-sms-gateway/releases)、
  [Commits](https://github.com/capcom6/android-sms-gateway/commits/master/)
- **必要边界：** README 明列 `SEND_SMS`，并按功能选用 `READ_SMS`、`RECEIVE_SMS`、
  `RECEIVE_MMS` 等权限；webhook/API 会接触号码、正文和附件。只应连接本人或获授权设备，限制
  API 暴露范围，保护凭据与 webhook，遵守运营商资费、反滥发及当地通信规则。
  来源：[Permissions](https://github.com/capcom6/android-sms-gateway#permissions)、
  [Local Server](https://github.com/capcom6/android-sms-gateway#local-server)
- **可直接录入：** `Android 短信网关应用｜通过本地或云端 API 发送和接收 SMS、MMS；会接触号码与正文，只连接获授权设备并保护凭据和回调。`

### 2. 开源应用 · Android 键盘 — Thumb-Key

- **仓库：** [dessalines/thumb-key](https://github.com/dessalines/thumb-key)
- **形态与平台：** 可安装 Android 输入法；README 定义为面向拇指的隐私键盘，以 3×3 网格、
  滑动手势完成输入，并提供仅存于应用内存的私有剪贴板。APK 可从 GitHub Releases 获取。
  来源：[README](https://github.com/dessalines/thumb-key#about-thumb-key)、
  [Private clipboard](https://github.com/dessalines/thumb-key#private-clipboard)、
  [Installation](https://github.com/dessalines/thumb-key#installation--releases)
- **许可证与维护：** AGPL-3.0；仓库未归档。最新版本 `5.1.16` 于 2026-08-10 发布，
  2026-08-29 仍有推送。
  来源：[LICENSE](https://github.com/dessalines/thumb-key/blob/main/LICENSE)、
  [Releases](https://github.com/dessalines/thumb-key/releases)、
  [Commits](https://github.com/dessalines/thumb-key/commits/main/)
- **必要边界：** Android 输入法天然处于敏感输入路径；即使项目强调隐私，安装前仍应核对仓库、
  APK 签名和权限，并避免把密码、助记词等高价值秘密交给未经核验的键盘。README 还说明应用内
  私有剪贴板不涵盖从键盘外部调用的系统剪贴板。
  来源：[APK certificate verification](https://github.com/dessalines/thumb-key#installation--releases)、
  [Private clipboard](https://github.com/dessalines/thumb-key#private-clipboard)
- **可直接录入：** `Android 隐私键盘｜使用 3×3 网格、滑动手势和私有剪贴板输入；输入法可接触全部键入内容，安装前应核对来源、签名与权限。`

### 3. 开源应用 · Android 启动器 — KISS Launcher

- **仓库：** [Neamar/KISS](https://github.com/Neamar/KISS)
- **形态与平台：** 可安装 Android 主屏幕启动器；README 说明可从主屏幕键入并搜索应用、
  联系人和设置，提供 F-Droid、Google Play 与 GitHub Releases 安装入口。
  来源：[README](https://github.com/Neamar/KISS#readme)、
  [Releases](https://github.com/Neamar/KISS/releases)
- **许可证与维护：** GPL-3.0-or-later；仓库未归档。最新版本 `v3.24.2` 于 2026-03-11
  发布，2026-08-14 仍有推送。
  来源：[LICENSE](https://github.com/Neamar/KISS/blob/master/LICENSE)、
  [Commits](https://github.com/Neamar/KISS/commits/master/)
- **必要边界：** 项目 AndroidManifest 声明联系人、电话状态/拨号、应用列表、卸载请求、通知
  监听与无障碍服务等能力，其中部分服务或权限按用户启用的集成功能使用。启动器可观察应用列表与
  启动习惯；只开启需要的权限，尤其谨慎对待联系人、电话、通知和无障碍访问。
  来源：[AndroidManifest.xml](https://github.com/Neamar/KISS/blob/master/app/src/main/AndroidManifest.xml)
- **可直接录入：** `Android 搜索型启动器｜从主屏幕快速查找应用、联系人和设置；应用列表、联系人、电话、通知或无障碍权限应按需开启。`

### 4. 开源应用 · Android 文件管理 — Teyin

- **仓库：** [rama-io/teyin](https://github.com/rama-io/teyin)
- **形态与平台：** 原生 Kotlin Android 文件管理器；README 列出浏览、书签、批量选择、复制、
  移动、重命名和删除，并明确完全在设备端运行、不需要网络权限。可从 GitHub Releases、F-Droid
  或 Obtainium 安装。
  来源：[README](https://github.com/rama-io/teyin/blob/master/readme.md)、
  [Installation](https://github.com/rama-io/teyin/blob/master/readme.md#installation)
- **许可证与维护：** GPL-3.0-or-later；仓库未归档。最新版本 `2026.8` 于 2026-08-21
  发布，同日仍有推送。
  来源：[LICENSE](https://github.com/rama-io/teyin/blob/master/LICENSE)、
  [Releases](https://github.com/rama-io/teyin/releases)、
  [Commits](https://github.com/rama-io/teyin/commits/master/)
- **必要边界：** Android 11+ 为管理应用专属目录以外的文件，需要
  `MANAGE_EXTERNAL_STORAGE` 广泛存储权限；旧系统使用读写外部存储权限。复制、移动、重命名、
  删除和批量操作前应核对源/目标并备份重要数据，“无需联网”不能消除误删风险。
  来源：[Permissions](https://github.com/rama-io/teyin/blob/master/readme.md#permissions)、
  [Features](https://github.com/rama-io/teyin/blob/master/readme.md#features)
- **可直接录入：** `本地优先 Android 文件管理器｜浏览、批量复制、移动、重命名和删除设备文件，无需联网；广泛存储权限与删除操作需谨慎。`

### 5. 开源应用 · Android 应用商店 — Accrescent

- **仓库：** [accrescent/accrescent](https://github.com/accrescent/accrescent)
- **形态与平台：** Android 10+ 应用商店客户端；README 列出应用签名密钥固定、已签名仓库
  元数据、Android 12+ 非特权自动更新、split APK、无需账号安装等能力，并明确当前仍为 early alpha。
  来源：[README](https://github.com/accrescent/accrescent#about)
- **许可证与维护：** Apache-2.0；仓库未归档。最新版本 `0.28.1` 于 2025-11-10 发布，
  2026-09-01 仍有推送。
  来源：[LICENSE](https://github.com/accrescent/accrescent/blob/main/LICENSE)、
  [Releases](https://github.com/accrescent/accrescent/releases)、
  [Commits](https://github.com/accrescent/accrescent/commits/main/)
- **必要边界：** 第三方应用商店处于 APK 供应链信任边界。只从官方入口获取客户端，安装前核对
  README 公布的 SHA-256 签名证书，保持仓库元数据与客户端更新，并独立审查所安装应用；
  “签名有效”只能证明发布身份连续，不能证明应用本身安全。early alpha 也意味着稳定性边界。
  来源：[Signing certificate hash](https://github.com/accrescent/accrescent#signing-certificate-hash)、
  [README](https://github.com/accrescent/accrescent#readme)
- **可直接录入：** `Android 安全应用商店｜校验签名密钥与仓库元数据后安装和更新应用；仍属 early alpha，应从官方入口获取并核对签名。`

### 6. 开源应用 · 开源浏览器 — Cromite

- **仓库：** [uazo/cromite](https://github.com/uazo/cromite)
- **形态与平台：** Chromium/Bromite 分支，内置广告拦截与隐私增强；README 提供 Android
  10+ APK，以及 Windows 64 位和 Linux 64 位构建，并说明 Android 内置更新通知。
  来源：[README](https://github.com/uazo/cromite#readme)、
  [Releases and targets](https://github.com/uazo/cromite#releases)、
  [Auto-update](https://github.com/uazo/cromite#auto-update-in-android)
- **许可证与维护：** GPL-3.0；仓库未归档。发布页持续提供基于 Chromium 版本的构建，仓库在
  2026-09-01 仍有推送。
  来源：[LICENSE](https://github.com/uazo/cromite/blob/master/LICENSE)、
  [Releases](https://github.com/uazo/cromite/releases)、
  [Commits](https://github.com/uazo/cromite/commits/master/)
- **必要边界：** 浏览器保存历史、Cookie、登录态和下载数据，并直接暴露于网页内容。应启用并
  及时安装安全更新、保护同步/个人资料目录、慎装扩展。项目 README 自己说明反指纹缓解并不完整，
  不应把它当作高风险人群的匿名保障。
  来源：[Privacy limitations](https://github.com/uazo/cromite#privacy-limitations)、
  [Auto-update](https://github.com/uazo/cromite#auto-update-in-android)
- **可直接录入：** `Android、Windows、Linux 隐私浏览器｜基于 Chromium，内置广告拦截与反跟踪；浏览数据敏感，应及时更新且防指纹保护并不完整。`

## 去重结果

| 分类 | title | 规范化 URL | title 命中 | URL 命中 |
| --- | --- | --- | ---: | ---: |
| Android 短信 | SMSGate | `https://github.com/capcom6/android-sms-gateway` | 0 | 0 |
| Android 键盘 | Thumb-Key | `https://github.com/dessalines/thumb-key` | 0 | 0 |
| Android 启动器 | KISS Launcher | `https://github.com/neamar/kiss` | 0 | 0 |
| Android 文件管理 | Teyin | `https://github.com/rama-io/teyin` | 0 | 0 |
| Android 应用商店 | Accrescent | `https://github.com/accrescent/accrescent` | 0 | 0 |
| 开源浏览器 | Cromite | `https://github.com/uazo/cromite` | 0 | 0 |

## 录入建议

六项均满足“官方/主维护 GitHub 仓库、可安装形态、未归档、存在近期发布或提交、许可证可核验、
全站 title 与规范化 URL 不重复”。目录描述应保留上面的权限、数据、签名、删除和更新边界；不应
仅写“隐私”“安全”而省略用户仍需承担的安装来源与权限核验。
