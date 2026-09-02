# 资源导航第 38 批主要来源核验

核验日期：2026-09-02。本批只采用项目自有 GitHub 仓库、README、LICENSE 与 Releases 作为主要证据。

## 建议收录

| 分类 | 项目 | 形态与适用性 | 许可与维护 | 注意事项 |
| --- | --- | --- | --- | --- |
| 表单调查 | [SurveyJS Form Library](https://github.com/surveyjs/survey-library) | 客户端 JavaScript 组件；用 JSON 渲染 React、Angular、Vue 和原生 JavaScript 表单、调查与测验，提交数据可发往自有后端。 | [MIT](https://github.com/surveyjs/survey-library/blob/master/LICENSE)；[3.0.2](https://github.com/surveyjs/survey-library/releases/tag/v3.0.2) 于 2026-08-26 发布，仓库 2026-09-01 仍有推送。 | 本项只是 Form Library；Creator、Dashboard 等其他 SurveyJS 组件需分别核对许可。 |
| 播客客户端 | [Podcini.A](https://github.com/XilinJia/Podcini.A) | Android 应用；支持播客、RSS、本地媒体、下载、队列和离线播放，也可通过外部应用扩展远程媒体源。 | [GPL-3.0](https://github.com/XilinJia/Podcini.A/blob/main/LICENSE)；[v12.9.0](https://github.com/XilinJia/Podcini.A/releases/tag/v12.9.0) 于 2026-09-01 发布。 | 该项目是 Podcini.X 的后继分支；扩展 YouTube、PeerTube 或 SoundCloud 时需安装对应外部源应用。 |
| 博物档案 | [Archipelago Deployment](https://github.com/esmero/archipelago-deployment) | Docker 自托管的数字对象仓库与 DAM 部署；基于 Drupal 10/11，面向图书馆、档案馆、博物馆、高校与文化遗产机构管理元数据和媒体资产。 | [README 明确标注 GPLv3](https://github.com/esmero/archipelago-deployment/blob/1.7.0/README.md#license)；默认 `1.7.0` 分支 2026-08-28 仍有提交。 | 此仓库主要用于本地开发、测试与定制；面向公网的生产部署应使用官方 [archipelago-deployment-live](https://github.com/esmero/archipelago-deployment-live)，并审核对象存储、访问权限与备份。 |
| 操作系统 | [HelenOS](https://github.com/HelenOS/helenos) | 从零开发的可移植微内核多服务器操作系统，将文件系统、网络、驱动和 GUI 拆分为用户态组件。 | [官方 FAQ](https://www.helenos.org/wiki/FAQ#WhatlicenseisHelenOSreleasedunder) 说明原生代码为 BSD-like、部分第三方组件为 GPLv2；仓库 2026-09-01 仍有推送。 | 官方将它定位为开发与研究系统，不是通用日常桌面发行版；GitHub 最新 Release 还是 2021 年的预发布版，应以源码提交判断当前维护。 |
| 测试自动化 | [Karate](https://github.com/karatelabs/karate) | Java/JVM 跨平台测试框架；用统一 DSL 处理 API 测试、模拟、性能测试和 Web UI 自动化，可接入 JUnit 与 CI。 | [MIT](https://github.com/karatelabs/karate/blob/main/LICENSE.txt)；[v2.1.2](https://github.com/karatelabs/karate/releases/tag/v2.1.2) 于 2026-08-14 发布，仓库 2026-09-01 仍有推送。 | v2 已在发布；现有 v1 项目升级前应核对官方迁移说明与兼容性。 |
| 车辆定位 | [TeslaMate](https://github.com/teslamate-org/teslamate) | Docker 自托管 Tesla 数据记录器；使用 PostgreSQL 存储行程、充电、能耗与位置数据，并通过 Grafana 展示。 | [AGPL-3.0](https://github.com/teslamate-org/teslamate/blob/main/LICENSE)；[v4.2.0](https://github.com/teslamate-org/teslamate/releases/tag/v4.2.0) 于 2026-08-23 发布，仓库 2026-09-01 仍有推送。 | 仅适用于 Tesla；[README 安全警告](https://github.com/teslamate-org/teslamate#%EF%B8%8F-security-warning) 要求只使用官方版本。自托管时须保护账户令牌、数据库和精确位置记录。 |

## 排除与替换

- 排除 `https://github.com/SaptarshiSarkar12/Podcini`：仓库 URL 返回 404。原 [XilinJia/Podcini](https://github.com/XilinJia/Podcini) 的 README 明确说明已于 2025-01 停止维护，因此改用当前后继项目 Podcini.A。
- 排除 [Genode GitHub 镜像](https://github.com/genodelabs/genode)：仓库已归档，并明确迁往 Codeberg，不再是 GitHub 主维护仓库；改用活跃的 HelenOS。
- 排除 Mukurtu CMS：当前 v4 仓库仍为 Beta 且根目录无明确 LICENSE；具有 GPL-2.0 许可的 v3 依赖已[结束官方社区支持](https://www.drupal.org/psa-2025-01-06)的 Drupal 7。为避免许可与维护边界不清，改用 Archipelago Deployment。

## 重复检查

按小写、去首尾空白并去掉结尾 `/` 后检查 `src/data/webstack.yml`：六个最终推荐标题与 URL 均只出现一次，全局无重复 URL。
