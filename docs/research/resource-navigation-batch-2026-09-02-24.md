# 资源导航第 24 批一手来源核验

日期：2026-09-02

范围：为“车辆定位、字幕制作、数字标牌、游戏服务器、桌面定制、性能测试”各筛选一个主维护 GitHub 项目。候选已对 `src/data/webstack.yml` 全文件按小写、去首尾空白、去 URL 末尾斜杠进行 title/URL 去重，六项均未命中。

## 推荐项目

### 1. 开源应用 · 车辆定位 — Open Vehicle Monitoring System

- 主仓库：https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3
- 形态与能力：开源车载硬件固件与内置 Web App，OVMS v3 模块通过 OBD2、蜂窝网络和 GPS 采集车辆位置与状态，也可用于车队监控，并提供 Android/iOS 客户端。[README](https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3#readme)
- 许可证：仓库多数代码采用 [MIT](https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3/blob/master/LICENSE)，使用具体组件前仍应核对相应文件声明。
- 维护信号：主分支在 2026-08-30 仍有提交，3.3.006 版本于 2026-05-17 更新。[提交](https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3/commits/master/) · [Releases](https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3/releases)
- 安全与合规边界：README 明示这是依赖逆向车辆协议的爱好者项目，安装可能损坏车辆或影响保修。只能追踪本人或已获明确授权的车辆；应保护位置历史、限制账户和服务器访问，并在部署前核对当地隐私、定位监控、雇佣和道路法规。远程控制与 OBD 接入需由具备能力者评估。
- 建议描述：`开源车载监控固件与 Web App｜通过 OBD2、蜂窝网络和 GPS 查看车辆位置与状态；仅限获授权车辆并需保护位置隐私、核对当地法规。`

### 2. 开源应用 · 字幕制作 — Tero Subtitler

- 主仓库：https://github.com/URUWorks/TeroSubtitler
- 形态与能力：Windows、macOS 与 Linux 桌面字幕编辑器，支持时间线和波形、多格式、转录、翻译、质量检查及硬字幕导出。[README](https://github.com/URUWorks/TeroSubtitler#readme)
- 许可证：[MPL-2.0](https://github.com/URUWorks/TeroSubtitler/blob/main/LICENSE)。
- 维护信号：主分支在 2026-06-14 有提交，1.0.2.2 版本于 2026-04-09 发布。[提交](https://github.com/URUWorks/TeroSubtitler/commits/main/) · [Releases](https://github.com/URUWorks/TeroSubtitler/releases)
- 边界：自动翻译、语音转录和配音功能可能调用外部服务或模型；敏感素材上传前需核对其隐私条款和授权，媒体版权仍由使用者负责。
- 建议描述：`跨平台桌面字幕编辑器｜用时间线、波形、转录、翻译和质量检查制作并导出多种字幕格式。`

### 3. 开源应用 · 数字标牌 — Xibo Electron Player

- 主仓库：https://github.com/xibosignage/electron-player
- 形态与能力：Xibo 官方 Electron 数字标牌播放器，面向 Windows 与 Linux，连接 Xibo CMS 后接收布局和排期，并支持本地播放器 API。[README](https://github.com/xibosignage/electron-player/blob/develop/README.md)
- 许可证：[AGPL-3.0](https://github.com/xibosignage/electron-player/blob/develop/LICENSE)。
- 维护信号：develop 分支在 2026-08-26 仍有提交，v4.0.8 于 2026-07-23 发布。[提交](https://github.com/xibosignage/electron-player/commits/develop/) · [Release](https://github.com/xibosignage/electron-player/releases/tag/v4.0.8)
- 边界：这是播放器而非独立 CMS，需要配套 Xibo CMS；应最小化暴露本地 API、CMS 密钥和网络入口，并在目标屏幕硬件上验证媒体兼容性。
- 建议描述：`Windows/Linux 数字标牌播放器｜连接 Xibo CMS 接收布局、媒体和播放排期；属于播放器组件，需配套 CMS。`

### 4. 开源应用 · 游戏服务器 — GameAP

- 主仓库：https://github.com/gameap/gameap
- 形态与能力：可自托管的游戏服务器 Web 控制面板与节点 daemon，支持 Linux、Windows、macOS，可用单二进制或 Docker 部署并集中管理多游戏实例、控制台、文件与资源。[README](https://github.com/gameap/gameap#readme)
- 许可证：[MIT](https://github.com/gameap/gameap/blob/main/LICENSE)。
- 维护信号：主分支在 2026-08-31 仍有提交，v4.4.2 于 2026-08-16 发布。[提交](https://github.com/gameap/gameap/commits/main/) · [Release](https://github.com/gameap/gameap/releases/tag/v4.4.2)
- 安全边界：面板和 daemon 具有进程、文件及服务器控制权限；公网部署需启用 TLS、强认证、节点隔离、最小权限和可靠备份，不能把容器本身视作完整安全边界。
- 建议描述：`跨平台自托管游戏服务器面板｜通过 Web 控制台与节点 daemon 部署、管理和监控多种游戏实例。`

### 5. 开源应用 · 桌面定制 — Lively Wallpaper

- 主仓库：https://github.com/rocksdanister/lively
- 形态与能力：Windows 10/11 桌面应用，可将视频、GIF、网页或应用设为动态壁纸与屏保，支持多显示器、命令行和 API。[README](https://github.com/rocksdanister/lively#readme)
- 许可证：[GPL-3.0](https://github.com/rocksdanister/lively/blob/core-separation/LICENSE)。
- 维护信号：core-separation 分支在 2026-04-30 有提交；最近正式版 v2.2.1.0 于 2025-09-18 发布。[提交](https://github.com/rocksdanister/lively/commits/core-separation/) · [Release](https://github.com/rocksdanister/lively/releases/tag/v2.2.1.0)
- 边界：网页和应用壁纸可能执行主动内容并持续占用 GPU 与电量；只应导入可信素材、核对第三方内容版权，并在笔记本上启用电池或全屏暂停规则。
- 建议描述：`Windows 动态壁纸与屏保工具｜将视频、GIF、网页或应用用于多屏桌面，并提供命令行与 API 控制。`

### 6. 开源应用 · 性能测试 — iperf3

- 主仓库：https://github.com/esnet/iperf
- 形态与能力：客户端—服务器式网络性能 CLI，以 TCP、UDP 或 SCTP 测试端到端吞吐及相关网络指标，主要支持 Linux、FreeBSD 与 macOS。[README](https://github.com/esnet/iperf#readme)
- 许可证：[BSD-3-Clause 类许可](https://github.com/esnet/iperf/blob/master/LICENSE)。
- 维护信号：主分支在 2026-07-10 仍有提交，iperf-3.21 于 2026-04-09 发布。[提交](https://github.com/esnet/iperf/commits/master/) · [Release](https://github.com/esnet/iperf/releases/tag/iperf-3.21)
- 测试边界：工具会主动制造大量网络流量，只能在获授权网络和合适时段运行。结果依赖客户端与服务端硬件、操作系统、协议参数、并发、路径、网络拥塞和测试方法；它衡量的是本次端到端路径，不等于单机综合性能，也不构成运营商带宽承诺。
- 建议描述：`跨平台网络性能 CLI｜以客户端—服务器模式测试 TCP、UDP 或 SCTP 路径；结果依赖硬件、环境、参数和测试方法。`

## 结论

六项均满足“主维护 GitHub 项目 + 可安装、自托管、CLI 或开发组件”的收录边界，并与当前目录 title/URL 不重复。录入时应保留 OVMS 的授权、位置隐私、当地法规与车辆安全提醒，Xibo Electron Player 的组件定位，以及 iperf3 对授权网络和测试方法的限制。
