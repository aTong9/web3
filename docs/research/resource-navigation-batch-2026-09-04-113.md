# 资源导航第 113 批核验

核验日期：2026-09-04。范围：消费金融核验、制裁出口管制、量化研究，各补一个第一方入口。

## MAS Financial Institutions Directory — 认知入口 · 消费金融核验

- [新加坡金管局目录](https://eservices.mas.gov.sg/fid/)公开页面可读，按机构、牌照类型或业务活动查找，涵盖银行、资本市场、金融顾问及支付机构等。
- 页面明确警告冒充受监管机构的诈骗，要求通过官方联系方式核验身份；列名不是投资回报或交易安全保证。本次未提交检索、个人资料或金融操作。

```yaml
title: MAS Financial Institutions Directory
logo: finance.png
url: https://eservices.mas.gov.sg/fid/
description: 新加坡金管局金融机构目录｜按机构、牌照与业务活动核验监管信息；须通过官方联系方式排除冒名者，列名不代表投资安全或收益保证。
```

## SECO Sanctions Search — 认知入口 · 制裁出口管制

- [瑞士 SECO 制裁主页](https://www.seco.admin.ch/en/sanctions-en)链接至[名单与检索说明](https://www.seco.admin.ch/en/searching-for-subjects-sanctions)，提供个人、企业和组织制裁检索及 XML 综合名单。
- 官方说明明确该搜索仅为辅助工具，直接列名结果不涵盖所有权或控制关系；因此不能用无命中推导交易合法。目录采用附有边界说明的入口而非裸搜索表单。
- 页面附件日期存在晚于本次环境日期的显示，不将其用于声明政策更新日期；本次只核实页面用途与明示限制，未下载名单或给出个案法律判断。

```yaml
title: SECO Sanctions Search
logo: finance.png
url: https://www.seco.admin.ch/en/searching-for-subjects-sanctions
description: 瑞士 SECO 制裁名单与检索入口｜查询直接列名个人、企业和组织；不覆盖所有权或控制关系，无命中不等于交易合规，须结合现行法规核验。
```

## QuantStats — 开源应用 · 量化交易

- [维护者仓库](https://github.com/ranaroussi/quantstats)说明提供 Python 投资组合绩效指标、回撤图和 HTML 分析报告，可用 pip 或 conda 安装。
- [项目配置](https://github.com/ranaroussi/quantstats/blob/main/pyproject.toml)标注 Apache-2.0、Python 3.10+、Operating System Independent；这是 Python 库，不是独立桌面应用。平台与依赖仍需使用者核验。
- 收录用途限于历史数据研究与分析，不接交易接口。指标依赖输入质量、计算设定与样本，历史结果不保证未来收益；未安装或运行计算，也未下载行情。

```yaml
title: QuantStats
logo: finance.png
url: https://github.com/ranaroussi/quantstats
description: Apache-2.0 开源 Python 组合分析库｜需 Python 3.10+，计算绩效与回撤并生成 HTML 报告；用于历史数据研究，结果不保证未来收益。
```

## 去重与范围

全量检索 src/data/webstack.yml：MAS、mas.gov、新加坡金融/金融管理局、SECO、seco.admin、瑞士制裁、sesam、QuantStats、ranaroussi、portfolio analytics。没有上述产品或 URL 条目；sesam 只命中无关的 Sesame Workshop 与 OpenSesame。三项填补新加坡金融核验、瑞士制裁名单、组合分析库的不同用途，不复制现有美国/英国登记、制裁入口或回测引擎。

仅新增本研究记录，未改 YAML；未安装、注册、下单、执行交易、上传私密数据或提交外部表单。目录与构建验证由主任务落盘后进行。
