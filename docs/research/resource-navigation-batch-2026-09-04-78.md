# 资源导航第 78 批：矿产、水文与生物多样性

核验日期：2026-09-04。仅核对官方网页，不安装软件、不提交数据申请、不下载数据；交互地图未完成端到端验证。

## 1. 认知入口 · 矿产资源

推荐 Critical Minerals Mapping Initiative（CMMI）。[Geoscience Australia 官方入口说明](https://www.ga.gov.au/scientific-topics/minerals/investing-in-australian-mineral-exploration/publications-and-portals)明确说明这是澳大利亚、加拿大、美国合作的免费交互地图与数据发现工具，并直接链接到 [CMMI 门户](https://portal.ga.gov.au/persona/cmmi)。门户是动态应用，网页提取未返回地图内容；因此只确认官方链接和用途，不声称已查询成功。地图数据应逐项检查元数据、覆盖范围及许可，不把矿产线索表述为可开采储量或投资结论。

```yaml
- title: Critical Minerals Mapping Initiative
  logo: finance.png
  url: https://portal.ga.gov.au/persona/cmmi
  description: 澳加美联合关键矿产地图｜免费探索关键矿产相关地图与数据；使用前核对图层覆盖、元数据及许可，矿产线索不等于可开采储量。
```

## 2. 认知入口 · 水资源

推荐 GRDC Data Portal。[官方使用指南](https://grdc.bafg.de/data/data_portal_guide/index.html)说明可按站点、流域、国家和时段筛选径流数据，查看日/月流量、统计及流域边界。下载仅限非商业用途，须填写联系方式及申请详情，通过邮件收取链接，不是匿名即时下载。选择指南作为导航入口，便于先了解限制后进入动态门户。[直接门户](https://portal.grdc.bafg.de/)重定向到 applications 页面，无可提取正文；未提交表单或验证文件下载。GRDC 根首页抓取超时，但指南当次成功返回。

```yaml
- title: GRDC Data Portal
  logo: finance.png
  url: https://grdc.bafg.de/data/data_portal_guide/index.html
  description: 全球径流数据中心查询指南与入口｜按站点、流域和时段查看河流流量及统计；下载限非商业用途，须填写联系信息并通过邮件获取链接。
```

## 3. 认知入口 · 生物多样性

推荐 Atlas of Living Australia（ALA）。[官方首页](https://www.ala.org.au/)提供按物种、地区、日期、位置和来源检索出现记录的入口及空间分析工具。[机构介绍](https://www.ala.org.au/about-ala/)确认由 CSIRO 托管，并为 GBIF 澳大利亚节点；与已收录 GBIF 属于相关数据网络，但这是面向澳大利亚的独立查询与空间分析入口，并非 GBIF 的别名。[使用条款](https://www.ala.org.au/terms-of-use/)要求按具体数据许可、提供者条款和署名要求使用，尊重敏感数据限制；不把平台开放访问解释为所有内容均可任意商用。

```yaml
- title: Atlas of Living Australia
  logo: finance.png
  url: https://www.ala.org.au/
  description: 澳大利亚生物多样性数据入口｜按物种、地区和日期检索观察记录并进行空间分析；须遵守各数据集许可、署名及敏感物种数据限制。
```

## 去重及边界

- 已解析当前 `src/data/webstack.yml`，三个目标分类各有 7 项。
- 全局检索 `Geoscience|Australian Critical|GRDC|Global Runoff|Living Australia|ala.org.au` 及 `cmmi|Critical Minerals Mapping|portal.ga.gov.au` 均无命中，未发现推荐产品或网址已收录。
- 三项均为官方公共数据查询入口，不将它们标注为已核验开源软件，不虚构 GitHub 仓库、安装平台或维护时间。
