# 资源导航第 114 批核验

核验日期：2026-09-04。范围：Video & Audio、Other 各两个独立开源产品；仅查阅第一方资料，不安装、注册或上传文件。

## Screenbox — Video & Audio

[维护者仓库](https://github.com/huynhsontung/Screenbox)标明 GPL-3.0，基于 LibVLC，支持 Windows 10 1903+、Windows 11 与 Xbox；具备画中画、帧截图和网络媒体浏览。提供 Microsoft Store/winget 安装途径。与通用编辑器不同，补充 Windows 原生观影用途。网络播放会访问媒体来源，未进行网络隐私或播放实测，不承诺完全离线或零数据传输。

[隐私政策](https://github.com/huynhsontung/Screenbox/blob/main/PRIVACY.md)说明崩溃或错误时会发送匿名诊断报告至 Sentry，包含机型及 Windows 版本/语言；不能概括为无遥测。

```yaml
title: Screenbox
logo: finance.png
url: https://github.com/huynhsontung/Screenbox
description: GPL-3.0 开源 Windows 媒体播放器｜支持 Windows 10 1903+、11 与 Xbox，提供画中画和帧截图；错误时发送匿名诊断报告，播放内容须有授权。
```

## fre:ac — Video & Audio

[维护者仓库](https://github.com/enzo1982/freac)标明 GPL-2.0，提供 Windows、macOS、Linux、FreeBSD 桌面包，支持音频格式转换、CD 抓轨、标签编辑和可选命令行。README 明确具备 freedb/CDDB 查询与提交能力，因此不宣称所有操作无联网。Linux 沙盒包可能限制功能。采用官方仓库链接，不提供受版权限制的内容。

```yaml
title: fre:ac
logo: finance.png
url: https://github.com/enzo1982/freac
description: GPL 开源跨平台音频转换器｜支持 Windows、macOS、Linux 的格式转换、CD 抓轨和标签编辑；元数据查询可能联网，处理内容须有相应授权。
```

## Keyviz — Other

[维护者仓库](https://github.com/mulaRahul/keyviz)标明 GPL-3.0，显示键盘与鼠标操作，供教学演示使用。Windows/macOS 提供安装包；Linux X11 当前须按构建说明体验。macOS 需要输入监控与辅助功能权限，存在另售 Pro 功能，不将所有功能概括为免费。输入可视化可能泄露密码等敏感内容，这是由功能推导的使用提醒，未审计代码或保证隐私。

```yaml
title: Keyviz
logo: finance.png
url: https://github.com/mulaRahul/keyviz
description: GPL-3.0 开源按键与鼠标可视化工具｜Windows、macOS 可安装，Linux X11 需构建；macOS 需输入监控权限，展示前关闭敏感输入，Pro 功能另付费。
```

## win-vind — Other

[维护者仓库](https://github.com/pit-ray/win-vind)与[官方说明](https://pit-ray.github.io/win-vind/)标明 MIT、Windows 平台，提供便携包、安装包及 Vim 式窗口/鼠标/按键控制；普通用户权限可运行。README 列有部分旧版 Windows 与单语言版映射问题，不承诺覆盖所有应用。[使用文档](https://pit-ray.github.io/win-vind/usage/)可加载本地和远程配置，配置具备启动程序等能力，故须先审阅不可信配置；本次未下载或加载配置。

```yaml
title: win-vind
logo: finance.png
url: https://github.com/pit-ray/win-vind
description: MIT 开源 Windows 键盘操作工具｜用 Vim 式按键控制窗口、鼠标和文本，提供便携版；映射兼容性因应用而异，使用外部配置前须审阅。
```

## 去重与验证边界

全量检索 src/data/webstack.yml 的 screenbox/huynhsontung、fre:ac/freac/freac.org/enzo1982、keyviz/mulaRahul、win-vind/pit-ray 均无命中。HandBrake、LosslessCut、MediaInfo、Subtitle Edit、Espanso、Flow Launcher 等已有产品已排除；VidCutter 旧版 macOS 兼容限制明显，未选入。

四个官方仓库 README 均可读取；未运行软件、核验安装签名、测试播放/转换、输入监听或连接网络媒体。仅新增本记录，目录数据及构建验证由主任务完成。
