# 资源导航第 25 批一手来源核验

日期：2026-09-02

范围：为“播客客户端、窗口管理、磁盘分析、磁盘健康、电源管理、电子书阅读”各筛选一个仍在维护的官方或主维护 GitHub 项目。候选已对 `src/data/webstack.yml` 全文件按小写、去首尾空白、去 URL 末尾斜杠检查 title/URL，六项均未命中。

## 推荐项目

### 1. 开源应用 · 播客客户端 — Poddr

- 主仓库：https://github.com/Sn8z/Poddr
- 形态与能力：Windows、Linux 与 macOS 桌面播客客户端，基于 Electron 和 Angular，使用 iTunes RSS 与 Search API 发现节目，并提供 EXE、Snap、AppImage 和 DMG 安装形式。[README](https://github.com/Sn8z/Poddr#readme)
- 许可证：[GPL-3.0](https://github.com/Sn8z/Poddr/blob/main/LICENSE)。
- 维护信号：main 分支在 2026-05-17 仍有提交，2.1.0 版本于 2026-01-25 更新。[提交](https://github.com/Sn8z/Poddr/commits/main/) · [Releases](https://github.com/Sn8z/Poddr/releases)
- 隐私与内容边界：节目搜索会访问 iTunes API，订阅与播放也会连接第三方节目源；敏感订阅不应被视作纯离线数据，下载和再分发节目仍需遵守内容授权。
- 建议描述：`跨平台桌面播客客户端｜通过 iTunes 搜索或 RSS 订阅节目，支持 Windows、Linux 与 macOS 安装包。`

### 2. 开源应用 · 窗口管理 — AeroSpace

- 主仓库：https://github.com/nikitabobko/AeroSpace
- 形态与能力：macOS 上受 i3 启发的平铺窗口管理器，使用树状布局、自有虚拟工作区、纯文本配置与 CLI，支持多显示器且无需关闭 SIP。[README](https://github.com/nikitabobko/AeroSpace#readme)
- 许可证：[MIT](https://github.com/nikitabobko/AeroSpace/blob/main/LICENSE)。
- 维护信号：main 分支在 2026-08-10 仍有提交，v0.21.3-Beta 于 2026-07-16 发布。[提交](https://github.com/nikitabobko/AeroSpace/commits/main/) · [Release](https://github.com/nikitabobko/AeroSpace/releases/tag/v0.21.3-Beta)
- 平台边界：项目目前标为 Beta，README 明示应用未做 Apple notarization，Homebrew cask 会移除 quarantine 属性；安装前应核验来源和签名风险。它依赖 macOS 辅助功能接口管理窗口，配置更改可能重排当前工作区，但不要求关闭 SIP。
- 建议描述：`macOS 平铺窗口管理器｜以树状布局、虚拟工作区和纯文本配置组织窗口；当前为 Beta 且未做 Apple 公证。`

### 3. 开源应用 · 磁盘分析 — dust

- 主仓库：https://github.com/bootandy/dust
- 形态与能力：Rust 编写的跨平台终端磁盘占用分析器，以树状层级和比例条展示目录大小，可通过安装脚本、Cargo、Homebrew、DNF、Snap 等方式安装。[README](https://github.com/bootandy/dust#readme)
- 许可证：[Apache-2.0](https://github.com/bootandy/dust/blob/master/LICENSE)。
- 维护信号：master 分支在 2026-08-18 仍有提交，v1.2.5 于 2026-08-20 发布。[提交](https://github.com/bootandy/dust/commits/master/) · [Release](https://github.com/bootandy/dust/releases/tag/v1.2.5)
- 使用边界：扫描结果可能暴露文件名和目录结构；只应在有权读取的路径运行，分享终端输出前需清理账号名、项目名及敏感路径。磁盘占用结果不等同于文件可安全删除。
- 建议描述：`跨平台终端磁盘分析器｜以树状层级和比例条快速定位大型目录与文件；分享结果前需清理敏感路径。`

### 4. 开源应用 · 磁盘健康 — openSeaChest

- 主仓库：https://github.com/Seagate/openSeaChest
- 形态与能力：Seagate 主维护的跨平台存储 CLI 套件，为 SATA、SAS、NVMe 与 USB 硬盘/固态盘读取健康状态、运行诊断、配置功能、更新固件或执行安全擦除；提供 Windows、Linux 与 BSD 预编译包。[README](https://github.com/Seagate/openSeaChest#readme)
- 许可证：[MPL-2.0](https://github.com/Seagate/openSeaChest/blob/develop/LICENSE.md)。
- 维护信号：develop 分支在 2026-07-28 仍有提交，v26.03.2 于 2026-06-11 更新；README 同时列出多条持续集成和“Maintained”状态。[提交](https://github.com/Seagate/openSeaChest/commits/develop/) · [Releases](https://github.com/Seagate/openSeaChest/releases)
- 数据安全边界：README 明示部分命令会改写固件、擦除数据或改变最大容量并造成数据丢失/不可访问；使用前必须保持有效备份、确认目标设备和控制器限制。健康值与自检只能作为预警证据，不能替代备份或保证磁盘不会故障。
- 建议描述：`跨平台存储健康与诊断 CLI｜读取 SATA、SAS、NVMe、USB 设备状态；变更固件或擦除前必须备份并确认目标盘。`

### 5. 开源应用 · 电源管理 — LACT

- 主仓库：https://github.com/ilya-zlobintsev/LACT
- 形态与能力：Linux GPU 配置与监控应用，支持 AMD、Nvidia 与 Intel，可查看功耗、温度和频率历史，并配置功率上限、功耗状态、风扇曲线、频率、电压和自动配置文件；系统服务也可无图形界面运行。[README](https://github.com/ilya-zlobintsev/LACT#readme)
- 许可证：[MIT](https://github.com/ilya-zlobintsev/LACT/blob/master/LICENSE)。
- 维护信号：master 分支在 2026-08-31 仍有提交，v0.10.1 于 2026-08-29 更新。[提交](https://github.com/ilya-zlobintsev/LACT/commits/master/) · [Releases](https://github.com/ilya-zlobintsev/LACT/releases)
- 硬件安全边界：超频、降压、功率和风扇参数可能导致 GPU 不稳定、崩溃、过热或无法进入图形会话。项目提供确认机制和 `lact-reset` 恢复方式，但使用者仍应从保守参数逐步测试、监控温度并确认硬件与保修限制。[坏超频恢复](https://github.com/ilya-zlobintsev/LACT/wiki/Recovering-from-a-bad-overclock)
- 建议描述：`Linux GPU 功耗配置与监控工具｜管理功率上限、风扇和性能配置；修改频率电压前需保守测试并监控温度。`

### 6. 开源应用 · 电子书阅读 — Arianna

- 主仓库：https://github.com/KDE/arianna
- 形态与能力：KDE 官方 EPUB 阅读器，提供图书馆和阅读模式，基于 epub.js 展示电子书；GitHub 仓库指向 KDE 官方项目与问题追踪入口。[README](https://github.com/KDE/arianna#readme)
- 许可证：[GPL-3.0](https://github.com/KDE/arianna/blob/master/LICENSES/GPL-3.0-or-later.txt)；README 也明确声明 GPL 3。
- 维护信号：master 分支在 2026-08-12 仍有提交，v26.08.0 于 2026-08-21 发布。[提交](https://github.com/KDE/arianna/commits/master/) · [Release](https://github.com/KDE/arianna/releases/tag/v26.08.0)
- 内容边界：它是 EPUB 阅读应用而非电子书来源或 DRM 绕过工具；导入文件前仍需确认来源、版权和设备存储权限，不应把可打开文件等同于可复制或传播。
- 建议描述：`KDE EPUB 电子书阅读器｜以图书馆管理本地书籍并提供专注阅读模式；不提供书源或 DRM 绕过。`

## 结论

六项均是当前未归档、可安装或可直接部署的官方/主维护 GitHub 项目，并与目录现有 title/规范化 URL 不重复。录入时应保留 AeroSpace 的 Beta/未公证说明、openSeaChest 的数据丢失警告，以及 LACT 的硬件稳定性边界。
