# 资源导航第 52 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按标题及去除末尾 `/`、忽略大小写后的 URL 检查
`src/data/webstack.yml`，下列 6 项均未在全局目录中出现。

| 分类 | 建议条目 | 平台 / 形态 | 许可与近期维护 | 媒体版权、插件或隐私边界及推荐中文描述 |
| --- | --- | --- | --- | --- |
| 开源应用 · 音视频 | [MediaInfo](https://github.com/MediaArea/MediaInfo) | Windows、macOS、Linux 桌面与命令行工具；读取音视频容器、编码、码率、声道、字幕等技术元数据。 | [BSD-2-Clause](https://github.com/MediaArea/MediaInfo/blob/master/LICENSE)；主分支 2026-08-11 仍有提交。 | 只读取元数据不代表拥有传播权；分享分析报告前应移除文件路径、设备标识或其他敏感字段。推荐描述：**跨平台音视频信息检测工具｜用桌面界面或命令行查看容器、编码、码率、声道和字幕等元数据；分析不改变媒体版权，分享报告前应清理路径与设备等隐私信息。** |
| 开源应用 · 设计创作 | [Graphite](https://github.com/GraphiteEditor/Graphite) | 浏览器图形编辑器；以节点式、非破坏流程处理矢量、栅格与动态图形，项目仍处快速开发阶段。 | [Apache-2.0](https://github.com/GraphiteEditor/Graphite/blob/master/LICENSE.txt)；主分支 2026-08-31 仍有提交。 | 导入字体、素材和导出作品仍受各自许可约束；测试第三方或实验节点前应保留源文件副本。推荐描述：**浏览器节点式图形编辑器｜以非破坏流程制作矢量、栅格和动态图形；项目仍在快速开发，需备份源文件，并自行核对导入字体、素材与最终作品的授权。** |
| 开源应用 · 写作出版 | [Zettlr](https://github.com/Zettlr/Zettlr) | Windows、macOS、Linux Markdown 写作与知识管理应用；面向论文、长文、引用管理和 Pandoc 出版。 | [GPL-3.0](https://github.com/Zettlr/Zettlr/blob/develop/LICENSE)；主开发分支 2026-09-01 仍有提交。 | Pandoc、LaTeX、模板及扩展属于外部执行链；打开不可信项目或模板前应审查配置，云同步需另行评估隐私。推荐描述：**跨平台 Markdown 写作与出版工作台｜组织论文和长文、管理引用并通过 Pandoc 导出多种格式；使用外部模板、过滤器和同步服务前需审查代码、许可与文稿隐私。** |
| 开源应用 · 音乐制作 | [Bespoke Synth](https://github.com/BespokeSynth/BespokeSynth) | Windows、macOS、Linux 模块化音乐工作站；以可连接模块完成合成、音序、采样和现场声音实验。 | [GPL-3.0](https://github.com/BespokeSynth/BespokeSynth/blob/main/LICENSE)；主分支 2026-09-01 仍有提交。 | 第三方插件、采样包和预置有独立许可；插件可在宿主进程内运行，加载未知二进制前需确认来源并保存工程备份。推荐描述：**跨平台模块化音乐工作站｜通过可连接模块完成合成、音序、采样和现场声音实验；加载第三方插件或采样前须核对来源与授权，并保存工程备份。** |
| 开源应用 · 字体排版 | [FontGoggles](https://github.com/justvanrossum/fontgoggles) | macOS 桌面字体检查器；可预览、比较字体文件并检查字形、可变轴和编译结果。 | [Apache-2.0](https://github.com/justvanrossum/fontgoggles/blob/master/LICENSE.txt)；主分支 2026-05-25 仍有提交。 | 字体可预览不等于可嵌入、修改或商用；测试未知字体文件时应保持系统更新并核对字体许可证。推荐描述：**macOS 字体预览与检查工具｜比较字体、字形和可变轴并验证开发中的字体文件；预览不代表获得嵌入或商用权，使用前仍须核对字体许可。** |
| 开源应用 · 字幕制作 | [ffsubsync](https://github.com/smacke/ffsubsync) | Python 命令行字幕自动同步工具；依据视频语音活动或参考字幕校准 SRT 等字幕时间轴。 | [MIT](https://github.com/smacke/ffsubsync/blob/master/LICENSE)；主分支 2026-07-24 仍有提交。 | 自动对齐可能误判静音、音乐和多人对话，发布前必须人工校验；仅处理有权使用的媒体与字幕，敏感素材宜本地运行。推荐描述：**命令行字幕自动校时工具｜依据视频语音或参考字幕对齐 SRT 时间轴；结果需人工复核，仅处理已获授权的媒体和字幕，敏感内容建议在本地完成。** |

## 结论

六项分别补充媒体元数据诊断、节点式图形设计、Markdown 出版、模块化音乐创作、字体检查和字幕自动校时，均与现有七项形成明确功能增量。许可证由主仓直接给出，且六个仓库在 2026 年仍有维护；纳入目录时应保留版权归属、外部插件执行和文稿或媒体隐私提示。
