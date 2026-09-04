# 资源导航补充研究 · Batch 131

日期：2026-09-04。音视频、工时追踪、日历客户端各 1 项；只读研究并写入此记录。

## 去重与筛选

已阅读三个目标分类全部现有条目，并搜索完整 `src/data/webstack.yml` 的产品、别名和仓库地址。QCTools / bavc、Wakapi / muety、gcalcli / insanum 无匹配。Subtitle Edit、Sonic Visualiser 已在其他分类，排除。MediaConch 官方主页和旧仓库的许可表述存在差异，暂不选。

## 开源应用 · 音视频

```yaml
title: QCTools
logo: finance.png
url: https://github.com/bavc/qctools
description: Windows、macOS、Ubuntu 视频质检工具｜通过帧级图表、分析滤镜和报告检查数字化视频异常；报告需结合人工回看，不能保证自动修复或完整保真，分享前检查媒体隐私
```

- [官方仓库](https://github.com/bavc/qctools)：面向视频保存工作的图表与分析回看工具，区别于 MediaInfo 的基本元数据查看；支持报告输出和多种视频格式。发行软件为 GPLv3，GUI 等部分使用 BSD-3-Clause，依赖另有许可，不能简单标整个发行物 BSD。
- 同页列 Windows/Mac/Ubuntu 安装包与独立开发构建入口。[发布页](https://github.com/bavc/qctools/releases)可核对版本；每日开发构建不等于稳定版。
- 免费开源，处理本地文件不要求上传媒体；本次未审计所有联网行为。分析结果与报告可能含媒体内容或元数据，保护原件并人工核查异常，不把统计数值视为修复成功证据。

## 开源应用 · 工时追踪

```yaml
title: Wakapi
logo: finance.png
url: https://github.com/muety/wakapi
description: Docker 自托管编程时间统计后端｜接收兼容编辑器活动并按项目、语言统计；需配置客户端与服务器，活动时长不等于完整工时，保护项目路径、API 密钥和团队隐私
```

- [官方 README 与许可](https://github.com/muety/wakapi)：MIT，支持 Docker、数据库与 WakaTime 客户端生态，兼容性仅部分；服务端安装后仍需配置客户端。聚焦编程活动统计，区别于现有手动计费工时工具，不当成劳动考核或自动薪资依据。
- 同页可选择自托管或官方云，后者需账户；代码免费不代表基础设施免费。配置客户端目标、访问控制、TLS 和可见范围，避免无意把项目元数据发送到第三方或公开榜单。
- [官方发布页](https://github.com/muety/wakapi/releases)：有发布记录。但 README 明示维护者时间有限，暂不接受 PR，故不宣传高度活跃或即时维护保障。

## 开源应用 · 日历客户端

```yaml
title: gcalcli
logo: finance.png
url: https://github.com/insanum/gcalcli
description: Linux、macOS 的 Google Calendar 命令行客户端｜查询议程、搜索事件和导入 ICS；需 Python 与自有 OAuth/API 配置，保护本地令牌，新增、编辑和删除会改动云端日历
```

- [官方仓库](https://github.com/insanum/gcalcli)：MIT，Python 3，Linux 包、macOS Homebrew 与 pip/pipx 安装入口；使用 Google Calendar API，不是离线 CalDAV 文件浏览器。相较 khal/calcurse，补充直接操作 Google 日历的终端工作流。
- README 当前要求用户自行设置 Calendar API 项目与 OAuth 客户端，不能描述为安装即可使用。令牌保存在平台数据目录，应限制访问并避免日志、备份或版本库泄露；此研究没有访问任何日历账户。
- [发布记录](https://github.com/insanum/gcalcli/releases)支持版本核查；开源客户端免费不免除 Google 服务条款、账户权限与配额限制。导入、编辑、删除均可能产生真实远端变化，需先核对目标日历；提醒外部命令只使用可信配置。

## 核验边界

没有安装、扫描、连接账户、上传媒体、读取工时或修改日历；未编辑 YAML。文档/发布记录核验不代表本机运行、安全或跨版本兼容测试已通过。
