# 资源导航开源应用候选核验（2026-09-02，第 6 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按不区分大小写的完整 URL 与标题检查，以下 6 个主维护 GitHub 仓库均未收录。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库 README 证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · 教学学习 | eXeLearning | [exelearning/exelearning](https://github.com/exelearning/exelearning) | Docker 自托管与桌面应用｜Linux、Windows、macOS | [README](https://github.com/exelearning/exelearning#readme) 将其定义为互动开放教育资源创作与发布工具，列出 Moodle 集成、协作编辑、多格式导出、Docker 启动命令及三大桌面系统离线安装包；适合补充教师备课、互动课件制作和课程平台导出。 |
| 开源应用 · 内容建站 | ApostropheCMS | [apostrophecms/apostrophe](https://github.com/apostrophecms/apostrophe) | 自托管 Node.js CMS｜Node.js、MongoDB、npm CLI | [README](https://github.com/apostrophecms/apostrophe#readme) 说明它是支持页面内编辑与 Headless 架构的全栈 CMS，给出 npm CLI / npx 建站命令，并可部署到任何运行 Node.js 的平台；适合补充可视化内容编辑与定制网站开发。 |
| 开源应用 · 项目协作 | Huly | [hcengineering/platform](https://github.com/hcengineering/platform) | Docker 自托管协作平台｜Linux、macOS，amd64、arm64 | [README](https://github.com/hcengineering/platform#readme) 列出聊天、项目管理、CRM、HRM 与招聘应用，并明确提供 Docker 自托管路径及 Linux/macOS 的 amd64、arm64 容器；适合补充项目、沟通与业务流程一体化协作。 |
| 开源应用 · 电商零售 | Solidus | [solidusio/solidus](https://github.com/solidusio/solidus) | 自托管 Ruby on Rails 电商平台｜Ruby gems、Rails、Docker Compose | [README](https://github.com/solidusio/solidus#readme) 将其定义为完整的 Rails 开源电商方案，列出核心模型、REST API、管理后台与示例数据组件，并给出 Rails 与 Docker Compose 运行方式；适合补充可深度定制的商店后端和店面。 |
| 开源应用 · 地理空间 | GRASS GIS | [OSGeo/grass](https://github.com/OSGeo/grass) | 桌面 GIS、命令行与开发接口｜CLI、Python、R | [README](https://github.com/OSGeo/grass#readme) 将其定义为栅格、矢量与地理处理引擎，覆盖地形、生态、水文、影像和时序分析，并明确可作为桌面 GIS 或通过命令行、Python、R 使用；适合补充专业空间分析与批处理。 |
| 开源应用 · 安全防护 | osquery | [osquery/osquery](https://github.com/osquery/osquery) | 跨平台命令行与主机监控框架｜Linux、macOS、Windows | [README](https://github.com/osquery/osquery#readme) 说明它通过 SQL 查询进程、内核模块、网络连接、浏览器插件、硬件事件和文件哈希，可用 `osqueryi` 临时检查或调度执行主机监控；适合补充终端资产可见性与安全调查。 |

## 建议目录描述

- `eXeLearning`：Docker 自托管与桌面应用｜Linux、Windows、macOS｜创建互动教育内容，导出至 Moodle 等平台并支持协作编辑。
- `ApostropheCMS`：自托管 Node.js CMS｜使用页面内编辑、内容模型与 Headless API 构建网站，可通过 npm CLI 创建和部署。
- `Huly`：Docker 自托管协作平台｜整合项目管理、聊天、CRM、HRM 与招聘流程，支持 amd64 和 arm64 容器。
- `Solidus`：自托管 Ruby on Rails 电商平台｜提供商品核心、REST API、管理后台与可定制店面。
- `GRASS GIS`：桌面 GIS、命令行与开发接口｜处理栅格、矢量、地形、水文、遥感和时序空间分析。
- `osquery`：跨平台命令行与主机监控框架｜Linux、macOS、Windows｜用 SQL 查询进程、网络、文件哈希等系统状态。

## 核验边界

- 功能、安装形态与平台只采用项目主仓库 README；未把第三方软件目录、博客或 GitHub 搜索摘要作为功能证据。
- eXeLearning 同时提供服务端与离线桌面形态；目录描述不承诺两种形态的协作和部署能力完全相同。
- Huly README 已公告其托管服务停止，但明确自托管部署不受影响；目录只推荐其自托管形态。
- Solidus README 警告主分支不保证可用于生产；实际部署应采用项目标记的稳定发行版。
- GRASS GIS 的桌面与接口能力来自同一处理引擎；目录不把它描述成在线地图发布服务。
- osquery 提供系统状态查询和监控能力，不等同于主动拦截、恶意软件清除或完整终端防护套件。
- 实际写入目录前应再次执行规范化 URL 与标题去重，并复核仓库最新维护状态、稳定发行版、许可证和安全公告。
