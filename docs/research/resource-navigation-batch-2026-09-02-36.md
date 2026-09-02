# 资源导航第 36 批：开源应用核验

核验日期：2026-09-02。写入前检查时，`src/data/webstack.yml` 中未发现下列标题或规范化仓库 URL 的重复项。原候选 Cwtch UI 与 Ptyxis 的 GitHub 地址均为 404，因此改用仍由主维护方维护的 GitHub 项目。

| 分类 | 候选 | 形态与相关性 | 许可与当前边界 | 一手来源 |
| --- | --- | --- | --- | --- |
| 去中心化通信 | Session Desktop | Windows、macOS 与 Linux 桌面客户端；通过分布式服务节点存储消息并使用洋葱路由，符合去中心化通信入口。 | GPL-3.0；隐私设计说明不等同于绝对匿名保证，敏感使用前仍应核对官方威胁模型与版本说明。仓库未归档，v1.18.1 发布于 2026-07-10。 | [仓库与 README](https://github.com/session-foundation/session-desktop) · [许可](https://github.com/session-foundation/session-desktop/blob/dev/LICENSE) · [v1.18.1](https://github.com/session-foundation/session-desktop/releases/tag/v1.18.1) |
| 文件管理器 | lf | Go 编写的跨平台终端文件管理器，支持 Linux、macOS、BSD 与 Windows。 | MIT；主要面向键盘和终端工作流，不是图形化文件管理器。仓库未归档，r42 发布于 2026-07-31。 | [仓库与 README](https://github.com/gokcehan/lf) · [许可](https://github.com/gokcehan/lf/blob/master/LICENSE) · [r42](https://github.com/gokcehan/lf/releases/tag/r42) |
| PDF 阅读 | PDF.js | Mozilla 支持、社区驱动的 HTML5 PDF 查看器与 JavaScript 库，提供浏览器查看器并内置于 Firefox。 | Apache-2.0；属于 Web 查看器/开发库，不是原生桌面 PDF 编辑器，直接本地打开时通常需要 Web 服务。仓库未归档，v6.3.289 发布于 2026-08-29。 | [仓库与 README](https://github.com/mozilla/pdf.js) · [许可](https://github.com/mozilla/pdf.js/blob/master/LICENSE) · [v6.3.289](https://github.com/mozilla/pdf.js/releases/tag/v6.3.289) |
| SSH 客户端 | Termora | Windows、macOS 与 Linux 的 Kotlin/JVM 终端模拟器和 SSH 客户端，含密钥、SSH Agent 与图形化 SFTP 管理。 | AGPL-3.0 或商业许可双许可；默认开发分支为 `2.x`，GitHub latest release 仍为 1.0.17（2025-06-17），不应把开发分支表述为稳定发行版。 | [仓库与 README](https://github.com/TermoraDev/termora) · [1.0.17](https://github.com/TermoraDev/termora/releases/tag/1.0.17) |
| 终端模拟器 | Cool Retro Term | 模拟老式 CRT 显示效果的 Qt6 终端模拟器，提供 Linux AppImage 与 macOS DMG，并可源码构建。 | 仓库随附 GPL-2.0 与 GPL-3.0 文本；偏视觉风格化，且 2.0.0-beta2 仍是测试版，不宜替代强调稳定性或无障碍性的通用终端。仓库未归档，该测试版发布于 2026-05-31。 | [仓库与 README](https://github.com/Swordfish90/cool-retro-term) · [GPL-2.0 文本](https://github.com/Swordfish90/cool-retro-term/blob/master/gpl-2.0.txt) · [2.0.0-beta2](https://github.com/Swordfish90/cool-retro-term/releases/tag/2.0.0-beta2) |
| 文件比较 | diff-pdf | Windows、macOS 与 Linux 的 PDF 视觉比较工具；CLI 可返回差异状态或生成高亮差异 PDF，也提供简单 GUI。 | GPL-2.0；README 明确项目不主动开发或提供支持，当前以接受维护贡献为主，使用前应先用样本文档验证比较结果。仓库未归档，v0.5.3 发布于 2026-03-28。 | [仓库与 README](https://github.com/vslavik/diff-pdf) · [许可](https://github.com/vslavik/diff-pdf/blob/master/COPYING) · [v0.5.3](https://github.com/vslavik/diff-pdf/releases/tag/v0.5.3) |

