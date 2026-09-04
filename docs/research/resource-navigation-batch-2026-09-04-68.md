# 资源导航第 68 批候选核验（2026-09-04）

本批补充音频标签、显示器亮度与重复文件清理。核验第一方 README、构建说明和许可证；不安装候选，不推测最近维护日期。写入前全局检索 `tagger` 独立单词、`nickvision`、`ddcui`、`dupd`、`jvirkki`、`virkki.com` 均无匹配；TimeTagger 是既有时间记录工具，不是本批 Tagger。三个目标分类当前各 7 项。

| 分类 | 条目与第一方证据 | 形态、许可与范围 | 建议中文描述 |
| --- | --- | --- | --- |
| 开源应用 · 音频标签 | [Tagger 主仓](https://github.com/NickvisionApps/Tagger)、[README](https://github.com/NickvisionApps/Tagger/blob/main/README.md)、[MIT LICENSE](https://github.com/NickvisionApps/Tagger/blob/main/LICENSE) | Nickvision 音乐标签桌面应用；README 展示 GNOME 与 WinUI，提供 Flathub、Snap、AUR 与 Releases 安装入口。支持批量标签和封面、同步歌词及 LRC、文件名与标签转换、MusicBrainz 查询。为保守起见，目录突出有明确 Flathub 安装入口的 Linux，不承诺每个平台的预编译版本可用。 | Linux 音频标签桌面应用｜通过 Flatpak 等方式安装，批量编辑标签、封面与歌词，并转换文件名和标签；写入前备份原文件，在线元数据查询须注意数据发送范围。 |
| 开源应用 · 显示器亮度 | [ddcui 主仓](https://github.com/rockowitz/ddcui)、[README](https://github.com/rockowitz/ddcui/blob/0.7.0-dev/README.md)、[GPL-2.0 COPYING](https://github.com/rockowitz/ddcui/blob/0.7.0-dev/COPYING)、[官方概览与安装入口](https://www.ddcutil.com/ddcui_main/) | Linux Qt 图形应用，ddcutil 的独立 GUI 仓库与安装包，不是将已收录 CLI 换名。官方提供 Debian/Ubuntu、Fedora 等预编译包入口及源码构建文档；支持 DDC/CI 屏幕特性查看与修改。官方明确界面数值可能与屏幕实际状态不同步，滚轮也可能误改滑块。 | Linux 显示器设置 GUI｜基于 ddcutil，通过 DDC/CI 查看和调节亮度等屏幕参数；需兼容显示器，数值可能不同步，操作后核对屏幕实际状态并避免滚轮误调。 |
| 开源应用 · 重复文件清理 | [dupd 主仓](https://github.com/jvirkki/dupd)、[README](https://github.com/jvirkki/dupd/blob/master/README)、[BUILDING](https://github.com/jvirkki/dupd/blob/master/BUILDING)、[GPL-3.0 COPYING](https://github.com/jvirkki/dupd/blob/master/COPYING)、[设计目标](https://github.com/jvirkki/dupd/blob/master/docs/index.md) | 重复文件检测 CLI，源码构建支持 Linux、macOS、Solaris、OpenBSD、FreeBSD；依赖 SQLite 和 OpenSSL，支持 make install。官方建议构建 release tag 而非开发分支。工具扫描并报告重复项，本身不删除文件，提供清理前的筛查能力。 | Linux、macOS 与 BSD 等平台重复文件检测 CLI｜源码编译安装，扫描并分批查询重复项，本身不删除文件；适合清理前审查，实际删除仍须人工核对并保留备份。 |

风险提示是基于功能的使用建议，不代表安全审计或运行验收。排除失效的旧 jdupes GitHub 地址与不明镜像，不将搜索结果中的第三方副本当作主维护仓库。目录条目写入及页面验证由主任务另行执行。
