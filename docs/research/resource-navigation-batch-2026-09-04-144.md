# 资源导航第 144 批来源核验

核验日期：2026-09-04。截图工具、书签管理、PDF 工具各一项。

## 全目录去重

已阅读三个现有分类，并检索完整 `src/data/webstack.yml` 中 scrot / SCReenshOT、buku / jarun/buku / bukuserver、pdfannots / 0xabu/pdfannots，未发现同产品或 URL。NormCap 在其他分类已收录，排除。候选分别补充 X11 CLI 截图、便携本地书签数据库、PDF 批注导出。

## 开源应用 · 截图工具

```yaml
title: scrot
logo: finance.png
url: https://github.com/resurrecting-open-source-projects/scrot
description: Linux/BSD 的 X11 命令行截图工具，可选窗口或区域并保存图片｜MIT-feh 许可；不适用于原生 Wayland 捕获，保存与分享前检查敏感屏幕内容
```

- [当前维护仓库](https://github.com/resurrecting-open-source-projects/scrot)说明使用 Imlib2，支持窗口/矩形区域和多图片格式；MIT-feh 为带致谢要求的宽松许可，不简写成标准 MIT。
- 官方说明原项目曾停止维护，当前由 Resurrecting Open Source Projects 志愿者维护；提供发行版包与源码构建，依赖 X11。脚本友好是与 GUI 截图编辑器的主要互补点。
- 核心无需付费账号；保存图片是文件写入，不等于已安全上传或已脱敏。后续脚本、剪贴板与上传链条另行审查，不能自动截图第三方隐私。本轮未捕获任何屏幕。

## 开源应用 · 书签管理

```yaml
title: buku
logo: finance.png
url: https://github.com/jarun/buku
description: Python 命令行书签管理器，以本地数据库保存标签并支持检索与导入导出｜GPL-3.0，另有可选 Web 界面；网页元数据与存档查询会联网，导入前备份
```

- [官方 README](https://raw.githubusercontent.com/jarun/buku/master/README.md)说明便携数据库、编辑器集成、标签与多格式导入导出，另有 bukuserver。Python/SQLite 运行，提供 pip 与发行包，不是强制自托管 Web 服务。
- [官方许可证](https://raw.githubusercontent.com/jarun/buku/master/LICENSE)为 GPLv3；核心不要求云订阅，托管可选 Web 界面的成本另计。
- 官方虽然声明不追踪使用行为，但自动取标题/标签、刷新及 Wayback 查询仍访问网址或第三方，不能描述为全程离线。私人链接中可能有令牌；备份、导出和共享数据库都需保护。
- 手动加密能力不代表默认全部加密；批量导入、更新和删除会改变数据库，先备份与抽样核对。bukuserver 文档定位个人使用，不把它推荐为已具备企业隔离的多人服务。本轮不读取浏览器书签或访问私人网址。

## 开源应用 · PDF 工具

```yaml
title: pdfannots
logo: finance.png
url: https://github.com/0xabu/pdfannots
description: Python PDF 批注导出 CLI，将高亮、评论和页码整理为 Markdown 或 JSON｜MIT，依赖 pdfminer.six；复杂版式可能漏字或乱序，输出需对照原文复核
```

- [官方仓库](https://github.com/0xabu/pdfannots)标示 MIT，定位于论文审阅等批注整理；将已有批注及关联文字导出，不是 PDF 编辑器、OCR 或自动审稿工具。
- [官方 README](https://raw.githubusercontent.com/0xabu/pdfannots/master/README.md)提供 pip 安装，依赖 Python 与 pdfminer.six；没有证据支持所有系统均有独立可执行安装包，因此只标 Python CLI。
- README 明列漏字符、缺空格、多栏顺序与断行连字符等限制；必须对照原始批注核验，不能把自动抽取当成完整无误记录。
- 本地处理不需要云账号，输出文件仍可能包含未发表稿件、审稿意见、个人资料；分享前按授权范围处理。保存输出时避免覆盖原件或已有笔记，保留原始 PDF；本轮未打开任何私有文档或执行上传。

## 完成边界

仅新增本研究文档，不修改 YAML、不安装、不截图、不读取书签或 PDF。官方源码与文档核验不等于运行、安全或兼容性验收。
