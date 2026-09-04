# 资源导航第 119 批核验

核验日期：2026-09-04。范围：文件索引搜索、restic 可视化编排、批量 OCR 校对，各一个独立工具。

## FSearch — 开源应用 · 系统文件

[维护者仓库](https://github.com/cboxdoerfer/fsearch)标明 GPL-2.0，GTK3 桌面文件搜索，支持正则、筛选、目录纳入/排除及索引。README 提供 Linux 发行版稳定包，推荐稳定版；FreeBSD 包不是作者维护，Flatpak 存在功能限制。[发布页](https://github.com/cboxdoerfer/fsearch/releases)可读取，未标为归档。补充专用文件名索引搜索，不重复文件管理器或磁盘占用分析器。

官方当前限制包括移入回收站后索引未同步更新；文件名/路径索引自身也可能敏感。仅陈述目录排除与索引滞后，不保证零遥测或删除安全，未安装或扫描文件。

```yaml
title: FSearch
logo: finance.png
url: https://github.com/cboxdoerfer/fsearch
description: GPL 开源 Linux 桌面文件搜索｜通过索引、正则与筛选快速查找文件，可排除私密目录；索引可能滞后，移动或删除前须核对实际路径。
```

## gImageReader — 开源应用 · 辅助阅读

[维护者仓库](https://github.com/manisandro/gImageReader)标明 GPL-3.0，Tesseract 的 Gtk/Qt 前端，支持多页 PDF/图片批处理、识别区域选择、原图与文字并排校对、hOCR/PDF 输出；Windows 安装包与 Linux 分发方式均列明。[发布页](https://github.com/manisandro/gImageReader/releases)可读取，仓库未标归档。

区别于已有 Tesseract 引擎、NormCap 屏幕框选及 OCRmyPDF 命令行流程，本条补充桌面批量导入与并排校对。识别结果须校对，导出文件可能暴露原文；未扫描、上传或处理用户文档，未承诺识别准确率。

```yaml
title: gImageReader
logo: finance.png
url: https://github.com/manisandro/gImageReader
description: GPL-3.0 开源 Windows 与 Linux OCR 桌面工具｜批量导入 PDF、图片并对照原图校对文字，支持 hOCR/PDF 输出；识别结果须复核并保护敏感导出文件。
```

## Backrest — 开源应用 · 备份恢复

[维护者仓库](https://github.com/garethgeorge/backrest)标明 GPL-3.0，restic Web 管理和调度工具，支持 Linux、macOS、Windows 与 Docker，提供快照浏览、恢复、计划及维护任务。[发布页](https://github.com/garethgeorge/backrest/releases)可读取，仓库未标归档。它依赖已有 restic，但不是其重复链接；补充面向浏览器的计划与恢复管理，区别于 Borg 桌面客户端 Vorta。

README 说明初次运行可下载 restic，首次设置用户密码；支持远程界面及执行 shell hooks。因此须保护管理界面、凭据和密钥，谨慎使用自动清理及钩子；备份成功不证明可恢复。未运行安装脚本、建立仓库或上传数据。

```yaml
title: Backrest
logo: finance.png
url: https://github.com/garethgeorge/backrest
description: GPL-3.0 开源 restic Web 备份管理器｜支持 Linux、macOS、Windows 与 Docker，调度快照并浏览恢复；须保护管理界面和密钥，启用清理策略前演练恢复。
```

## 去重与验证范围

全量检索 src/data/webstack.yml 的 FSearch/cboxdoerfer、gImageReader/manisandro、Backrest/garethgeorge 均无命中。gdu、Thorium、Piper、OCRmyPDF 等已收录候选排除。三项基于明确功能缺口，不跨分类复制已有 URL。

官方 README、许可标识与发布页均可访问；维护信号限于仓库未归档和可读发布记录，不保证后续支持或版本兼容。未安装/运行、联网备份、删改用户文件、注册或提交数据。仅新增本研究记录，目录与构建验证由主任务完成。
