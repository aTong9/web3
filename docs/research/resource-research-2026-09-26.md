# 官方研究资料补充

核对日期：2026-09-26。逐项打开官方页面，沿用现有分类；共新增 10 条，无重复 URL。

## 来源与用途

| 分类 | 官方来源 | 用途与边界 |
| --- | --- | --- |
| 市场资讯 · 全球宏观数据 | [FRED API 文档](https://fred.stlouisfed.org/docs/api/fred/) | 圣路易斯联储官方接口文档；查询宏观序列、发布日期与历史观测，接入前核对 API Key 和使用条款。 |
| 市场资讯 · 全球宏观数据 | [ALFRED 历史版本数据](https://alfred.stlouisfed.org/) | 按历史日期查看当时可获得的宏观数据版本；用于区分首次公布与后续修订，研究回测中的前视偏差。 |
| 市场资讯 · 全球宏观数据 | [世界银行数据 API 指南](https://datahelpdesk.worldbank.org/knowledgebase/topics/125589-developer-information) | 世界银行官方开发资料；按国家、指标与年份查询数据，使用时同时记录单位、频率、缺失值和来源。 |
| 市场资讯 · 财报与公司研究 | [SEC EDGAR API 文档](https://www.sec.gov/search-filings/edgar-application-programming-interfaces) | 官方公司申报与 XBRL 财务数据接口，无需 API Key；核对 CIK、财年、单位及修订申报，遵守自动访问政策，不支持浏览器跨域直连。 |
| 市场资讯 · 财报与公司研究 | [SEC 财务报表数据集](https://www.sec.gov/data-research/sec-markets-data/financial-statement-data-sets) | SEC 官方结构化财务报表下载入口；适合批量公司研究，数值须回查原始申报及标签口径，不能代替完整财报。 |
| 加密生态 · 链上开发数据 | [DefiLlama 指标与方法文档](https://docs.llama.fi/) | 核对 TVL、协议费用、收入、稳定币等指标的定义与开源适配器；不同指标不能直接视为代币持有人收益。 |
| 加密生态 · 链上开发数据 | [Dune 链上分析文档](https://docs.dune.com/) | 官方 SQL 查询、数据目录与 API 文档；复核链、表、时间范围及查询逻辑，使用前查看账户额度与服务条款。 |
| 加密生态 · 链上开发数据 | [Ethereum 开发者文档](https://ethereum.org/developers/docs/) | 以太坊官方学习入口，覆盖账户、交易、区块、节点与智能合约；适合建立链上研究的数据语义基础。 |
| 认知入口 · 科研证据 | [OpenAlex 数据帮助中心](https://help.openalex.org/) | 开放学术目录的官方帮助入口；了解论文、作者、机构与数据获取方式，收录和引用次数不等于研究质量。 |
| 认知入口 · 科研证据 | [Crossref 元数据 REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) | Crossref 官方 DOI 元数据接口文档；检索论文出版信息及关联元数据，元数据开放不代表论文全文可自由使用。 |

## 使用方法

- 宏观研究：先记录观测期、发布日期和版本，再比较资产表现；ALFRED 用来查看历史时点可获得的版本。
- 公司研究：先确定 CIK 和申报期，再读取财务字段，回查原始财报；SEC 数据接口不支持浏览器 CORS，新增文档不等于完成接口接入。
- 链上研究：先统一链、协议、查询窗口和指标定义，再比较 TVL、费用与收入。
- 科研证据：用 DOI 和作者、发表日期定位原文，再评估方法；元数据与引用数量不是论文结论的担保。

## 核验说明

- OpenAlex 文档入口跳转至帮助中心，收录跳转后的地址；Ethereum 文档同样采用核实后的地址。
- 已有 SEC 全文检索入口保留，未重复新增。
- 修复已有 `#MetKids` 标题的 YAML 引号，官网当前跳转至 [MetKids 存档](https://archived.metmuseum.org/art/online-features/metkids/)。
- 核对的是资料入口和官方描述，没有运行第三方 API、验证全部历史数据，也没有核对全部存量资源。
