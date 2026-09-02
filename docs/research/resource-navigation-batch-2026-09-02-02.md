# 资源导航开源应用候选核验（2026-09-02，第 2 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按不区分大小写的完整 URL 检查，以下 6 个主仓库均未收录。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · 网络安全 | Trivy | [aquasecurity/trivy](https://github.com/aquasecurity/trivy) | 可安装 CLI / Docker 镜像｜主流操作系统与平台 | README 将其定义为综合安全扫描器，可扫描容器镜像、文件系统、Git 仓库、虚拟机镜像和 Kubernetes，检测漏洞、错误配置、密钥及许可证；并给出 Homebrew、Docker 和 release 二进制安装方式。适合补充软件供应链与配置安全检查。 |
| 开源应用 · 本地 AI | GPT4All | [nomic-ai/gpt4all](https://github.com/nomic-ai/gpt4all) | 可安装桌面应用 / Python 包｜Windows、macOS、Ubuntu | README 明确其在日常电脑上私密运行大语言模型，不要求 API 调用或 GPU；主仓库提供 Windows、macOS、Ubuntu 安装器及 `pip install gpt4all`。适合补充离线对话、LocalDocs 与本地模型调用。 |
| 开源应用 · 开发数据 | Outerbase Studio | [outerbase/studio](https://github.com/outerbase/studio) | 浏览器数据库 GUI / 可安装桌面应用｜Web、Windows、macOS | README 将其定义为轻量浏览器数据库管理 GUI，支持 SQLite、LibSQL、Cloudflare D1，并以测试版支持 MySQL、PostgreSQL；同时提供 Windows、macOS Electron 桌面端，可编辑查询、数据和表结构。适合补充本地及云数据库浏览管理。 |
| 开源应用 · 家庭媒体 | Kodi | [xbmc/xbmc](https://github.com/xbmc/xbmc) | 可安装家庭影院 / 媒体中心应用｜Android、BSD、Linux、macOS、iOS、tvOS、Windows | README 明确 Kodi 是自由开源媒体播放器与娱乐中心，面向 HTPC 和遥控器使用，可扫描个人媒体建立资料库，并在家庭网络播放音视频；主仓库链接各平台下载。适合补充客厅大屏与家庭媒体库播放。 |
| 开源应用 · 创客制造 | OpenBuilds CONTROL | [OpenBuilds/OpenBuilds-CONTROL](https://github.com/OpenBuilds/OpenBuilds-CONTROL) | 可安装 Grbl 主机 / 机器控制桌面应用｜Windows、Linux、macOS | README 将其定义为面向所有运行 Grbl 的 CNC 类机器的主机与控制界面，并提供正式下载及 Windows、Linux、Mac 构建状态。适合补充 CNC、激光雕刻机等创客设备的连接与作业控制。 |
| 开源应用 · 学习办公 | MarkText | [marktext/marktext](https://github.com/marktext/marktext) | 可安装 Markdown 桌面编辑器｜Windows、macOS、Linux | README 将其定义为重视速度与易用性的开源 Markdown 编辑器，支持实时预览、CommonMark、GitHub Flavored Markdown、数学公式及 HTML/PDF 输出，并提供三平台安装包。适合补充学习笔记、论文草稿和办公文档写作。 |

## 核验边界

- 形态、平台与功能均以各项目主仓库 README 为依据，不采用镜像、第三方打包仓库或聚合列表。
- 实际收录前仍应再次执行规范化 URL 去重；安装前应查看项目最新 release、系统要求与安全公告。
