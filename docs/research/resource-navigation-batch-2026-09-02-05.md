# 资源导航开源应用候选核验（2026-09-02，第 5 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按不区分大小写的完整 URL 与标题检查，以下 6 个主维护 GitHub 仓库均未收录。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库 README 证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · 邮件订阅 | RSS Guard | [martinrotter/rssguard](https://github.com/martinrotter/rssguard) | 可安装桌面订阅阅读器｜Windows、Linux、BSD、OS/2、macOS | [README](https://github.com/martinrotter/rssguard#readme) 将其定义为快速、轻量且可定制的 Feed 阅读器，明确支持 RSS、Atom、JSON、iCalendar、Sitemap 以及多种在线同步服务；适合补充跨平台本地订阅阅读。 |
| 开源应用 · 运动健康 | Workout.cool | [Snouzy/workout-cool](https://github.com/Snouzy/workout-cool) | 可自托管健身训练 Web 平台｜Docker、Docker Compose 或 Node.js + PostgreSQL | [README](https://github.com/Snouzy/workout-cool#readme) 说明其可创建训练计划、跟踪进度并访问带动作说明和视频的运动数据库，同时给出 Docker、Compose 和手动部署步骤；适合补充自托管力量训练规划与进度记录。 |
| 开源应用 · 数据库引擎 | QuestDB | [questdb/questdb](https://github.com/questdb/questdb) | 可自托管时序数据库｜Docker、Linux systemd、Kubernetes；Apple Silicon 可用 Homebrew | [README](https://github.com/questdb/questdb#readme) 将其定义为支持高速写入和低延迟 SQL 查询的开源时序数据库，并列出列式存储、PostgreSQL 协议、REST API、Web 控制台及 Docker 启动方式；适合补充指标、日志和行情等时间序列数据。 |
| 开源应用 · 虚拟化 | Cloud Hypervisor | [cloud-hypervisor/cloud-hypervisor](https://github.com/cloud-hypervisor/cloud-hypervisor) | 可安装虚拟机监控器与命令行程序｜Linux 主机，x86-64、AArch64；基于 KVM 或 MSHV | [README](https://github.com/cloud-hypervisor/cloud-hypervisor#readme) 将其定义为面向现代云工作负载的开源 VMM，支持 64 位 Linux 与 Windows 客体、CPU/内存/PCI 热插拔，并提供预编译二进制与 Linux 软件包；适合补充服务器侧轻量虚拟机运行。 |
| 开源应用 · 下载传输 | AB Download Manager | [amir1376/ab-download-manager](https://github.com/amir1376/ab-download-manager) | 可安装桌面与 Android 下载管理器｜Windows、Linux、macOS、Android | [README](https://github.com/amir1376/ab-download-manager#readme) 说明其用于集中管理下载，支持提速、队列、计划任务与浏览器扩展，并列出 Linux 脚本、Windows Winget/Scoop 和 macOS/Linux Homebrew 安装方式；适合补充图形化跨平台下载管理。 |
| 开源应用 · 音乐制作 | MusE | [muse-sequencer/muse](https://github.com/muse-sequencer/muse) | 可安装 Linux 数字音频工作站｜发行版软件包或源码安装 | [README](https://github.com/muse-sequencer/muse#readme) 说明 MusE 是由项目开发团队维护、支持 MIDI 与音频录制和编辑的音序器，目标是提供完整的 Linux 多轨虚拟录音室；适合补充 Linux 原生编曲、录音与多轨制作。 |

## 建议目录描述

- `RSS Guard`：桌面订阅阅读器｜Windows、macOS、Linux 与 BSD｜订阅 RSS、Atom、JSON 等 Feed，并连接常见在线同步服务。
- `Workout.cool`：自托管健身训练平台｜Docker 或 Node.js｜创建训练计划、查询动作资料并跟踪个人训练进度。
- `QuestDB`：自托管时序数据库｜Docker、Linux 与 Kubernetes｜以 SQL 处理高速写入的指标、日志和行情等时间序列数据。
- `Cloud Hypervisor`：虚拟机监控器｜Linux，x86-64 与 AArch64｜基于 KVM 或 MSHV 运行 64 位 Linux 与 Windows 云工作负载。
- `AB Download Manager`：桌面与 Android 应用｜Windows、macOS、Linux、Android｜通过队列、计划任务和浏览器扩展管理下载。
- `MusE`：Linux 数字音频工作站｜进行 MIDI 与音频录制、编辑、编曲和多轨制作。

## 核验边界

- 功能、安装形态与平台只采用项目主仓库 README；未把第三方软件目录、博客或 GitHub 搜索摘要作为功能证据。
- `Workout.cool` 的 README 同时包含开发与生产部署方法；目录只描述其可自托管能力，不承诺任意环境可直接投入生产。
- `QuestDB` 的核心仓库包含开源引擎；目录描述不扩张到其 README 提及的企业版附加组件。
- `Cloud Hypervisor` 面向服务器云工作负载，不等同于 UTM、Virtual Machine Manager 等通用桌面虚拟机前端。
- `AB Download Manager` 的 README 警告非其列出的应用商店版本可能不安全；目录应链接主仓库，由用户从 README 指向的官方安装渠道获取。
- 实际写入目录前应再次执行规范化 URL 与标题去重，并复核仓库最新维护状态、发行版、许可证和安全公告。
