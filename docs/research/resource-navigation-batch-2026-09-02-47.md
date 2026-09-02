# 资源导航第 47 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按标题及去除末尾 `/`、忽略大小写后的 URL 检查
`src/data/webstack.yml`，下列 6 项均未在全局目录中出现。

| 分类 | 建议条目 | 平台 / 形态 | 许可与近期维护 | 隐私、权限或安全边界及推荐中文描述 |
| --- | --- | --- | --- | --- |
| 开源应用 · 二维码条码 | [Zint](https://github.com/zint/zint) | Windows、macOS、Linux Qt 桌面程序、CLI 与 C 库；支持 50 多种一维及二维码制式 | GitHub 仓库由项目维护者同步；libzint 采用 BSD-3-Clause，GUI/CLI 采用 GPL-3.0-or-later，详见[许可说明](https://github.com/zint/zint#license)；主仓于 2026-07-30 仍有提交。[README](https://github.com/zint/zint#readme) | `跨平台桌面、命令行与 C 库｜生成 QR Code、Data Matrix、PDF417、GS1 及多种一维码；条码内容可被任何扫描者读取，勿嵌入密码、令牌等敏感信息。` |
| 开源应用 · 辅助阅读 | [NormCap](https://github.com/dynobo/normcap) | Windows、macOS、Linux 桌面 OCR 截屏工具；安装包、Flatpak 与 Python 包 | [GPL-3.0-or-later](https://github.com/dynobo/normcap/blob/main/LICENSE)；主仓于 2026-07-10 仍有提交，[v0.6.0](https://github.com/dynobo/normcap/releases/tag/v0.6.0) 发布于 2026-08-31。[README](https://github.com/dynobo/normcap#readme) | `跨平台桌面 OCR 工具｜框选屏幕区域并提取可复制文字，便于朗读、翻译和无障碍处理；截图权限可读取屏幕内容，仅在需要时授权并避开密码、私密消息等敏感区域。` |
| 开源应用 · 剪贴板管理 | [EcoPaste](https://github.com/EcoPasteHub/EcoPaste) | Windows、macOS、Linux Tauri 桌面剪贴板管理器 | [Apache-2.0](https://github.com/EcoPasteHub/EcoPaste/blob/master/LICENSE)；官方主仓于 2026-08-12 仍有提交。[README](https://github.com/EcoPasteHub/EcoPaste#readme) | `Windows、macOS 与 Linux 剪贴板管理器｜本地保存并搜索文本、图片和文件历史，支持固定、分组及加密备份；剪贴板可能包含密码或令牌，应启用敏感内容跳过并定期清理历史。` |
| 开源应用 · 键鼠共享 | [Mousehop](https://github.com/jondkinney/mousehop) | Windows、macOS、Linux 软件 KVM；局域网共享键盘、鼠标与可选文本剪贴板 | [GPL-3.0-or-later](https://github.com/jondkinney/mousehop/blob/main/LICENSE)；[v0.15.6](https://github.com/jondkinney/mousehop/releases/tag/v0.15.6) 发布于 2026-08-25，主仓同期持续维护。[README](https://github.com/jondkinney/mousehop#readme) | `跨平台软件 KVM｜通过局域网共享键盘、鼠标与可选文本剪贴板，采用 DTLS 和设备指纹授权；只授权可信设备并限制防火墙端口，项目尚未缓解时序侧信道。` |
| 开源应用 · 截图工具 | [ScreenToGif](https://github.com/NickeManarin/ScreenToGif) | Windows 桌面截图、录屏与逐帧编辑器 | [MS-PL](https://github.com/NickeManarin/ScreenToGif/blob/master/LICENSE.txt)；官方主仓及 2.43.2 发行于 2026-07-28 仍更新。[README](https://github.com/NickeManarin/ScreenToGif#readme) | `Windows 截图、录屏与逐帧编辑器｜捕获屏幕区域、摄像头或画板并导出 GIF、APNG、视频和图片；录制前检查区域与摄像头内容，分享前预览并移除通知、账号等敏感信息。` |
| 开源应用 · 日历客户端 | [Merkuro](https://github.com/KDE/merkuro) | Linux Plasma 桌面与移动端 PIM 套件；本地 ICS 与多类网络账户 | 主程序采用 GPL-3.0-or-later，仓库部分文件适用其他兼容许可，详见 [REUSE 许可证目录](https://github.com/KDE/merkuro/tree/master/LICENSES)；KDE 官方镜像于 2026-08-31 仍有提交。[README](https://github.com/KDE/merkuro#readme) | `Linux Plasma 桌面与移动端日历套件｜管理本地 ICS、CalDAV、Nextcloud、Google、Exchange 等账户并同步事件与任务；日程可能含位置和联系人等隐私，添加账户时须核对服务权限与同步范围。` |
