# 资源导航第 143 批来源核验

核验日期：2026-09-04。图片查看、音频标签、播客客户端各一项。

## 去重与互补

已阅读三个当前分类，并对完整 `src/data/webstack.yml` 检索 feh / derf/feh、Mutagen / quodlibet/mutagen、castero / xgi/castero，无产品或 URL 命中。nomacs、Newsboat 已在其他分类收录而排除。Mutagen 虽为 Quod Libet 等软件所用底层库，但它是独立的可编程标签工具，不重复播放器入口。
Escapepod 的 GitHub 仓库已只读并迁往 Codeberg，本轮未将其作为活跃 GitHub 项目收录；Tsacdop 未继续采用。

## 开源应用 · 图片查看

```yaml
title: feh
logo: finance.png
url: https://github.com/derf/feh
description: 面向命令行用户的轻量图片查看与缩略图目录工具｜Linux/FreeBSD 的 X11 环境；许可含署名要求，远程图片与自定义动作需另核联网和文件操作
```

- [官方仓库](https://github.com/derf/feh)说明查看、缩略图/文本列表、可配置快捷键、图片说明和 X11 背景设置；支持从命令行或文件管理器启动，与纯 GUI 浏览器互补。
- README 列出 Linux 发行版及 FreeBSD 包与源码构建依赖，包括 Imlib2、X11；不是原生 Wayland 查看器，不承诺 Windows/macOS 原生包。
- [COPYING 原文](https://raw.githubusercontent.com/derf/feh/master/COPYING)是允许使用、修改、分发的宽松许可，除保留声明外还要求文档和软件包中的使用致谢；不简单标成标准 MIT。核心无需订阅，第三方图像库许可单独适用。
- libcurl 可用于远程图片，届时会连接图片来源，不等于所有使用都离线。自定义动作可运行脚本，涉及文件写入、删除或外部程序时须先核查；不得将图片查看器整体当成只读沙箱。

## 开源应用 · 音频标签

```yaml
title: Mutagen
logo: finance.png
url: https://github.com/quodlibet/mutagen
description: Python 音频元数据读写库，可编程处理 ID3、FLAC、MP4 等标签｜Windows、macOS、Linux，GPL-2.0-or-later；不是图形编辑器，批量写入前须备份
```

- [官方文档](https://mutagen.readthedocs.io/en/latest/)明确 Python 模块形态、多音频格式、标签编辑与 GPLv2 或后续版本；列出 Linux、Windows、macOS，提供 pip 安装入口。
- 补充自动化脚本和自定义标签处理，不重复 MusicBrainz Picard 等图形识别工具。库本身处理文件元数据，不承诺自动在线识别专辑或付费音乐服务访问。
- 源码免费、无必需云账户；调用保存 API 会写入文件，错误字段或格式转换可能影响播放器兼容性，先备份并用副本验证。若调用方加入远程元数据查询，网络隐私边界由该调用方决定，不能以此库本地运行替其担保。
- [官方仓库](https://github.com/quodlibet/mutagen)由文档直接链接，提供源码及发行入口；没有运行或扫描任何音乐库。

## 开源应用 · 播客客户端

```yaml
title: castero
logo: finance.png
url: https://github.com/xgi/castero
description: Python 终端播客客户端，管理订阅、队列、离线集数与 OPML 导入导出｜需 SQLite 及 VLC 或 mpv 播放后端，MIT；订阅刷新与播放会连接节目来源
```

- [官方仓库](https://github.com/xgi/castero)明确 MIT，提供终端界面、离线保存、播放队列、速度调整和 OPML 导入导出；补充无需图形桌面的使用方式。
- README 提供 PyPI/源码安装，要求 Python、SQLite 与 VLC 或 mpv/libmpv；未明确承诺所有操作系统的现成安装支持，卡片使用运行依赖描述而非虚构跨平台范围。README 的最低依赖版本较旧，安装前应核目标环境兼容性，不宣称持续高频维护。
- 无客户端订阅费承诺之外的付费内容授权；节目提供方可能有付费订阅、版权或地域条件。刷新 RSS、流式播放和下载会向外部主机暴露请求信息，离线播放也需要先取得节目。
- 数据库、下载与 OPML 会保存收听兴趣、订阅地址，私人 RSS 可能含令牌；导出和分享应脱敏。清理本地数据库可能丢失订阅信息，先备份，不直接手工改库。本轮未下载节目或读取任何用户订阅。

## 边界

仅新增研究文件，不修改 YAML、不安装、不打开私人图片、不改标签、不播放或下载节目。来源研究不替代运行兼容性和安全验证。
