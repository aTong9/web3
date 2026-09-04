# 资源导航第 71 批候选核验（2026-09-04）

本批补充运动健康、游戏引擎、桌面自动化。写入前对完整 `src/data/webstack.yml` 检索 `runnerup|runner.up|fyrox|rg3d|pyautogui` 无匹配；三个目标分类各 7 项。Fyrox 旧称 rg3d，一并去重。只读第一方说明与许可证，不安装软件、不推测维护日期；未进行实际兼容性或安全审计。

| 分类 | 条目与第一方证据 | 形态、许可与范围 | 建议中文描述 |
| --- | --- | --- | --- |
| 开源应用 · 运动健康 | [RunnerUp 主仓与 README](https://github.com/jonasoreland/runnerup)、[GPL v3 LICENCE](https://github.com/jonasoreland/runnerup/blob/master/LICENCE) | Android 运动记录应用，README 提供 GitHub Releases、Play Store、F-Droid 入口；用 GPS 记录配速、距离、时间，支持语音提示、间歇训练和外部服务同步。F-Droid 版本功能有差异。README 误链 LICENSE，实际许可证文件名为 LICENCE，已读取确认 GPL v3。 | Android 运动记录应用｜通过 GPS 追踪跑步配速、距离和时间，支持语音提示与间歇训练；仅作个人运动记录，分享或同步前检查路线隐私与第三方数据权限，不替代医疗建议。 |
| 开源应用 · 游戏引擎 | [Fyrox 主仓与 README](https://github.com/FyroxEngine/Fyrox)、[MIT LICENSE](https://github.com/FyroxEngine/Fyrox/blob/master/LICENSE.md)、[官方安装指南](https://fyrox-book.github.io/beginning/manual_installation.html) | Rust 二维/三维引擎、场景编辑器与项目生成 CLI；官方指南使用 Cargo 安装 fyrox-template，再生成项目和运行编辑器。指南提示最新 Git 版本可能出现 API 不兼容，可固定版本或提交。此描述不承诺未经测试的具体平台支持。 | Rust 二维与三维游戏引擎及场景编辑器｜通过 Cargo 安装项目生成工具，构建互动场景与游戏；升级前备份项目并固定兼容版本，第三方资源和脚本须分别核查授权与可信度。 |
| 开源应用 · 桌面自动化 | [PyAutoGUI 主仓与 README](https://github.com/asweigart/pyautogui)、[BSD-3-Clause LICENSE](https://github.com/asweigart/pyautogui/blob/master/LICENSE.txt)、[官方文档与 Fail-Safes](https://pyautogui.readthedocs.io/en/latest/index.html) | pip 安装的 Python 库，Windows、macOS、Linux；模拟键鼠、截图与图像定位。Linux 使用 X11；上游说明仅支持主显示器，不支持移动设备，不提供 OCR。文档明确建议保留默认屏幕角落紧急停止。 | Windows、macOS 与 Linux 桌面自动化 Python 库｜通过 pip 安装，控制键鼠、截图和图像定位；主要面向主显示器，保留默认紧急停止机制，先在测试环境验证并为敏感操作保留人工确认。 |

隐私、备份与人工确认建议基于功能边界提出，不构成软件安全或医疗结论。目录写入、去重和页面验证由主任务执行。
