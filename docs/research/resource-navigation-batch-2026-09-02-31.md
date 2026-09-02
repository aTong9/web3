# 资源导航第 31 批一手来源核验

日期：2026-09-02  
范围：开源应用 · 终端模拟器、应用启动器、剪贴板管理、键鼠共享、桌面自动化、显示器亮度

## 核验方法与结论

- 完整解析 `src/data/webstack.yml` 的嵌套结构：2 个 taxonomy、345 个分类、2480 个链接；本批六个目标分类各有 6 项。
- 仅采用项目 README、许可证、GitHub Releases 与 commits 等一手来源。
- 以大小写不敏感标题，以及 GitHub 主机名与路径小写、去尾斜杠后的 URL 做全站排重。以下 6 个标题和 URL 均未出现。
- 排除 Ghostty（全站已有同标题与 URL）、Pano（README 明示不再维护）和 SikuliX1（仓库为归档镜像）。

## 推荐条目

### 1. 开源应用 · 终端模拟器 — Wave Terminal

- GitHub：https://github.com/wavetermdev/waveterm
- 形态与平台：Windows、macOS、Linux 可安装桌面终端；支持命令块、持久 SSH、远程文件编辑/预览与可选 AI。
- 许可证与维护：Apache-2.0；仓库未归档，`main` 分支在 2026-09-01 仍有提交，并持续发布 Releases。
- 一手来源：[README](https://github.com/wavetermdev/waveterm#readme)、[LICENSE](https://github.com/wavetermdev/waveterm/blob/main/LICENSE)、[Releases](https://github.com/wavetermdev/waveterm/releases)、[Commits](https://github.com/wavetermdev/waveterm/commits/main)
- 必要边界：README 说明 AI 可读取终端输出、操作文件并连接第三方模型。敏感终端、密钥和生产环境应限制上下文与文件权限，发送外部模型前复核数据范围，并对命令保留人工确认。
- 可录入描述：`Windows、macOS 与 Linux 开源桌面终端｜组织命令块、持久 SSH 会话及远程文件预览，并可连接本地或在线 AI；启用 AI 前审查终端输出、文件访问和外部模型的数据范围。`

### 2. 开源应用 · 应用启动器 — Vicinae

- GitHub：https://github.com/vicinaehq/vicinae
- 形态与平台：Linux 原生命令面板与应用启动器；可搜索应用、文件、窗口和剪贴板，并运行脚本或 React/TypeScript 扩展。
- 许可证与维护：GPL-3.0；`main` 分支在 2026-09-01 仍有提交，2026-08-30 仍发布版本。
- 一手来源：[README](https://github.com/vicinaehq/vicinae#readme)、[LICENSE](https://github.com/vicinaehq/vicinae/blob/main/LICENSE)、[Releases](https://github.com/vicinaehq/vicinae/releases)、[Commits](https://github.com/vicinaehq/vicinae/commits/main)
- 必要边界：扩展和脚本可能读取本地内容或执行系统动作；仅安装可信来源，审查脚本与扩展权限，并按需开启剪贴板历史。
- 可录入描述：`Linux 原生应用启动器与命令面板｜搜索应用、文件、窗口和剪贴板，并可运行脚本或扩展；安装第三方扩展前核对权限与来源。`

### 3. 开源应用 · 剪贴板管理 — Copyous

- GitHub：https://github.com/boerdereinar/copyous
- 形态与平台：GNOME Shell 扩展；管理文本、代码、图片、文件、链接、收藏、标签与自定义动作。
- 许可证与维护：GPL-3.0；`main` 分支在 2026-05-09 仍有提交，2026-04-20 仍发布版本；README 提供 GNOME Extensions 与 GitHub Release 安装方式。
- 一手来源：[README](https://github.com/boerdereinar/copyous#readme)、[LICENSE](https://github.com/boerdereinar/copyous/blob/main/LICENSE)、[Releases](https://github.com/boerdereinar/copyous/releases)、[Commits](https://github.com/boerdereinar/copyous/commits/main)
- 必要边界：剪贴板历史可能留存密码、令牌和个人资料；README 提供隐私模式，应在复制秘密时启用并定期清理历史。
- 可录入描述：`GNOME Shell 剪贴板管理扩展｜保存文本、代码、图片、文件和链接，支持收藏、标签及自定义动作；复制密码或私密内容时使用隐私模式并定期清理历史。`

### 4. 开源应用 · 键鼠共享 — MyKVM

- GitHub：https://github.com/XxMinor/mykvm
- 形态与平台：Windows、macOS、Linux Tauri 桌面软件 KVM；在局域网内共享键盘、鼠标及文本/图片剪贴板。
- 许可证与维护：MIT；`main` 分支在 2026-07-16 仍有提交，2026-07-27 仍发布版本，README 提供三平台安装包。
- 一手来源：[README](https://github.com/XxMinor/mykvm#readme)、[LICENSE](https://github.com/XxMinor/mykvm/blob/main/LICENSE)、[Releases](https://github.com/XxMinor/mykvm/releases)、[Commits](https://github.com/XxMinor/mykvm/commits/main)
- 必要边界：README 明示项目仍属实验阶段，没有配对/PIN，发现流量明文且未认证；输入与剪贴板虽经 QUIC/TLS 加密，也未针对敌对网络加固。只能用于可信局域网，不得把相关端口暴露到公共或不可信网络；macOS 还需 Accessibility/Input Monitoring 权限。
- 可录入描述：`Windows、macOS 与 Linux 软件 KVM｜在可信局域网共享键盘、鼠标及文本/图片剪贴板；项目仍属实验阶段，发现协议未认证，禁止暴露到公共或不可信网络。`

### 5. 开源应用 · 桌面自动化 — OculiX

- GitHub：https://github.com/oculix-org/Oculix
- 形态与平台：Windows、macOS、Linux 视觉 GUI 自动化工具与脚本环境；以 OpenCV 图像匹配驱动键鼠，可覆盖原生应用、Citrix、RDP 和 VNC。
- 许可证与维护：MIT；`master` 分支在 2026-07-08 仍有提交，2026-08-26 仍发布版本；它是接替已归档 SikuliX1 的活跃 fork。
- 一手来源：[README](https://github.com/oculix-org/Oculix#readme)、[LICENSE](https://github.com/oculix-org/Oculix/blob/master/LICENSE)、[Releases](https://github.com/oculix-org/Oculix/releases)、[Commits](https://github.com/oculix-org/Oculix/commits/master)、[安装文档](https://oculix.org/getting-started/installation/)
- 必要边界：视觉匹配会受 DPI、主题和布局变化影响，键鼠模拟也能触发高影响操作；先在受控环境验证，删除、支付、权限修改等敏感流程应保留人工确认。
- 可录入描述：`Windows、macOS 与 Linux 视觉桌面自动化工具｜用图像识别定位界面并模拟键鼠操作，覆盖原生应用和远程桌面；在受控环境先验证流程，敏感或破坏性操作保留人工确认。`

### 6. 开源应用 · 显示器亮度 — wluma

- GitHub：https://github.com/max-baz/wluma
- 形态与平台：Linux/Wayland 后台工具与 CLI；结合屏幕内容和环境光学习偏好，自动控制内屏或 DDC/CI 外接屏亮度。
- 许可证与维护：ISC；仓库未归档，`main` 分支在 2026-08-31 仍有提交，2026-05-08 仍发布版本。
- 一手来源：[README](https://github.com/max-baz/wluma#readme)、[LICENSE](https://github.com/max-baz/wluma/blob/main/LICENSE)、[Releases](https://github.com/max-baz/wluma/releases)、[Commits](https://github.com/max-baz/wluma/commits/main)
- 必要边界：配置可能涉及 Wayland/PipeWire 屏幕捕获、环境光摄像头、`video` 组、udev 或 DDC/CI 权限；应最小化授权，先测试显示器兼容性并保留手动调节，避免亮度突变。
- 可录入描述：`Linux Wayland 自动亮度工具与 CLI｜结合屏幕内容和环境光学习亮度偏好，并控制内置或 DDC/CI 显示器；启用屏幕捕获和背光权限前核对兼容性并保留手动调节。`

## 最终清单

| 分类 | 标题 | URL |
| --- | --- | --- |
| 终端模拟器 | Wave Terminal | https://github.com/wavetermdev/waveterm |
| 应用启动器 | Vicinae | https://github.com/vicinaehq/vicinae |
| 剪贴板管理 | Copyous | https://github.com/boerdereinar/copyous |
| 键鼠共享 | MyKVM | https://github.com/XxMinor/mykvm |
| 桌面自动化 | OculiX | https://github.com/oculix-org/Oculix |
| 显示器亮度 | wluma | https://github.com/max-baz/wluma |
