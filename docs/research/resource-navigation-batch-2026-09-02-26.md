# 资源导航第 26 批一手来源核验

日期：2026-09-02

范围：为“二维码条码、截图工具、图片查看、图片压缩、文件比较、重复文件清理”各筛选一个官方或主维护 GitHub 项目。候选已对 `src/data/webstack.yml` 全文件按 title 不区分大小写、URL 不区分大小写并忽略末尾斜杠检查，六项均未命中。

## 推荐项目

### 1. 开源应用 · 二维码条码 — ZXing-C++

- 主仓库：https://github.com/zxing-cpp/zxing-cpp
- 形态与能力：以 C++20 编写、公开 API 兼容 C++17 的多格式一维码/矩阵码处理库，可读取和写入 QR Code、Data Matrix、PDF417、EAN/UPC、Code 39/93/128 等格式，并提供 Android、iOS、Python、.NET、Qt、WebAssembly 等绑定；通用构建支持 Windows、macOS 与 Linux。[README](https://github.com/zxing-cpp/zxing-cpp#readme) · [API 文档](https://zxing-cpp.github.io/zxing-cpp/docs/)
- 许可证：[Apache-2.0](https://github.com/zxing-cpp/zxing-cpp/blob/master/LICENSE)。
- 维护信号：master 分支在 2026-09-01 仍有提交，最近一次 release feed 更新于 2026-07-29。[提交](https://github.com/zxing-cpp/zxing-cpp/commits/master/) · [Releases](https://github.com/zxing-cpp/zxing-cpp/releases)
- 安全边界：条码只是数据载体；扫描得到的 URL、登录指令、支付或设备配置内容都应视为不可信输入，应用集成时需在打开链接或执行动作前展示目标并再次确认。
- 建议描述：`跨平台 C++ 条码处理库｜读取和生成 QR Code、Data Matrix、PDF417 及常见一维码；扫描结果需按不可信输入处理。`

### 2. 开源应用 · 截图工具 — Shutter

- 主仓库：https://github.com/shutter-project/shutter
- 形态与能力：Linux 桌面截图应用，可捕获区域、窗口、整屏、多显示器、菜单或网站，并在内置编辑器中添加文字、箭头、形状、裁剪和像素化，再保存或上传。[官方功能页](https://shutter-project.org/) · [README](https://github.com/shutter-project/shutter#readme)
- 平台限制：官方 FAQ 明示核心截图逻辑依赖 Linux/X Server；Wayland 当前主要通过 XDG Portal 捕获，实际常为全屏且取决于 portal 后端，不能把它描述成完整跨平台或完整 Wayland 截图器。[Wayland/平台 FAQ](https://shutter-project.org/faq-help/?replytocom=841791)
- 许可证：[GPL-3.0-or-later](https://github.com/shutter-project/shutter/blob/master/COPYING)。
- 维护信号：master 分支在 2026-08-25 仍有提交，v0.99.7 于 2026-05-09 发布。[提交](https://github.com/shutter-project/shutter/commits/master/) · [Releases](https://github.com/shutter-project/shutter/releases)
- 隐私边界：截图、EXIF 与上传功能可能包含账号、通知、地址、访问令牌或文件路径；分享前应裁剪或遮盖敏感信息，上传会把内容交给第三方图床。
- 建议描述：`Linux 截图与标注应用｜捕获区域、窗口或整屏并添加文字、箭头和像素化；Wayland 捕获能力取决于 Portal。`

### 3. 开源应用 · 图片查看 — qimgv

- 主仓库：https://github.com/easymodo/qimgv
- 形态与能力：Windows、GNU/Linux 与 FreeBSD 桌面图片查看器，提供文件夹/缩略图浏览、高质量缩放、裁剪、旋转、尺寸调整、快速复制移动和可选 libmpv 视频播放；Windows 提供便携包，Linux/BSD 可通过常见包管理器安装。[README](https://github.com/easymodo/qimgv#readme)
- 许可证：[GPL-3.0](https://github.com/easymodo/qimgv/blob/master/LICENSE)。
- 维护信号：master 分支在 2026-01-19 仍有提交；正式 release feed 最近更新于 2022-05-10，README 明示维护更新可能较慢，因此应把它视为仍有提交但发布节奏较慢的项目。[提交](https://github.com/easymodo/qimgv/commits/master/) · [Releases](https://github.com/easymodo/qimgv/releases)
- 数据安全边界：应用支持移动、丢进回收站、永久删除和执行自定义 shell 脚本；批量整理前应确认目标目录并保留备份，未知图片与自定义脚本也不应被当作可信内容。
- 建议描述：`Windows/Linux/BSD 图片查看器｜提供缩略图浏览、高质量缩放和基础编辑；移动、删除或运行脚本前需确认文件。`

### 4. 开源应用 · 图片压缩 — Caesium Image Compressor

- 主仓库：https://github.com/Lymphatus/caesium-image-compressor
- 形态与能力：Windows 10+、macOS 12+ 与 64 位 Linux 桌面图片压缩应用，支持 JPG、PNG 与 WebP，可调压缩质量并可选降低分辨率；Windows 提供安装/便携包、macOS 提供 DMG，Linux 可自行构建或使用第三方包。[README](https://github.com/Lymphatus/caesium-image-compressor#readme)
- 许可证：[GPL-3.0](https://github.com/Lymphatus/caesium-image-compressor/blob/main/LICENSE)。
- 维护信号：main 分支在 2026-04-07 仍有提交，v2.8.5 于 2025-05-17 发布，维护者同时在官方 issue 中规划 v3。[提交](https://github.com/Lymphatus/caesium-image-compressor/commits/main/) · [v2.8.5](https://github.com/Lymphatus/caesium-image-compressor/releases/tag/v2.8.5) · [v3 规划](https://github.com/Lymphatus/caesium-image-compressor/issues/334)
- 质量与隐私边界：有损压缩或降低分辨率会不可逆丢失细节，应输出到新位置并保留原图；桌面版可本地处理，但 README 提到的浏览器版属于另一部署形态，敏感图片是否离机需按实际使用方式确认。
- 建议描述：`跨平台桌面图片压缩器｜批量压缩 JPG、PNG、WebP 并可调整分辨率；有损处理前应保留原图。`

### 5. 开源应用 · 文件比较 — Kompare

- 主仓库：https://github.com/KDE/kompare
- 形态与能力：KDE 官方 Linux 图形化文件差异工具，可递归比较文件或目录、查看多种 diff 格式、创建和应用补丁，并交互式合并差异。[KDE 应用页](https://apps.kde.org/kompare/) · [README](https://github.com/KDE/kompare#readme)
- 许可证：KDE 应用页标示 [GPL-2.0+](https://apps.kde.org/kompare/)，仓库使用 REUSE/SPDX 文件级声明并包含 [GPL-2.0-or-later](https://github.com/KDE/kompare/blob/master/LICENSES/GPL-2.0-or-later.txt) 等许可证文本；复用源码时仍需按具体文件头核对。
- 维护信号：master 分支在 2026-08-13 仍有提交，KDE 应用页列出 4.2.26080 于 2026-08-20 发布。[提交](https://github.com/KDE/kompare/commits/master/) · [Releases](https://github.com/KDE/kompare/releases)
- 数据安全边界：比较内容、补丁与路径可能泄露密钥或业务数据；分享 diff 前需清理敏感行。应用补丁或合并会改写文件，应先审阅差异并在版本控制或备份下操作。
- 建议描述：`KDE 图形化文件与目录比较工具｜查看多种 diff、创建或应用补丁并辅助合并；写入前应审阅差异并保留版本。`

### 6. 开源应用 · 重复文件清理 — fdf

- 主仓库：https://github.com/josephvusich/fdf
- 形态与能力：Go 编写的跨平台重复文件 CLI，支持 Linux、macOS 和 Windows，可按内容或文件名等字段识别重复项，并通过删除、硬链接或写时复制克隆进行去重；也能输出 JSON 报告。[README](https://github.com/josephvusich/fdf#readme)
- 许可证：主代码为 [Apache-2.0](https://github.com/josephvusich/fdf/blob/master/LICENSE)，仓库另含源自 git-lfs 和 Go 标准库的 MIT/BSD 许可文件。
- 维护信号：master 分支在 2026-05-30 仍有提交，release feed 在 2026-09-01 更新。[提交](https://github.com/josephvusich/fdf/commits/master/) · [Releases](https://github.com/josephvusich/fdf/releases)
- 数据丢失边界：`--delete` 会删除文件，`--link`/`--clone` 会改变存储语义；应先用 `--dry-run`、确认保留规则和目标文件系统能力，并在执行前保持独立备份。去重结果不能替代备份。
- 建议描述：`跨平台重复文件 CLI｜按内容查重并支持删除、硬链接或写时复制；先用 dry-run 核对并保留独立备份。`

## 结论

六项均为当前可访问且未归档的官方或主维护 GitHub 项目，并与目录现有 title/规范化 URL 不重复。录入时应保留 ZXing-C++ 的不可信扫码输入边界、Shutter 的 Wayland 限制、Caesium 的有损质量边界，以及 qimgv、Kompare、fdf 的文件改写或删除风险。
