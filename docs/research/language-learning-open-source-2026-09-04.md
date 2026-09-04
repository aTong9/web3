# 语言学习开源工具补充核验

核验日期：2026-09-04。范围：现有分类之外的 5 个 GitHub 开源项目；仅查阅第一方仓库和官网，未安装、运行、注册或提交内容。对整个 `src/data/webstack.yml` 检索名称、仓库和产品别名，以下五项均未命中。统一复用 `finance.png`。

| 建议标题 | GitHub 入口 | 许可证与形态 | 建议描述 |
| --- | --- | --- | --- |
| Knowclip | https://github.com/knowclip/knowclip | AGPL-3.0；跨平台 Electron 桌面应用 | 跨平台桌面语言工具｜从音视频和字幕剪辑语境片段、检测静音并导出 Anki 音频词卡；需自备合法学习素材。 |
| substudy | https://github.com/emk/subtitles-rs | Apache-2.0；实验性命令行工具，主要在 Linux 开发，macOS/Windows 有自动测试 | 开源字幕学习命令行工具｜生成双语字幕、音频复习与 Anki 卡片；需 FFmpeg，AI 转写和翻译另需付费 API。 |
| Vocascan | https://github.com/vocascan/vocascan-frontend | Apache-2.0；Docker 自托管 Web 前端 | 自托管多语言词汇训练器｜通过可配置词卡练习、共享词表并跨设备同步；须另部署 Vocascan 服务端。 |
| Parley | https://github.com/KDE/parley | GPL-2.0-or-later；KDE 官方 GitHub 镜像，Linux 桌面，另有 Windows 测试构建 | Linux 开源词汇训练器｜使用间隔重复、拼写、选择题和词形练习学习多种语言，支持创建和下载词表。 |
| Lunes 职业德语词汇 | https://github.com/digitalfabrik/lunes-app | Apache-2.0；Android/iOS | Android 与 iOS 开源德语词汇应用｜借助图片、朗读和配对练习学习各行业职业用语；侧重职业德语而非完整语言课程。 |

## 第一方证据与边界

- [Knowclip 仓库](https://github.com/knowclip/knowclip) README 明确跨平台桌面、手动/自动剪辑与 Anki 导出，仓库显示 AGPL-3.0；[官网](https://www.knowclip.com/)说明音视频学习用途。应用与 Anki 是不同产品，目录中现有 Anki 工具不构成重复。未验证安装包与媒体兼容性。
- [substudy README](https://github.com/emk/subtitles-rs/tree/master/substudy)说明实验性 CLI、双语字幕、复习页、Anki/CSV/音频导出、FFmpeg 依赖、API 密钥及费用；[根仓库](https://github.com/emk/subtitles-rs)说明 substudy 已合并到 subtitles-rs，Apache-2.0，部分测试素材例外。不能承诺字幕自动纠时，也不能把 AI 功能写成免费离线。
- [Vocascan 前端](https://github.com/vocascan/vocascan-frontend)说明 Apache-2.0、词卡学习/共享/同步、Docker 与独立服务端依赖。[旧桌面仓库](https://github.com/vocascan/vocascan-desktop)明确前端已迁移，因此只收录当前前端，不重复收录旧仓库；未验证公共演示或部署成功。
- [Parley 官方应用页](https://apps.kde.org/parley/)说明间隔重复、多种语言练习、Linux 包与 Windows nightly；[GitHub 仓库](https://github.com/KDE/parley)链接 KDE 主源站。[应用元数据](https://github.com/KDE/parley/blob/master/org.kde.parley.appdata.xml)的 project_license 为 GPL-2.0+，与 CC0 元数据许可区分。文案只承诺 Linux，避免将测试构建写成稳定跨平台发行。
- [Lunes 仓库](https://github.com/digitalfabrik/lunes-app)显示 Apache-2.0 与 Android/iOS React Native 应用；[官网](https://lunes.app/)说明职业词汇、图片、朗读与配对训练。学习行为匿名统计可拒绝；内容服务与自行部署源码并非一回事。定位职业德语，不泛称所有语言通用。

排除：[LexiKon](https://github.com/svlandeg/lexikon)虽然 MIT 且支持自定义语种词表，但 README 明确尚不适合外部使用，暂不加入面向普通用户的目录。
