# 资源导航第 22 批主仓库核验（2026-09-02）

## 范围与去重

- 目标分类：地图服务、量化交易、乐谱制谱、邮件客户端、数据标注、图计算。
- 已读取 `src/data/webstack.yml` 全量有效条目；标题按去首尾空格、合并空白、忽略大小写比较，URL 按主机与路径忽略大小写、移除片段及末尾 `/` 比较。
- 下列六个标题和规范化 URL 均未收录；仓库均未归档、不是 fork，并由项目或所属组织直接维护。

## 推荐项目

### 1. 开源应用 · 地图服务 — TileServer GL

- **目录标题 / URL：** `TileServer GL` — https://github.com/maptiler/tileserver-gl
- **形态与适配：** Node.js CLI、npm 包及 Docker 自托管服务。主仓库说明它可从 MBTiles 与 GL 样式发布矢量/栅格地图，并提供 WMTS 等接口。
- **许可证：** BSD-2-Clause；仓库同时列明字体等捆绑内容的独立许可证，部署与再分发时应逐项遵守。
- **维护信号：** 2026-04-06 发布 `v5.6.0`，2026-08-31 仍有主分支更新。
- **来源：** [README](https://github.com/maptiler/tileserver-gl/blob/master/README.md)、[LICENSE](https://github.com/maptiler/tileserver-gl/blob/master/LICENSE.md)、[v5.6.0](https://github.com/maptiler/tileserver-gl/releases/tag/v5.6.0)、[提交记录](https://github.com/maptiler/tileserver-gl/commits/master/)
- **建议描述：** `Node.js 与 Docker 自托管地图瓦片服务器｜从 MBTiles 和 GL 样式发布矢量、栅格地图及 WMTS 服务。`

### 2. 开源应用 · 量化交易 — Freqtrade

- **目录标题 / URL：** `Freqtrade` — https://github.com/freqtrade/freqtrade
- **形态与适配：** Python CLI、Docker 与 Web UI。README 覆盖历史数据回测、参数优化、Dry-Run 和交易执行，并明确建议先使用 Dry-Run。
- **许可证：** GPL-3.0。
- **维护信号：** 2026-08-31 发布 `2026.8`，2026-09-01 仍有开发分支更新。
- **边界：** 仅作为策略研究、回测与执行工具入口；回测或优化结果不代表未来收益，连接真实账户前仍需独立验证策略、数据、风险控制和交易所规则。
- **来源：** [README](https://github.com/freqtrade/freqtrade/blob/develop/README.md)、[文档](https://www.freqtrade.io/en/stable/)、[LICENSE](https://github.com/freqtrade/freqtrade/blob/develop/LICENSE)、[2026.8](https://github.com/freqtrade/freqtrade/releases/tag/2026.8)、[提交记录](https://github.com/freqtrade/freqtrade/commits/develop/)
- **建议描述：** `Python 与 Docker 加密量化研究工具｜回测、优化并以 Dry-Run 验证策略；结果不代表未来收益，实盘前须独立审查风险。`

### 3. 开源应用 · 乐谱制谱 — abcjs

- **目录标题 / URL：** `abcjs` — https://github.com/paulrosen/abcjs
- **形态与适配：** 浏览器 JavaScript/npm 库。README 说明它可把 ABC 文本排版为 SVG 五线谱，并支持编辑器、交互以及 MIDI 合成/播放。
- **许可证：** MIT。
- **维护信号：** 2026-08-07 发布 `v6.7.0`，2026-08-09 仍有主分支更新。
- **来源：** [README](https://github.com/paulrosen/abcjs/blob/main/README.md)、[LICENSE](https://github.com/paulrosen/abcjs/blob/main/LICENSE.md)、[v6.7.0](https://github.com/paulrosen/abcjs/releases/tag/v6.7.0)、[提交记录](https://github.com/paulrosen/abcjs/commits/main/)
- **建议描述：** `浏览器 JavaScript 乐谱排版库｜把 ABC 文本渲染为 SVG 五线谱，并支持编辑、交互与 MIDI 播放。`

### 4. 开源应用 · 邮件客户端 — Cypht

- **目录标题 / URL：** `Cypht` — https://github.com/cypht-org/cypht
- **形态与适配：** PHP/JavaScript 自托管 Web 邮件客户端，README 提供 Docker 等安装路径，可聚合 IMAP、SMTP、JMAP、EWS 邮箱及 RSS。
- **许可证：** LGPL-2.1。
- **维护信号：** 2026-08-29 发布 `v2.12.2`，2026-09-01 仍有主分支更新。
- **来源：** [README](https://github.com/cypht-org/cypht/blob/master/README.md)、[安装文档](https://github.com/cypht-org/cypht/wiki/Install)、[LICENSE](https://github.com/cypht-org/cypht/blob/master/LICENSE)、[v2.12.2](https://github.com/cypht-org/cypht/releases/tag/v2.12.2)、[提交记录](https://github.com/cypht-org/cypht/commits/master/)
- **建议描述：** `PHP 自托管聚合式 Web 邮件客户端｜统一管理多个 IMAP、SMTP、JMAP 与 EWS 邮箱及 RSS。`

### 5. 开源应用 · 数据标注 — Datumaro

- **目录标题 / URL：** `Datumaro` — https://github.com/open-edge-platform/datumaro
- **形态与适配：** Python 库与 CLI。主仓库将其定位为计算机视觉数据集管理框架，可转换、合并、过滤、校验和分析分类、检测、分割等数据及标注格式；它补充标注数据治理，不是人工绘框 UI。
- **许可证：** MIT。
- **维护信号：** 2026-08-27 发布 `v1.13.9`，2026-09-01 仍有开发分支更新。
- **隐私与授权边界：** 工具不会自动赋予数据使用权；导入、转换和共享数据集前仍须确认采集同意、隐私、版权、许可证及访问控制要求。
- **来源：** [README](https://github.com/open-edge-platform/datumaro/blob/develop/README.md)、[文档](https://open-edge-platform.github.io/datumaro/)、[LICENSE](https://github.com/open-edge-platform/datumaro/blob/develop/LICENSE)、[v1.13.9](https://github.com/open-edge-platform/datumaro/releases/tag/v1.13.9)、[提交记录](https://github.com/open-edge-platform/datumaro/commits/develop/)
- **建议描述：** `Python 标注数据集管理库与 CLI｜转换、合并、校验和分析多种计算机视觉数据及标注格式；使用前确认数据授权与隐私要求。`

### 6. 开源应用 · 图计算 — Apache TinkerPop

- **目录标题 / URL：** `Apache TinkerPop` — https://github.com/apache/tinkerpop
- **形态与适配：** JVM 图计算框架，包含 Gremlin 遍历语言、Gremlin Server/Console、TinkerGraph 参考实现及多语言驱动，覆盖图数据库 OLTP 与图分析 OLAP。
- **平台 / 安装：** Java 11/17 与 Maven；官方 README 给出构建 Gremlin Console/Server 的命令，并列出 Java、Python、.NET、JavaScript 和 Go 生态入口。
- **许可证：** Apache-2.0。
- **维护信号：** 主仓库未归档，2026-09-01 仍有主分支提交；更新记录持续维护当前 3.8 系列。
- **来源：** [README](https://github.com/apache/tinkerpop/blob/master/README.md)、[CHANGELOG](https://github.com/apache/tinkerpop/blob/master/CHANGELOG.asciidoc)、[LICENSE](https://github.com/apache/tinkerpop/blob/master/LICENSE)、[提交记录](https://github.com/apache/tinkerpop/commits/master/)
- **建议描述：** `Apache 属性图计算框架｜以 Gremlin 统一图遍历、Gremlin Server 与多语言驱动，覆盖 OLTP 和 OLAP。`

## 排除项

- GNU Denemo 的 GitHub 页面明确标为镜像仓库；aerc 的 GitHub 仓库明确为 SourceHut 只读镜像，均不符合本批“主维护 GitHub 项目”的准入条件。
- abcm2ps 仓库已归档且 README 标记停止维护，因此未采用。

## 结论

六项均符合本批“主维护 GitHub 项目 + 可安装、自托管、CLI 或开发库”的准入条件，与当前目录标题及规范化 URL 无冲突。写入目录时应采用上述标题、URL 和边界化描述。
