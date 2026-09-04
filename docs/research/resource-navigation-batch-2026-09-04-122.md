# 资源导航补充研究 · Batch 122

核验日期：2026-09-04。研究范围为 3 个开源工具；未修改 YAML、安装程序、上传数据或操作硬件。

## 去重与取舍

读取三个目标分类后，在完整 `src/data/webstack.yml` 检索 LibrePCB / Libre PCB、GPXSee / GPX See / tumic0、FamiStudio / Fami Studio / BleuBleu，无匹配。SolveSpace、Sonic Pi、OpenPnP、LibreCAD、OrcaSlicer、TuxGuitar 已在其他分类收录，未重复加入。sfizz-ui 仓库明确标注 2026-06-21 归档，本轮不采用。

## 开源应用 · 创客制造

```yaml
- title: LibrePCB
  logo: finance.png
  url: https://github.com/LibrePCB/LibrePCB
  description: Windows、macOS、Linux 开源电路板设计套件｜完成原理图与 PCB 设计流程；使用稳定发行版并备份工程，制造前复核封装、连接和电气安全。
```

- [官方仓库](https://github.com/LibrePCB/LibrePCB)：GPL-3.0 许可标识，明确三个桌面平台及官方稳定版本下载和 PCB 全流程入门文档入口。补充制造导向 PCB 工程，与 Fritzing 的面包板表达侧重不同。
- [官方发布页](https://github.com/LibrePCB/LibrePCB/releases)：可访问版本记录。README 特别警告 master 是不稳定开发版本，可能破坏工作区、库和项目，实际使用应选择稳定发行版。
- 硬件边界：绘图软件并不保证电路可制造或安全；生产前人工核对封装、连接和规格。下载元件库、调用外部制造服务时另核对数据与服务条款；不声称零联网。

## 开源应用 · 地图出行

```yaml
- title: GPXSee
  logo: finance.png
  url: https://github.com/tumic0/GPXSee
  description: Windows、macOS、Linux 轨迹查看与分析工具｜读取 GPX、FIT、KML 等日志并显示海拔、速度曲线；保护位置记录，在线底图会联网，路线不代表现实通行许可。
```

- [官方仓库](https://github.com/tumic0/GPXSee)：Qt 应用，GPL-3.0-only（第三方组件另有兼容许可）；确认常见轨迹格式、图表、在线与离线地图、桌面平台及 Android 构建。卡片聚焦桌面日志复盘，区别于导航及路径规划引擎。
- README 提供 Windows/macOS 构建和 Linux 软件包入口；明确不推荐当前 Flathub 包，故未将 Flatpak 作为安装建议。
- [官方网站](https://gpxsee.org/)和[发布页](https://github.com/tumic0/GPXSee/releases)可读。单独尝试官网 download.html 路径失败，不把该猜测路径作为资源链接；仓库已有维护者提供的下载入口。
- 数据边界：轨迹可能包含住址和活动规律，分享前脱敏；底图许可与时效另核对，不当作紧急导航或通行许可保证。

## 开源应用 · 音乐制作

```yaml
- title: FamiStudio
  logo: finance.png
  url: https://github.com/BleuBleu/FamiStudio
  description: Windows、macOS、Linux 芯片音乐编辑器｜以 NES/Famicom 声音风格创作与导出音乐；从官方入口安装，核对导入曲目与采样授权，保存工程备份。
```

- [官方仓库](https://github.com/BleuBleu/FamiStudio)：MIT 许可标识，桌面及 Android 工程，提供编译版本与源码；第三方依赖许可不能由主项目 MIT 一概替代。
- [官网](https://famistudio.org/)明确面向芯片音乐创作者与 NES 自制开发者，提供 Windows 安装/便携包、macOS、Linux 等下载。macOS 包未签名且可能需 .NET；不建议盲目绕过安全警告，应核对维护者来源。Linux 独立包需自行准备 .NET，FlatHub 处理依赖。
- [发布页](https://github.com/BleuBleu/FamiStudio/releases)和官网显示 4.5.3 于 2026-08-10 发布，有导入、导出和崩溃修复；版本只作为维护证据，不写死在卡片。
- 内容边界：软件许可不赋予第三方游戏音乐或采样再发布权。无需 NES 硬件即可使用桌面编辑器；未测试音频设备、所有格式或移动端商店版本。

## 限制

核验为第一方文档/仓库与发布记录检查，不是安装、安全审计、硬件认证或实际数据测试。风险提示属于使用建议，不能理解为已验证项目具备零遥测或全离线保证。
