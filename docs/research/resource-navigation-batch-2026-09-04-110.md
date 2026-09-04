# 资源导航第 110 批核验

核验日期：2026-09-04。范围：市场资讯三个分类，各补充一个第一方入口；不提供个股建议或交易信号。

## BEA Open Data — 全球宏观数据

- [美国经济分析局开放数据说明](https://www.bea.gov/open-data)可直接读取，提供交互查询、导出与 CSV/XLS/ZIP 数据入口；覆盖美国国民账户、产业、地区及国际账户，而非所有国家。
- [GDP 官方说明](https://www.bea.gov/data/gdp/gross-domestic-product)列出季度 GDP 与历史版本；历史估计会修订。不同数据集频率不同，不能视为实时行情。
- [API 入口](https://apps.bea.gov/api/signup/)提供部分统计数据及元数据，程序化访问另需申请密钥；本批未注册或调用 API。

```yaml
title: BEA Open Data
logo: finance.png
url: https://www.bea.gov/open-data
description: 美国经济分析局开放数据｜查询与导出 GDP、收入、产业及国际账户；频率依数据集而异且历史值会修订，API 需申请密钥。
```

## JPX Listed Company Search — 财报与公司研究

- [日本交易所集团官方入口](https://www.jpx.co.jp/english/listing/co-search/)可直接读取，提供东证上市公司的基础资料、披露与治理信息；官方标注每日约凌晨 1 点更新，最新即时披露另走 Company Announcements Service。
- [官方用户指南](https://www.jpx.co.jp/english/listing/co-search/01.html)说明财务与其他适时披露保存 121 个月，部分治理及公开文件保存 61 个月。网站交互需要 JavaScript；本批未实际下载公司报告，不推断覆盖所有日企。
- [英文披露覆盖说明](https://www.jpx.co.jp/english/equities/listed-co/disclosure-gate/availability/)按公司提供英文披露类型和时间信息；英文范围不是全部原文文件，关键事实应核对原件。

```yaml
title: JPX Listed Company Search
logo: finance.png
url: https://www.jpx.co.jp/english/listing/co-search/
description: 日本交易所集团公司检索｜查东证上市公司资料、财报披露与治理文件；按日更新而非实时，英文覆盖有限，关键内容核对原文。
```

## New York Fed Survey of Consumer Expectations — 另类与行为数据

- [纽约联储消费者预期调查](https://www.newyorkfed.org/microeconomics/sce)正文可直接读取：调查约 1,300 名美国家庭户主的轮换互联网样本，主要涉及通胀、劳动力市场与家庭财务预期；每位参与者最多参加十二个月。
- 同一官方页面说明主要结果按月发布，并向公众提供图表数据、调查问卷及微观数据下载入口；本批核验页面与下载入口存在，未下载或解析数据文件。不同专题模块不能一概视为同频率。
- 解释边界：这是美国受访者的主观预期调查，不是全球人口普查、实际通胀结果或联储政策预测，不可直接变成交易信号。使用前核对样本、调查月份和口径。

```yaml
title: New York Fed Survey of Consumer Expectations
logo: finance.png
url: https://www.newyorkfed.org/microeconomics/sce
description: 纽约联储消费者预期调查｜按月观察美国家庭通胀、就业与财务预期，提供公开数据；属于主观调查，不等于实际结果或政策预测。
```

## 去重与范围

全量检索 `src/data/webstack.yml` 的 BEA/经济分析局、JPX/日本交易所、newyorkfed/Consumer Expectations/消费者预期及对应域名，未发现同一资源；BEA 字符串仅命中其他无关名称。SEDAR+ 已在企业披露分类，排除而不重复增加。

排除 TSA 旅客量：官方入口本次直接提取失败，只有旧分页索引，未以其代替当前正文核验。

本批仅研究文档，未改目录；未注册账户、安装、付费、提交外部信息或执行投资操作。
