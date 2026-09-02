# 资源导航第 39 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。已按去除末尾 `/`、忽略大小写的规则检查
`src/data/webstack.yml`：以下 6 个标题与 URL 均无全局重复。

| 分类 | 建议条目 | 形态 / 平台 | 相关性与许可 | 维护状态与边界 |
| --- | --- | --- | --- | --- |
| 开源应用 · 车载系统 | [Eclipse Velocitas Python SDK](https://github.com/eclipse-velocitas/vehicle-app-python-sdk) | Python SDK；Python 3.10+ | 官方 README 说明它用于按 Velocitas 开发模型实现 Vehicle App，并集成车辆模型与 Vehicle Data Broker；[Apache-2.0](https://github.com/eclipse-velocitas/vehicle-app-python-sdk/blob/main/LICENSE)。 | 仓库可正常解析且仍由 Eclipse Velocitas 维护；README 明示处于 **alpha**，应标注为开发期 SDK，而非成熟车载终端应用。[README](https://github.com/eclipse-velocitas/vehicle-app-python-sdk#readme) |
| 开源应用 · 窗口管理 | [Hyprland](https://github.com/hyprwm/Hyprland) | Linux Wayland compositor | 官方 README 定义为动态平铺 Wayland 合成器，支持平铺、浮动、全屏、动态工作区和插件；[BSD-3-Clause](https://github.com/hyprwm/Hyprland/blob/main/LICENSE)。 | 主仓库持续维护；仅适用于 Wayland/Linux，不应描述成 Windows、macOS 或 X11 窗口管理器。[README](https://github.com/hyprwm/Hyprland#readme) · [Releases](https://github.com/hyprwm/Hyprland/releases) |
| 开源应用 · 创客制造 | [Fritzing](https://github.com/fritzing/fritzing-app) | 桌面电子设计应用；Windows、macOS、Linux | 官方 README 面向创客、教育和电子原型，提供面包板视图、电路表达和 PCB 布局；源码含 [GPL-2.0](https://github.com/fritzing/fritzing-app/blob/develop/LICENSE.GPL2) 许可文件。 | 主仓库持续维护；应用源码、元件库及第三方组件许可可能不同，分发或商用前应分别核对。[README](https://github.com/fritzing/fritzing-app#readme) · [Releases](https://github.com/fritzing/fritzing-app/releases) |
| 开源应用 · 磁盘分析 | [dua-cli](https://github.com/Byron/dua-cli) | CLI；Linux、macOS、Windows | README 将其定义为并行磁盘占用分析器，支持定位并可选删除多余数据；[MIT](https://github.com/Byron/dua-cli/blob/main/LICENSE)。 | 主仓库持续维护并提供多平台二进制；删除功能不可恢复，执行前必须确认目标路径并保留备份。[README](https://github.com/Byron/dua-cli#readme) · [Releases](https://github.com/Byron/dua-cli/releases) |
| 开源应用 · 磁盘健康 | [QDiskInfo](https://github.com/edisionnano/QDiskInfo) | Linux Qt 桌面应用；smartctl 前端 | README 明确显示现代硬盘的 SMART 数据，分类比 HDD Fan Control 更准确；[GPL-3.0](https://github.com/edisionnano/QDiskInfo/blob/master/LICENSE)。 | 仓库可正常解析并提供 AppImage/发行包；依赖 smartmontools，SMART 正常也不能替代备份，设备操作需谨慎授权。[README](https://github.com/edisionnano/QDiskInfo#readme) · [Releases](https://github.com/edisionnano/QDiskInfo/releases) |
| 开源应用 · 代码搜索 | [ast-grep](https://github.com/ast-grep/ast-grep) | CLI；npm、pip、Cargo、Homebrew、Scoop 等 | 官方 README 定义为基于 AST 的结构化代码搜索、检查和重写工具，比面向 PDF/Office 等内容检索的 ripgrep-all 更贴合“代码搜索”；[MIT](https://github.com/ast-grep/ast-grep/blob/main/LICENSE)。 | 主仓库持续维护并提供多种安装渠道；结构化规则依赖语言解析与模式语义，批量重写前应先审查差异并保留版本控制。[README](https://github.com/ast-grep/ast-grep#readme) · [Releases](https://github.com/ast-grep/ast-grep/releases) |

## 被替换的原候选

- `https://github.com/eclipse-velocitas/velocitas-sdk-python` 不存在；使用 Eclipse Velocitas 当前官方仓库
  `vehicle-app-python-sdk`。
- [HDD Fan Control](https://github.com/desbma/hddfancontrol) 的用途是依据硬盘温度调节风扇，
  不是 SMART 健康诊断；改用 QDiskInfo。
- [ripgrep-all](https://github.com/phiresky/ripgrep-all) 适合检索 PDF、电子书、Office 和压缩包等内容；
  本分类更需要源码结构检索，因此采用 ast-grep。
