# 资源导航第 80 批核验

核验日期：2026-09-04。范围：终身成长的创客动手、音乐实践、摄影表达，各补充 1 项。仅检查第一方网页与现有目录；未安装软件、下载发布包或连接硬件。

## 终身成长 · 创客动手：SparkFun Learn

- [官方教程入口](https://learn.sparkfun.com/)及[入门路线](https://learn.sparkfun.com/tutorials/where-do-i-start/all?print=1)提供基础电路、焊接、万用表、元件连接和项目教程；是硬件厂商的教学资料，不是新的软件安装项。
- 浏览器可读，实体项目通常需要额外器件或工具；产品接线教程须匹配具体型号，不能把阅读教程等同于已完成安全验证。页面包含套件销售入口，勿描述为硬件免费。

```yaml
- title: SparkFun Learn
  logo: finance.png
  url: https://learn.sparkfun.com/
  description: 电子制作官方教程库｜学习基础电路、焊接、万用表和传感器项目；浏览器阅读，实作需另备器件并核对型号、电源与操作安全。
```

## 终身成长 · 音乐实践：Melissa

- [主仓库 README](https://github.com/mosynthkey/Melissa)标明 macOS、Windows 桌面应用及 LGPL-2.1 许可；[官方产品页](https://mosynthkey.github.io/Melissa/index_en.html)说明变速不变调、循环范围保存、音轨分离、MIDI 控制和节拍器。
- 官方下载为 macOS 与 Windows 64 位；产品页指出含 AI 引擎版本较大，不支持 AVX 的旧 CPU 可选 Lite 版。未测试分离效果，不承诺音轨无损或完全隔离，也不提供音乐内容授权。
- 放弃候选 [LenMus](https://github.com/lenmus/lenmus)：README 明确声明自 2023 年 6 月起取消项目、暂停维护，不优先新增为常用学习工具。

```yaml
- title: Melissa
  logo: finance.png
  url: https://github.com/mosynthkey/Melissa
  description: 开源乐器练习播放器｜macOS、Windows 支持变速不变调、片段循环、节拍器与音轨分离；旧 CPU 不支持 AVX 时需选 Lite 版。
```

## 终身成长 · 摄影表达：Entangle

- [官网](https://entangle-photo.org/)说明 GPL v3+ 开源联机摄影应用、Linux Flatpak 和发行版安装入口，以及电脑触发快门、实时预览、自动下载照片与设置相机参数。
- [官方 FAQ](https://entangle-photo.org/faq/)说明相机需要 libgphoto2 远程拍摄支持，不保证所有机型功能完整。官网所列最新发布仍为 2020 年的 3.0，不将抓取日期描述为软件更新日期，也不宣称维护活跃；安装兼容性需要用户按发行版与机型进一步核对。
- 项目主仓库位于 GitLab，由官网链接确认；收录官网而非寻找非官方 GitHub 镜像。该条补充联机拍摄实践，不是既有 Open Camera 或 darktable 的子页面。

```yaml
- title: Entangle
  logo: finance.png
  url: https://entangle-photo.org/
  description: 开源 Linux 联机摄影工具｜从电脑控制快门、预览与下载照片；依赖 libgphoto2 相机支持，功能因机型而异，安装前核对兼容性。
```

## 去重与边界

已读取 YAML 内三个目标分类各 7 项，全文检索 SparkFun、Melissa、mosynthkey、Entangle 均无匹配；候选不是现有产品的不同链接。父任务写入前仍需做解析后规范化 URL 唯一性检查。
