# 资源导航补充研究 · Batch 132

日期：2026-09-04。移动设备、终端效率、字体排版各 1 项；仅研究，不安装、不运行、不上传数据。

## 全目录去重

已读取三个目标分类，并对完整 `src/data/webstack.yml` 搜索产品名、仓库路径和别名。fzf / junegunn、Font Bakery / fontbakery、phyphox 均无匹配。LocalSend、Droid-ify、HeliBoard、Binary Eye 已在其他分类，排除。候选分别补充手机传感器记录、通用交互选择、自动字体质量检查，不是已有工具更换 URL。

## 开源应用 · 移动设备

```yaml
title: phyphox (Android)
logo: finance.png
url: https://github.com/phyphox/phyphox-android
description: Android 手机传感器实验工具｜读取可用传感器、展示与导出记录；功能依机型而异，远程接口无加密和密码保护，仅在可信隔离网络启用，不作医疗或安全测量依据
```

- [官方 Android 仓库](https://github.com/phyphox/phyphox-android)：RWTH Aachen 项目，GPL-3.0。iOS 为独立仓库；这里不将 Android 仓库冒充跨平台安装包。手机传感器用于物理实验，可自定义实验。
- [官方 FAQ](https://phyphox.org/faq/)：免费使用；设备是否拥有/开放某个传感器影响功能，保存状态与导出途径不同。远程接口不加密、不提供密码保护，因此不推荐公网或公共网络使用。官方对数据不敏感的表述不作为本目录隐私保证。
- [仓库发布入口](https://github.com/phyphox/phyphox-android/releases)没有提供本次可确认的稳定安装包版本；README 说明 master 跟随发布版本。应从官方站点选择分发渠道，不能把仓库活动当安装验证。
- 不提供危险实验步骤；传感器不是校准过的医疗/安全仪器。录音、位置或导出记录按实际敏感度保护；外部分享服务另有隐私条件。

## 开源应用 · 终端效率

```yaml
title: fzf
logo: finance.png
url: https://github.com/junegunn/fzf
description: Windows、macOS、Linux 模糊查找 CLI｜交互筛选文件、历史和管道数据，并集成常见 Shell；预览与快捷动作可执行外部命令，只使用可信配置并避免暴露敏感历史
```

- [官方仓库、许可与安装](https://github.com/junegunn/fzf)：MIT，单二进制通用模糊查找器；提供 Linux、macOS、Windows 分发方式。Shell 集成需要额外设置，不代表所有 Shell 功能完全一致。
- [官方发布页](https://github.com/junegunn/fzf/releases)：版本与变更可核查。程序本身不要求托管账户或订阅；用户配置的远程数据源、命令或插件可引入网络访问和额外权限。
- 区别于 zoxide 的目录频率跳转和 Atuin 的历史数据库：fzf 是可嵌入管道的通用选择界面。预览、执行动作不是安全沙箱，勿照抄未知命令处理秘密或不可信输入。

## 开源应用 · 字体排版

```yaml
title: Font Bakery
logo: finance.png
url: https://github.com/fonttools/fontbakery
description: Windows、macOS、Linux 字体质量检查 CLI｜按检查配置发现字体技术问题并生成报告，适合字体发布前验证；需 Python 依赖，检查通过不等于获得字体商用或嵌入授权
```

- [官方仓库](https://github.com/fonttools/fontbakery)：Apache-2.0，字体质量保障工具；主要为终端应用，列出 Windows、macOS、GNU/Linux 安装指南，并支持自定义 Python 检查。与 fontTools 格式处理、FontGoggles 视觉预览用途互补。
- [官方文档](https://fontbakery.readthedocs.io/)由仓库 README 链接；本次平台与用途主要依据已读取 README，不声称运行过全部检查配置。
- [官方发布记录](https://github.com/fonttools/fontbakery/releases)：存在版本与变化记录。开源 CLI 不要求云账户；可选 GitHub Actions 流程会把字体交给运行环境，应核对私有字体的上传权限和 CI 费用。
- 选择匹配目标分发渠道的检查规则；结果不能替代人工排版校验，也不授予输入字体许可。字体文件、报告与自定义检查脚本均需可信来源。

## 边界

本记录仅为三条候选与一手来源，未修改 YAML，未安装应用、读取手机、执行命令配置或上传字体。没有进行运行、安全或兼容性审计。
