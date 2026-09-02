# 语言学习开源工具候选核验（2026-09-02）

核验范围为主维护 GitHub 仓库及仓库 README。检查时共享工作树已写入这 4 项；按标题和去除末尾斜杠、忽略大小写后的 URL 统计，每项均恰好出现 1 次，没有额外重复。

| 工具 | 主维护仓库 | 形式与平台 | 主来源证据 | 注意事项 |
| --- | --- | --- | --- | --- |
| Memoet | [memoetapp/memoet](https://github.com/memoetapp/memoet) | 浏览器使用的自托管词卡与测验服务；Docker、Ubuntu 或 Heroku 部署 | 固定版本 [README](https://github.com/memoetapp/memoet/blob/4db63b6b5b6c9e5767f2daad479bbe20d42e0587/README.md#L6-L10) 将其定义为用间隔重复进行测验和词卡复习的工具；[开发与部署说明](https://github.com/memoetapp/memoet/blob/4db63b6b5b6c9e5767f2daad479bbe20d42e0587/README.md#L35-L59) 给出本地 Web 服务、Docker 等部署方式及 PostgreSQL 要求。 | 服务端目前只支持 PostgreSQL；仓库为 AGPL-3.0。 |
| Kanji Dojo | [syt0r/Kanji-Dojo](https://github.com/syt0r/Kanji-Dojo) | Android、iOS、Windows、macOS、Linux 原生应用 | 固定版本 [README](https://github.com/syt0r/Kanji-Dojo/blob/f9a4aca42bf57439feccfc663662bcb4bed4e7c2/README.md#L21-L34) 说明假名、汉字书写与读音、词汇卡、SRS 和离线学习；[下载说明](https://github.com/syt0r/Kanji-Dojo/blob/f9a4aca42bf57439feccfc663662bcb4bed4e7c2/README.md#L46-L68) 列出移动商店及 MSI、DMG、AppImage。 | 专注日语而非通用多语言；macOS README 提示可能需在“隐私与安全性”中手动允许打开；GPL-3.0。 |
| Qwerty Learner | [RealKai42/qwerty-learner](https://github.com/RealKai42/qwerty-learner) | 在线或自行部署的 Web 应用；另有官方 VS Code 扩展仓库 | 固定版本 [README](https://github.com/RealKai42/qwerty-learner/blob/122acd90b4079dd040c28a14356447f6553cff83/README.md#L33-L54) 提供在线站点、VS Code 扩展与 Vercel 部署入口；[设计说明](https://github.com/RealKai42/qwerty-learner/blob/122acd90b4079dd040c28a14356447f6553cff83/README.md#L63-L69) 明确把英语单词记忆和键盘输入肌肉记忆结合。 | VS Code 版位于独立的主维护仓库，当前链接主要代表 Web 版；GPL-3.0。 |
| HSK Nest | [s-mberli/hsknest](https://github.com/s-mberli/hsknest) | Docker 可自托管 Web 应用，也提供付费托管版 | 固定版本 [README](https://github.com/s-mberli/hsknest/blob/a0a4011fe69f2c8eb50121609589fa3c55d25b52/README.md#L7-L18) 说明其为普通话优先、底层可用于其他语言的 FSRS 词卡工具；[功能与 Docker 快速启动](https://github.com/s-mberli/hsknest/blob/a0a4011fe69f2c8eb50121609589fa3c55d25b52/README.md#L20-L33) 列出 HSK、CSV 导入、混合 TTS 和一键 Docker，[音频说明](https://github.com/s-mberli/hsknest/blob/a0a4011fe69f2c8eb50121609589fa3c55d25b52/README.md#L83-L102) 说明音频包的下载与 Web Speech 回退。 | 默认内容面向普通话；音频包不内置于镜像，首次使用可能需要下载，Web Speech 回退能力取决于浏览器；应用代码为 AGPL-3.0，捆绑数据另有许可证。 |

## 结论

4 个仓库都与“语言学习开源工具”直接相关且有明确可用形态，可保留。目录描述宜把 HSK Nest 的语音边界写成“音频包需下载、可回退到 Web Speech”，不宜笼统表述为始终依赖外部语音服务。

## 第二轮扩展候选

复核时 Lute、LinguaCafe、VocabSieve、asbplayer 已在目标分类，Anki 也已在全局目录；这些项目不重复添加。Knowclip 虽有明确 AGPL-3.0 许可，但最新代码提交为 2025-01-29、公开下载仍为 beta，未达到本轮“近期活跃”的优先标准，改用下列 5 项。按标题及去除末尾 `/`、忽略大小写后的 URL 检查，它们在 `webstack.yml` 中均未收录。

| 工具 | 形式与平台 | 许可与维护 | 功能边界 | 推荐中文描述 |
| --- | --- | --- | --- | --- |
| [Scribe Desktop](https://github.com/scribe-org/Scribe-Desktop) | Windows、macOS、Linux 桌面输入与语言学习界面 | [GPL-3.0](https://github.com/scribe-org/Scribe-Desktop/blob/main/LICENSE.txt)；主仓最新提交为 2026-08-01。[README](https://github.com/scribe-org/Scribe-Desktop#readme) | 提供输入时翻译、动词变位与单词标注，其中翻译功能仍标为 beta；它不是完整课程或人工校对服务。 | `跨平台桌面语言输入工具｜在打字时查看翻译、动词变位和单词标注；翻译功能仍处于 beta，重要文本需自行复核。` |
| [GetSubtitle](https://github.com/fpenguin/getsubtitle) | Python 3.10+ 命令行与交互向导；Windows、macOS、Linux | [MIT](https://github.com/fpenguin/getsubtitle/blob/main/LICENSE)；主仓最新提交及发行均在 2026-06-14。[README](https://github.com/fpenguin/getsubtitle#readme) | 合并、清理、注音或翻译多语字幕；部分搜索和翻译依赖第三方字幕源、DeepL、Ollama 或 Argos。用户须确认媒体及字幕使用权，机器翻译不保证准确。 | `跨平台字幕学习工具｜合并双语或多语字幕，添加日语读音、中文拼音并清理时间轴；外部字幕与翻译结果需核对来源和准确性。` |
| [SubMiner](https://github.com/ksyasuda/SubMiner) | Windows、macOS、Linux 桌面程序；与 mpv、Yomitan、Anki 配合 | [GPL-3.0](https://github.com/ksyasuda/SubMiner/blob/main/LICENSE)；主仓最新提交为 2026-09-01，并提供持续发行。[README](https://github.com/ksyasuda/SubMiner#readme) | mpv 是运行必需项，制卡还需要 Anki/AnkiConnect；字幕搜索、同步与翻译能力可能依赖可选工具或第三方服务，重点偏向日语沉浸学习。 | `跨平台沉浸学习播放器工具｜在 mpv 字幕上调用 Yomitan 查词，一键生成含音频和截图的 Anki 卡片，并记录观看学习进度。` |
| [Mirumoji](https://github.com/svdC1/mirumoji) | Docker Compose 本地 Web 应用与桌面启动器 | [MIT](https://github.com/svdC1/mirumoji/blob/main/LICENSE)；主仓最新提交为 2026-07-21。[README](https://github.com/svdC1/mirumoji#readme) | 面向日语视频和音频，支持本地 Whisper、查词、片段与 Anki 导出；云 GPU 与 LLM 是可选项，启用后内容会交给相应提供商处理。 | `自托管日语沉浸学习工具｜为视频或音频生成可点击字幕，提供即时查词、片段收藏与 Anki 导出；可选云端 AI 功能需单独评估隐私。` |
| [gogadget](https://github.com/jonathanfox5/gogadget) | Windows 安装器；macOS、Linux 命令行工具 | [AGPL-3.0](https://github.com/jonathanfox5/gogadget/blob/main/LICENSE)；主仓最新提交为 2025-09-16，并提供发行包。[README](https://github.com/jonathanfox5/gogadget#readme) | 下载、转写与翻译媒体并生成带音频、截图和释义的 Anki 牌组；安装语言资源后除下载模块外可离线运行。媒体下载必须遵守来源授权，自动转写和翻译仍需人工复核。 | `跨平台语言沉浸命令行工具｜从视频或播客生成字幕、词频分析和多媒体 Anki 牌组；语言资源安装后可离线处理本地素材。` |

### 未采用

- [Knowclip](https://github.com/knowclip/knowclip) 功能与分类契合、采用 AGPL-3.0，但近期维护和发行节奏弱于本轮候选，暂不新增。
- Polygloss 当前公开 GitHub 入口主要用于问题与路线图，未找到可核验的完整开源应用主仓及明确代码许可证，因此不作为“开源工具”收录。
