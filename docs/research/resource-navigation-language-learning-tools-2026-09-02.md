# 资源导航：语言学习开源工具候选核验（2026-09-02）

本批仅记录候选，不修改 `src/data/webstack.yml`。已检查当前“语言学习 · 语言学习开源工具”分类及全文件的规范化 GitHub URL、建议标题；以下 5 个主维护仓库均未收录。筛选优先通用语言学习、词汇复习、字幕阅读和发音听力，未采用仅面向 IELTS 的数据集、教程仓库或长期停更练习项目。

| 推荐 | 主维护 GitHub | 用途与形式 / 平台 | 主仓库 README 或官方文档证据 | 许可证与维护信号 |
| --- | --- | --- | --- | --- |
| Read Frog | [mengxi-ream/read-frog](https://github.com/mengxi-ream/read-frog) | 浏览器沉浸式语言学习扩展｜Chrome、Edge、Firefox；网页双语阅读、选词翻译、朗读、词汇卡与间隔重复 | 固定版本 [README](https://github.com/mengxi-ream/read-frog/blob/02ad422c1e1260960e141e4012a20d93e85082aa/README.md#L16-L29) 明确其为开源浏览器语言学习扩展并列出三大浏览器商店；[学习功能段落](https://github.com/mengxi-ream/read-frog/blob/02ad422c1e1260960e141e4012a20d93e85082aa/README.md#L122-L142) 说明沉浸阅读、可保存词汇与例句的闪卡及间隔重复复习。 | [GPL-3.0](https://github.com/mengxi-ream/read-frog/blob/02ad422c1e1260960e141e4012a20d93e85082aa/LICENSE)；默认分支在 2026-09-01 仍有[提交](https://github.com/mengxi-ream/read-frog/commit/02ad422c1e1260960e141e4012a20d93e85082aa)，README 也明确标注 active development。 |
| LLPlayer | [umlx5h/LLPlayer](https://github.com/umlx5h/LLPlayer) | Windows 10/11 桌面语言学习播放器｜双字幕、实时 ASR/翻译、OCR、查词与在线媒体播放 | 固定版本 [README](https://github.com/umlx5h/LLPlayer/blob/da101d87681bb4d1d87a59884bca95043dd1158b/README.md#L3-L42) 将其定义为语言学习播放器并逐项说明双字幕、Whisper ASR、翻译、OCR 和查词；[安装段落](https://github.com/umlx5h/LLPlayer/blob/da101d87681bb4d1d87a59884bca95043dd1158b/README.md#L50-L72) 列出 Windows 10/11 要求和 Releases 下载启动方式。 | [GPL-3.0](https://github.com/umlx5h/LLPlayer/blob/da101d87681bb4d1d87a59884bca95043dd1158b/LICENSE)；默认分支在 2026-07-19 仍有[提交](https://github.com/umlx5h/LLPlayer/commit/da101d87681bb4d1d87a59884bca95043dd1158b)。README [明确标注 Beta](https://github.com/umlx5h/LLPlayer/blob/da101d87681bb4d1d87a59884bca95043dd1158b/README.md#L123-L132)，目录描述不应暗示稳定版。 |
| Obsidian Spaced Repetition | [st3v3nmw/obsidian-spaced-repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition) | Obsidian 桌面与移动插件｜在 Markdown 笔记中制作正反向、填空和多媒体词卡，以 FSRS/SM-2 复习 | 固定版本 [README](https://github.com/st3v3nmw/obsidian-spaced-repetition/blob/3d5079f3bcd54531b084040d1c0178f15f681510/README.md#L1-L34) 说明 FSRS/SM-2、词卡格式、图片音视频与牌组组织；项目[官方文档](https://stephenmwangi.com/obsidian-spaced-repetition/#installation) 说明可从 Obsidian Community Plugins 安装，也提供手动安装方法。 | [MIT](https://github.com/st3v3nmw/obsidian-spaced-repetition/blob/3d5079f3bcd54531b084040d1c0178f15f681510/LICENSE)；默认分支在 2026-09-01 仍有[提交](https://github.com/st3v3nmw/obsidian-spaced-repetition/commit/3d5079f3bcd54531b084040d1c0178f15f681510)。官方文档自述部分内容略旧，具体选项应以当前版本为准。 |
| Hashcards | [eudoxia0/hashcards](https://github.com/eudoxia0/hashcards) | Rust 命令行与本地 Web 复习工具｜用纯文本 Markdown 管理正反面和填空词卡，以 FSRS 调度 | 固定版本 [README](https://github.com/eudoxia0/hashcards/blob/4944ef0e85269678e6f43c706f6c81d4b9d77b95/README.md#L10-L23) 说明纯文本词卡、填空卡和 FSRS；[安装与使用段落](https://github.com/eudoxia0/hashcards/blob/4944ef0e85269678e6f43c706f6c81d4b9d77b95/README.md#L45-L72) 提供 Releases 二进制、Cargo/AUR 安装及 `hashcards drill` 命令，本地复习界面说明见 [README](https://github.com/eudoxia0/hashcards/blob/4944ef0e85269678e6f43c706f6c81d4b9d77b95/README.md#L94-L113)。 | [Apache-2.0](https://github.com/eudoxia0/hashcards/blob/4944ef0e85269678e6f43c706f6c81d4b9d77b95/LICENSE)；默认分支在 2026-08-31 仍有[提交](https://github.com/eudoxia0/hashcards/commit/4944ef0e85269678e6f43c706f6c81d4b9d77b95)，README 顶部列有测试与发行工作流。 |
| eSpeak NG | [espeak-ng/espeak-ng](https://github.com/espeak-ng/espeak-ng) | 离线文字转语音 CLI 与共享库｜Linux、Windows、Android、BSD、macOS；支持 100 多种语言和口音，可输出语音或音素 | 固定版本 [README](https://github.com/espeak-ng/espeak-ng/blob/f1354994057fa9b85001675732e7fed2d437292b/README.md#L11-L31) 说明平台、语言覆盖、命令行/共享库/SAPI5 形态；[功能与平台段落](https://github.com/espeak-ng/espeak-ng/blob/f1354994057fa9b85001675732e7fed2d437292b/README.md#L33-L66) 说明 WAV 输出、音素转换和构建/使用文档，适合作为发音与听力素材辅助工具。 | [GPL-3.0-or-later](https://github.com/espeak-ng/espeak-ng/blob/f1354994057fa9b85001675732e7fed2d437292b/README.md#L133-L140)；默认分支在 2026-09-01 仍有[提交](https://github.com/espeak-ng/espeak-ng/commit/f1354994057fa9b85001675732e7fed2d437292b)。 |

## 建议目录描述

- `Read Frog`：Chrome、Edge 与 Firefox 开源语言学习扩展｜将网页转为双语阅读材料，支持选词翻译、朗读、词汇卡和间隔重复。
- `LLPlayer`：Windows 开源语言学习播放器｜通过双字幕、实时语音识别与翻译、OCR 和查词进行视频精听；当前为 Beta。
- `Obsidian Spaced Repetition`：Obsidian 开源间隔重复插件｜直接在 Markdown 笔记中制作词卡，以 FSRS 或 SM-2 安排复习。
- `Hashcards`：Rust 纯文本间隔重复工具｜用 Markdown 维护正反面和填空词卡，通过命令行启动本地 Web 复习界面。
- `eSpeak NG`：跨平台离线文字转语音工具｜用 CLI 或共享库朗读 100 多种语言和口音，并可导出 WAV 或音素。

## 取舍与核验边界

- 未推荐已收录的 Anki/AnkiDroid、Lute、LinguaCafe、VocabSieve、asbplayer、Yomitan、LanguageTool、Readest 等项目；URL 与标题去重范围是整个 `webstack.yml`，不只当前分类。
- 本批未采用 IELTS 练习数据集、只提供课程内容的仓库、无可安装形态的算法库，以及最后活动时间较久的通用练习项目。
- Read Frog 的部分 AI 翻译功能需要用户自行选择服务商，隐私、费用、区域可用性与内容传输边界应按所选服务另行核验。
- LLPlayer 当前为 Beta；ASR/OCR 对运行时、模型及硬件有额外要求，不能把实时字幕或翻译描述为始终准确。
- Obsidian Spaced Repetition 依赖 Obsidian；其项目文档提示部分内容略旧，实际功能与安装兼容性以当前插件发行版为准。
- eSpeak NG 使用紧凑的共振峰合成，README 明确说明声音不如基于真人录音的大型合成器自然；适合朗读、音素与可访问性辅助，不应作为唯一的发音标准。
- 实际写入目录前仍应再次检查最新发行版、许可证、安全公告以及规范化 URL/标题重复。
