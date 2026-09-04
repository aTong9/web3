# 资源导航第 79 批核验

核验日期：2026-09-04。范围：城市建筑、港口物流、风险韧性各一个新入口；仅核验第一方文字资料，不安装或运行软件，不验证动态仪表板交互。

## 城市建筑：EnergyPlus

- [主维护仓库](https://github.com/NatLabRockies/EnergyPlus)的 README 确认：整栋建筑能源与用水模拟程序，BSD-3-like 许可证，生产工作流应采用正式发布版；NREL 旧地址当前重定向至 NatLabRockies。
- [项目官网](https://energyplus.net/)的官方索引说明支持 Windows、macOS、Linux；[官方快速入门](https://energyplus.readthedocs.io/en/stable/quick_start/quick_start.html)说明需提供建筑几何、材料、用途和系统输入。定位是工程模拟引擎，不是自动得出真实建筑能耗的黑箱；输入及模型应由使用者核验。
- 网站直接正文提取为空，GitHub README 可读取；未下载安装包或运行模拟。保守使用已验证的 GitHub 主仓库作为入口。

```yaml
- title: EnergyPlus
  logo: finance.png
  url: https://github.com/NatLabRockies/EnergyPlus
  description: 开源建筑能耗与用水模拟引擎｜支持 Windows、macOS、Linux；需准备建筑与气象输入并核验模型，生产使用正式发布版。
```

## 港口物流：BTS Port Performance

- [美国运输统计局官方入口](https://www.bts.gov/ports)提供美国海港容量、吞吐量及靠泊统计，并链接年度报告和仪表板。
- 官方页明确不同来源港口边界可能不同；统计主要面向美国，不能当作全球港口排名或即时报价。页面可读取，但未操作嵌入式筛选器或下载数据。

```yaml
- title: BTS Port Performance
  logo: finance.png
  url: https://www.bts.gov/ports
  description: 美国运输统计局港口表现入口｜查看海港吞吐量、容量、船舶靠泊统计及年度报告；主要覆盖美国，跨来源比较须核对港口边界和统计期。
```

## 风险韧性：FEMA Hazus

- [FEMA 官方公告](https://content.govdelivery.com/accounts/USDHSFEMA/bulletins/41a9b67)确认 Hazus 为灾害风险评估桌面软件，新版基于 ArcGIS Pro，可用于洪水和地震影响评估。
- [官方用户指南](https://www.fema.gov/sites/default/files/documents/fema_hazus_7_user_guide.pdf)的检索正文说明损失估算含模型不确定性，受资产清单质量影响；[官方发行说明](https://www.fema.gov/sites/default/files/documents/fema_hazus_7_release_notes.pdf)说明 ArcGIS Pro Basic 许可可能存在功能限制。故不标为无依赖开源工具，不承诺全球适用或精确预测。
- [官方产品入口](https://www.fema.gov/flood-maps/tools-resources/flood-map-products/hazus)本次直接抓取失败；官方公告可读取，指南与发行说明仅核验官方检索正文。未验证入口浏览器加载、下载、授权或模型运行，供查阅入口而非运行保证。

```yaml
- title: FEMA Hazus
  logo: finance.png
  url: https://www.fema.gov/flood-maps/tools-resources/flood-map-products/hazus
  description: FEMA 灾害损失评估工具入口｜了解洪水与地震情景分析；桌面版依赖 ArcGIS Pro，须核对许可和区域数据，估算受模型及资产清单质量影响。
```

## 去重与边界

全局检索 `EnergyPlus|energyplus|NatLabRockies|BTS Port|bts.gov|Hazus|hazus|fema.gov` 未发现现有同产品记录。GDACS 已收录，排除；没有用现有资源的子页面充数。三项分别补充建筑模拟、美国港口指标及灾害损失评估，与原分类用途相关。未改动目录 YAML。
