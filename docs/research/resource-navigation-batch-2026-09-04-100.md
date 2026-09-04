# 资源导航第 100 批：公众安全与监管查询

核验日期：2026-09-04。仅新增信息入口，不给出医疗、化学操作或核技术建议。未安装、注册、下载数据或实际查询具体产品。

## 1. AICIS Chemical Information

- 分类：认知入口 · 化学品安全。
- [官方入口](https://www.industrialchemicals.gov.au/chemical-information)提供澳大利亚工业化学品名录、评估报告和禁限用信息导航；[评估入口](https://services.industrialchemicals.gov.au/search-assessments/)明确包括原 NICNAS 评估。
- 信息页直接公开，无登录或付费墙；动态评估页在抓取中显示离线/权限占位文本，未验证实际检索，不据此承诺数据库无账户限制。
- [版权](https://www.industrialchemicals.gov.au/copyright)：一般自有内容 CC BY 4.0，但徽标、图片、第三方内容及 CAS 信息等除外，不能称全部开放数据。
- 仅澳大利亚工业化学品监管语境；列入名录不等于在任意用途下安全。建议用可读的官方信息总入口，不直接指向本次未成功运行的动态搜索页。

```yaml
- title: AICIS Chemical Information
  logo: finance.png
  url: https://www.industrialchemicals.gov.au/chemical-information
  description: 澳大利亚工业化学品信息入口｜查找名录、评估和禁限用资料；适用范围限工业化学品，收录不代表任意用途安全，转载须核对第三方版权。
```

## 2. Australian Register of Therapeutic Goods (ARTG)

- 分类：认知入口 · 药品医疗器械。
- [官方搜索入口](https://www.tga.gov.au/resources/artg)与[使用说明](https://www.tga.gov.au/products/regulations-all-products/about-australian-register-therapeutic-goods-artg/searching-australian-register-therapeutic-goods-artg)证实可检索药品及医疗器械，按产品名、申办方、活性成分及编号查询澳大利亚登记资料。
- 官方称其为公众可访问版本；信息页与搜索入口无需登录即可读取，没有看到收费要求。未提交实际产品查询。
- 官方明确它不是产品建议，存在豁免及特殊准入产品，不可把未查到等同于违法或不安全。
- [版权](https://www.tga.gov.au/about-us/using-our-website/copyright)：一般允许个人或组织内部原样使用并保留声明，不允许随意商业复用；并非开放许可数据全集。

```yaml
- title: Australian Register of Therapeutic Goods (ARTG)
  logo: finance.png
  url: https://www.tga.gov.au/resources/artg
  description: 澳大利亚治疗用品登记查询｜按产品、成分或编号检索药品与医疗器械；存在豁免和特殊准入，登记信息不是用药建议，内容商业复用受限。
```

## 3. BfS ODL-Info

- 分类：认知入口 · 核能核安全。
- [BfS 官方首页](https://bfs.de/)列出 ODL-INFO 德国环境放射性入口；[德国政府数据门户的 BfS 测站记录](https://data.gov.de/suche/daten/messdaten-gamma-odl-station-oberstdorf)搜索索引说明其为德国约 1700 个环境辐射监测探头网络，并列出测站地图及数据说明。
- [拟收录入口](https://odlinfo.bfs.de/)及[接口说明](https://odlinfo.bfs.de/ODL/DE/service/datenschnittstelle/datenschnittstelle_node.html)本次抓取失败/403；政府数据页正文也返回 403，仅其官方搜索索引可读。不能声称地图、数据下载或即时读数已验证。
- 官方介绍定位为公众在线环境辐射信息；未核实账户要求、费用或再利用许可，因此不在卡片承诺免费、免登录或开放许可。数据利用须另查原站条款。
- 只介绍环境监测，不涉及核设计、燃料或制造。站点读数不代表个人吸收剂量，不能单独判断健康风险或代替官方应急通知。

```yaml
- title: BfS ODL-Info
  logo: finance.png
  url: https://odlinfo.bfs.de/
  description: 德国联邦辐射防护局环境监测入口｜查看环境伽马辐射测站信息；站点读数不等于个人剂量，风险判断应遵循官方通报，数据复用须核对条款。
```

## 全局去重

对 src/data/webstack.yml 检查 industrialchemicals、AICIS、NICNAS、tga.gov、ARTG、Therapeutic Goods、bfs.de、ODL-Info、Bundesamt 等产品/域名别名；本批三个独立产品没有既有记录。它们补充澳大利亚监管及德国环境监测覆盖，并非已收录产品的子页拆分。
