# 资源导航第 120 批核验

核验日期：2026-09-04。范围：论文引文自动化、DataFrame 可视探索、保留文件夹结构的照片图库。

## Manubot — 开源应用 · 写作出版

[维护者仓库](https://github.com/manubot/manubot)提供 Python/pip 命令行，按 DOI、PubMed ID 等获取格式化书目信息、预处理论文供 Pandoc 使用；部分功能另需 Pandoc。[许可](https://github.com/manubot/manubot/blob/main/LICENSE.md)为 BSD-2-Clause Plus Patent，不能简写为普通 MIT。[发布记录](https://github.com/manubot/manubot/releases)可读。

功能缺口是持久标识符引文与论文流水线，不是又一个通用 Markdown 编辑器。平台描述限定 Python 命令行环境，不保证所有系统打包兼容；引用元数据会使用网络服务，另有 AI 修订能力，须检查服务和稿件隐私，未运行或发送文本。

```yaml
title: Manubot
logo: finance.png
url: https://github.com/manubot/manubot
description: 开源 Python 论文出版命令行工具｜按 DOI 等标识符整理引文并预处理文稿，部分功能需 Pandoc；联网元数据与可选 AI 服务须核对文稿隐私。
```

## D-Tale — 开源应用 · 数据分析

[维护者仓库](https://github.com/man-group/dtale)标明 LGPL-2.1，提供 pip/conda 安装，用浏览器界面查看与探索 pandas 数据结构，可在 Python/Jupyter 使用。[发布记录](https://github.com/man-group/dtale/releases)可读。补充运行中的 DataFrame 交互探索，不重复 IDE、SQL 仪表板或终端表格工具。

这是 Python 启动的 Web 服务，不是独立桌面包；README 包含外部托管/隧道集成，因此不能视为天然隔离。目录建议本机使用并保护访问，不上传敏感数据至公共演示；数据变换与分析结果要复核。本次未启动服务或读取数据。

```yaml
title: D-Tale
logo: finance.png
url: https://github.com/man-group/dtale
description: LGPL-2.1 开源 Python 数据探索工具｜以浏览器界面筛选、绘图和分析 pandas 数据，可结合 Jupyter；保护服务访问，勿向公共演示上传敏感数据。
```

## Photoview — 开源应用 · 照片管理

[维护者仓库](https://github.com/photoview/photoview)标明 AGPL-3.0，自托管服务器/Docker 图库，将本地目录映射成相册，支持用户目录权限、RAW/EXIF、公共分享与人脸分组。[发布记录](https://github.com/photoview/photoview/releases)可读。补充围绕既有文件夹结构浏览的方案，不将图库当作备份。

仓库提醒 Docker 镜像注册表迁移，部署需按当前文档选择镜像和数据库；公共链接可选密码，不应默认安全。发布前需复核 EXIF 地点、人脸与共享权限，未挂载文件或上传照片。

```yaml
title: Photoview
logo: finance.png
url: https://github.com/photoview/photoview
description: AGPL-3.0 自托管照片图库｜通过 Docker 等方式将服务器文件夹映射为相册，支持 RAW 与人脸分组；分享前核对 EXIF 和权限，图库不能替代备份。
```

## 去重与验证边界

全量检索 src/data/webstack.yml 的 Manubot/manubot、D-Tale/dtale/man-group、Photoview/photoview 均无命中。OpenRefine、Datasette、Immich、ExifTool 等已有候选排除。三项官方仓库及发布页可读、未标归档；此为维护线索而非后续维护或安全保证。

仅新增研究记录；未改 YAML、安装、运行外部代码、开通服务、上传稿件/数据/照片或修改用户文件。落盘与构建验证由主任务完成。
