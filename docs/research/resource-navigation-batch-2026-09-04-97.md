# 资源导航扩充核验：第 97 批

核验日期：2026-09-04。仅研究官方查询入口；未注册、下载数据、调用业务 API 或投标，未修改目录 YAML。

## 去重与选择

全局检索 `src/data/webstack.yml` 的 Tenancy/tenancy.govt.nz、IDMC/internal-displacement/idmcdb、AusTender/tenders.gov.au，三个产品均未收录。已有 IOM DTM 与本批 IDMC 不是同一产品；已有 SAM、TED、CanadaBuys 与澳大利亚联邦 AusTender 不是同一采购入口。三项分别补充新西兰租赁行政数据、全球境内流离失所统计、澳大利亚联邦采购信息，不用已有产品子页凑数。

## 住房生活成本：Tenancy Services Rental Bond Data

- [官方数据入口](https://www.tenancy.govt.nz/about-tenancy-services/data-and-statistics/rental-bond-data/)公开列出租赁押金统计下载及 API 说明，覆盖新西兰，来源为提交给 Tenancy Services 的新租约押金行政记录；页面可直接读取，未实际下载或测试 API。
- [官方解释](https://www.tenancy.govt.nz/rent-bond-and-bills/market-rent/market-rent-explained/)说明原始数据可免费分析；Market Rent 数据为 CC BY 3.0 NZ，发表应链接来源。公开说明及下载入口未要求登录，API 使用条件需另核。
- 押金申报存在延迟，近期值会修订；非政府租赁样本不能代表所有住房或独立确定某套房的合理租金。

```yaml
- title: Tenancy Services Rental Bond Data
  logo: finance.png
  url: https://www.tenancy.govt.nz/about-tenancy-services/data-and-statistics/rental-bond-data/
  description: 新西兰官方租赁押金数据｜免费查询租金与押金统计，复用需署名；申报有延迟和修订，不代表全部住房或单套房屋估价。
```

## 人口迁移：IDMC Global Internal Displacement Database

- [官方 GIDD 入口](https://www.internal-displacement.org/database/displacement-data/)可访问，但本次文本提取主要得到页面框架，未验证交互筛选或下载。
- [IDMC 官网](https://www.internal-displacement.org/)区分冲突暴力、灾害导致的境内流离失所人数和迁移次数，并提供全球数据入口。IDMC 是专业监测机构，不是移民审批机关。
- [第一方 API 文档](https://helix-tools-api.idmcdb.org/external-api/)确认 GIDD 下载文件经过专家验证，数据采用 CC BY-NC-SA 3.0 IGO，要求署名、非商业使用及相同方式共享衍生作品。文档有授权入口，未验证 API 密钥申请；不声称无需账户可调用全部 API，网页下载账户条件本次未确认。
- 数据针对境内流离失所，不是跨国移民/签证资料；次数不等同于独立人数，使用须核对方法和年份。

```yaml
- title: IDMC Global Internal Displacement Database
  logo: finance.png
  url: https://www.internal-displacement.org/database/displacement-data/
  description: 全球境内流离失所数据库｜查询冲突与灾害相关统计；区分人数和迁移次数，数据非商业复用须署名并相同方式共享，不是签证政策入口。
```

## 公共财政采购：AusTender

- [澳大利亚财政部供应商说明](https://sellingtogov.finance.gov.au/guide/identifying-opportunities-to-sell-to-government)确认 AusTender 是公开招标入口，加入和使用免费。
- [财政部采购流程说明](https://sellingtogov.finance.gov.au/theopportunity/procurement-lifecycle)介绍公开招标、合同通知和年度采购计划；免费账号可用于通知，有限招标仅邀请对象可访问。范围是澳大利亚联邦相关机构，并非全部州、市采购。
- 本次[入口](https://www.tenders.gov.au/)抓取返回内部错误，[帮助站](https://help.tenders.gov.au/getting-started-with-austender/)返回 403，未确认具体搜索流程。第一方财政部仍明确指向该域名，保留为有访问限制的官方核验入口。
- 未取得网站/各招标文件统一开放许可，不能把免费查询写成可任意转载；复用依公告及权利条款。资格、截止日期及文件要求逐项核对，不提供投标资格结论。

```yaml
- title: AusTender
  logo: finance.png
  url: https://www.tenders.gov.au/
  description: 澳大利亚联邦采购入口｜查询公开招标、合同通知及采购计划，注册使用免费；部分事项仅限受邀供应商，资格与文件复用须逐项核对。
```
