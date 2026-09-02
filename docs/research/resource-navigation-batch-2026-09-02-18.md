# 资源导航第 18 批：企业与开发开源工具核验

核验日期：2026-09-02

## 范围与去重

本批为医院管理、客服支持、企业搜索、浏览器内核、人力资源、API 调试六个现有分类各筛选一个可安装、自托管或可嵌入的主维护 GitHub 项目。

读取 `src/data/webstack.yml` 后，将标题转为小写，将 URL 转为小写并移除末尾 `/` 与 `.git` 做全目录比对。目录当前有 2402 个有效 URL，规范化后仍为 2402 个；下列六个标题与 URL 均为零命中。核验前六个目标分类均有 6 项。

## 推荐条目

### 1. 医院管理：Medplum

- 主仓库：https://github.com/medplum/medplum
- 形态与平台：可自托管的 FHIR 医疗开发平台与临床数据仓库，包含服务端、Web 应用、认证、SDK 和接口；它是医院与诊所应用的开发底座，不是开箱即用的完整 HIS。
- 许可证：Apache-2.0。
- 维护信号：核验时远端 HEAD 为 `38e748553aaac3ec813b2f476db9168134185c60`，提交源最近更新于 2026-09-01，Releases 持续提供 5.x 版本。
- 一手来源：[主仓库 README](https://github.com/medplum/medplum#readme)、[自托管文档](https://github.com/medplum/medplum/blob/main/packages/docs/docs/self-hosting/install-from-scratch.md)、[LICENSE](https://github.com/medplum/medplum/blob/main/LICENSE.txt)、[Releases](https://github.com/medplum/medplum/releases)、[核验时 HEAD](https://github.com/medplum/medplum/commit/38e748553aaac3ec813b2f476db9168134185c60)

建议描述：`可自托管 FHIR 医疗开发平台｜集中管理临床数据、身份权限和接口，并用于构建医院与诊所工作流；不是开箱即用的完整 HIS。`

> 边界：以上仅描述软件用途与部署形态，不代表对医疗合规、安全性或临床适用性的判断。

### 2. 客服支持：Frappe Helpdesk

- 主仓库：https://github.com/frappe/helpdesk
- 形态与平台：基于 Frappe Framework 的自托管客服工单 Web 应用，提供客服与客户门户、SLA、分配规则、知识库和快捷回复。
- 许可证：AGPL-3.0。
- 维护信号：核验时远端 HEAD 为 `6f32222675d18da7fefb3fe93347fc7da8725b49`，提交源最近更新于 2026-09-01；Releases 持续提供 v1.x 版本。
- 一手来源：[主仓库 README](https://github.com/frappe/helpdesk#readme)、[官方文档](https://docs.frappe.io/helpdesk)、[license.txt](https://github.com/frappe/helpdesk/blob/develop/license.txt)、[Releases](https://github.com/frappe/helpdesk/releases)、[核验时 HEAD](https://github.com/frappe/helpdesk/commit/6f32222675d18da7fefb3fe93347fc7da8725b49)

建议描述：`自托管客服工单平台｜提供客服与客户门户、SLA、自动分配、知识库和快捷回复。`

### 3. 企业搜索：Quickwit

- 主仓库：https://github.com/quickwit-oss/quickwit
- 形态与平台：Rust 编写的自托管云原生分布式搜索引擎，面向对象存储上的日志和链路数据，提供 REST API 及部分 Elasticsearch/OpenSearch 兼容接口。
- 许可证：Apache-2.0。
- 维护信号：核验时远端 HEAD 为 `ede9444d52568014a4c01cb63648092f9972fc5d`，提交源最近更新于 2026-09-01；README 与 Releases 提供 0.8 系列安装和版本记录。
- 一手来源：[主仓库 README](https://github.com/quickwit-oss/quickwit#readme)、[安装文档](https://quickwit.io/docs/get-started/installation)、[LICENSE](https://github.com/quickwit-oss/quickwit/blob/main/LICENSE)、[Releases](https://github.com/quickwit-oss/quickwit/releases)、[核验时 HEAD](https://github.com/quickwit-oss/quickwit/commit/ede9444d52568014a4c01cb63648092f9972fc5d)

建议描述：`自托管云原生搜索引擎｜在对象存储上索引和查询日志、链路等数据，并提供 REST 与部分 Elasticsearch 兼容接口。`

### 4. 浏览器内核：Gosub

- 主仓库：https://github.com/gosub-io/gosub-engine
- 形态与平台：Rust 编写、可嵌入的异步浏览器引擎，包含 HTML/CSS 解析、网络、分区存储和可插拔渲染后端；README 明确标注仍处活跃开发期。
- 许可证：MIT。
- 维护信号：核验时远端 HEAD 为 `a031a71a7ed23d2c01ae14637ebd378099f62f7a`，提交源最近更新于 2026-09-01。
- 一手来源：[主仓库 README](https://github.com/gosub-io/gosub-engine#readme)、[LICENSE](https://github.com/gosub-io/gosub-engine/blob/main/LICENSE)、[提交记录](https://github.com/gosub-io/gosub-engine/commits/main/)、[核验时 HEAD](https://github.com/gosub-io/gosub-engine/commit/a031a71a7ed23d2c01ae14637ebd378099f62f7a)

建议描述：`Rust 可嵌入浏览器引擎｜提供 HTML/CSS 解析、异步网络、分区存储和可插拔渲染后端；目前仍在积极开发。`

### 5. 人力资源：MintHCM

- 主仓库：https://github.com/minthcm/minthcm
- 形态与平台：可在本地、云或混合环境自托管的人力资本管理 Web 平台，覆盖招聘、入离职、员工档案、考勤休假、绩效、组织结构和报表。
- 许可证：AGPL-3.0。
- 维护信号：核验时远端 HEAD 为 `d8d4d29475d72e4846b50d5527c9721819f9e977`，提交源最近更新于 2026-08-20；Releases 于 2026-07 提供 4.3.2.1。
- 一手来源：[主仓库 README](https://github.com/minthcm/minthcm#readme)、[LICENSE](https://github.com/minthcm/minthcm/blob/master/LICENSE)、[Releases](https://github.com/minthcm/minthcm/releases)、[核验时 HEAD](https://github.com/minthcm/minthcm/commit/d8d4d29475d72e4846b50d5527c9721819f9e977)

建议描述：`自托管人力资本管理平台｜覆盖招聘、入离职、员工档案、考勤休假、绩效、组织结构和报表。`

### 6. API 调试：Restfox

- 主仓库：https://github.com/flawiddsouza/Restfox
- 形态与平台：离线优先的 Web 与桌面 API 客户端，提供 macOS、Linux、Windows 包及 Docker/Web 部署方式，可调试 HTTP、GraphQL、WebSocket 和 Socket.IO。
- 许可证：MIT。
- 维护信号：核验时远端 HEAD 为 `e8e158e8de297a2fec0259169e45e647fb989446`，提交源最近更新于 2026-07-03；Releases 提供桌面安装包。
- 一手来源：[主仓库 README](https://github.com/flawiddsouza/Restfox#readme)、[LICENSE](https://github.com/flawiddsouza/Restfox/blob/main/LICENSE)、[Releases](https://github.com/flawiddsouza/Restfox/releases)、[核验时 HEAD](https://github.com/flawiddsouza/Restfox/commit/e8e158e8de297a2fec0259169e45e647fb989446)

建议描述：`离线优先的 Web 与桌面 API 客户端｜调试 HTTP、GraphQL、WebSocket 和 Socket.IO，并可通过 Docker 自托管 Web 版。`

## 未采用候选

- `usebruno/bruno` 与 `erxes/erxes`：已在全目录其他分类收录，避免重复 URL。
- `Peppermint-Lab/peppermint`：仓库于 2026-07-17 被维护者归档，不作为本批新增项目。
- `LibreHealthIO/lh-ehr`：虽为可安装医疗管理应用，但 GitHub 主仓库最近提交停留在 2022 年；本批选择仍持续维护的 Medplum，并在描述中明确其不是完整 HIS。
- `litehtml/litehtml`：是活跃的轻量 HTML/CSS 渲染库，但 README 明确不建议作为完整浏览器引擎；本批采用分类适配更准确的 Gosub。
