# 资源导航补充研究 · Batch 125

核验日期：2026-09-04。仅研究 3 项，无 YAML 改动、安装、上传或工程运行。

## 去重与补缺

读取三个目标分类并检索完整 `src/data/webstack.yml`：Pencil2D / pencil2d/pencil / chchwy/pencil、Rnote / flxzt/rnote、Qalculate / libqalculate 均无匹配。Zettlr、GNU Octave、Graphite、Logseq 等既有项目未重复收录。补充手绘动画专用时间线、手写知识笔记和带单位的桌面科学计算，不添加已有产品的变体包装器。

## 开源应用 · 设计创作

```yaml
- title: Pencil2D
  logo: finance.png
  url: https://github.com/pencil2d/pencil
  description: Windows、macOS、Linux 手绘动画应用｜结合位图与矢量制作传统二维动画；选择稳定发行版，定期备份工程，并核对导入图像与声音素材授权。
```

- [官方主仓库](https://github.com/pencil2d/pencil)：GPL-2.0 标识，确认 Windows/macOS/Linux/FreeBSD 和位图、矢量手绘动画；明确 GitHub 是主仓库。与 Krita 有部分动画重叠，但为专门手绘动画工作流，不是绘图套件包装。
- [官方发布页](https://github.com/pencil2d/pencil/releases)及 README 提供发行版下载。README 警告 nightly 不如正式版稳定，不将其推荐为生产版。
- 不需要上传到在线动画服务；不因此承诺软件或安装过程零联网。素材许可独立于软件许可，保留项目及源素材备份。

## 开源应用 · 效率知识

```yaml
- title: Rnote
  logo: finance.png
  url: https://github.com/flxzt/rnote
  description: Windows 与 Linux 手写笔记应用｜用矢量笔迹、画布和 PDF 标注整理知识；原生格式仍可能跨版本变化，应保留原文件并导出通用格式备份。
```

- [官方仓库](https://github.com/flxzt/rnote)：GPL-3.0-or-later，Rust/GTK4，手写、压感笔、无限画布、PDF/图片导入和多种导出；区别于以 Markdown 为主的知识库。
- Linux 官方 Flatpak，Windows 官方发行安装包；macOS 是 README 链接的社区贡献构建，故卡片不笼统承诺同等级原生支持。错误候选路径 rnote/rnote 返回 404，最终使用可读的 flxzt/rnote。
- [发布页](https://github.com/flxzt/rnote/releases)可读；README 明确原生格式不稳定、版本间可能不兼容，也明确不支持 X11。Linux 使用前核对桌面会话及手写设备兼容性。
- 只赋予所需文档目录权限，不为导入方便开放整个磁盘；PDF 和图片可能含个人数据。未上传文档或测试手写硬件。

## 开源应用 · 科研工程

```yaml
- title: Qalculate! Qt
  logo: finance.png
  url: https://github.com/Qalculate/qalculate-qt
  description: Windows、macOS、Linux 科学计算器｜支持单位换算、符号计算、不确定度传播与绘图；复核表达式、单位和精度，结果不等同工程认证，联网汇率仅供参考。
```

- [官方 Qt 仓库](https://github.com/Qalculate/qalculate-qt)：GPL-2.0 标识，基于 libqalculate；确认符号运算、任意精度、单位、不确定度和区间计算，绘图依赖 Gnuplot。
- [官方下载说明](https://qalculate.github.io/downloads.html)：Windows 安装/便携包，Linux Qt Flatpak/Snap，macOS Qt Homebrew 入口；不将第三方移动包装程序作为本项目官方客户端。
- [官方发布页](https://github.com/Qalculate/qalculate-qt/releases)可读，有版本记录。README 与下载页依赖最低版本不同，不在卡片写死依赖版本，安装按选定发布包核对。
- 官网明确无保证且仍需测试。汇率更新涉及网络，不能据此承诺零联网或实时报价；科研计算需自行核对输入、假设、单位与误差，未提供危险工程操作或计算。

## 限制

第一方页面核验不等于运行、安全或全部平台兼容性测试。风险说明属于使用建议；开源许可不自动覆盖素材、字体、第三方依赖或服务费用。
