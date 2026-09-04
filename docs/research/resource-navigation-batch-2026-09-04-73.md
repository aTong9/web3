# 资源导航第 73 批候选核验（2026-09-04）

本批补充桌面定制、应用启动器、开源浏览器，三个目标分类写入前各 7 项。对完整 `src/data/webstack.yml` 检索 `waybar|alexays|walker|abenz1267|qutebrowser` 无匹配，标题、主仓 URL 和维护者名称未发现重复。仅核验第一方仓库、README、许可证与安装文档；未安装运行，不推测维护日期，不代表安全审计或平台兼容性验收。

| 分类 | 项目与第一方证据 | 形态、许可与范围 | 建议中文描述 |
| --- | --- | --- | --- |
| 开源应用 · 桌面定制 | [Waybar 主仓与 README](https://github.com/Alexays/Waybar)、[MIT LICENSE](https://github.com/Alexays/Waybar/blob/master/LICENSE) | Linux Wayland 桌面状态栏；README 列出工作区、音量、网络、系统资源和自定义脚本模块，支持发行版软件包与 Meson/Ninja 源码安装。README 明确没有官方网站，警告冒充官网；与已收录 Polybar 是不同项目。 | Linux Wayland 可定制状态栏｜通过发行版包或源码安装，组合工作区、音量、网络和系统监控模块；须匹配合成器，只运行可信自定义脚本，警惕冒充官网的下载站。 |
| 开源应用 · 应用启动器 | [Walker 主仓与 README](https://github.com/abenz1267/walker)、[GPL-3.0 LICENSE](https://github.com/abenz1267/walker/blob/master/LICENSE) | Linux GTK4/Rust 图形启动器，支持应用、文件、计算和命令；README 给出 Cargo 源码与 Nix 安装方式，明确要求运行 Elephant 并安装相应 providers。Elephant 是配套后端，不将其另算资源。 | Linux 图形应用启动器｜通过 Nix 或源码安装，配合 Elephant 后端搜索应用、文件并执行命令；需配置对应提供器，启用剪贴板与密码集成前确认隐私和权限，仅运行可信命令。 |
| 开源应用 · 开源浏览器 | [qutebrowser 主仓与 README](https://github.com/qutebrowser/qutebrowser)、[GPL-3.0 LICENSE](https://github.com/qutebrowser/qutebrowser/blob/main/LICENSE)、[官方安装文档](https://qutebrowser.org/doc/install.html) | 基于 Python/Qt、键盘优先的 Vim 风格浏览器。安装文档覆盖 Linux、macOS 和 Windows，README 引导官方 Releases，支持默认 QtWebEngine 后端；README 明确不建议使用有已知安全问题的旧 QtWebKit。 | Windows、macOS 与 Linux 键盘优先浏览器｜通过官方发布包或平台安装方式使用 Vim 风格网页导航；保持浏览器与 QtWebEngine 更新，避免旧 QtWebKit 后端，不将键盘操作等同于隐私保障。 |

脚本信任、集成权限检查和更新要求是根据项目功能提出的使用建议，不是已执行的安全验证。目录写入、解析去重和页面验收由主任务执行。
