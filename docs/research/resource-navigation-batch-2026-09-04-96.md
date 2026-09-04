# 资源导航第 96 批：宏观、企业披露与贸易查询

核验日期：2026-09-04。仅研究官方公开入口，未注册、下载安装或提交查询；公开可读不等于任意再分发许可。不提供投资或通关法律结论。

## 去重与选择

已解析 `src/data/webstack.yml`，目标三个分类各有 7 项。全局搜索 CEPAL/ECLAC、DART/fss.or.kr、Access2Markets/access-to-markets/Market Access Database/Export Helpdesk 均无匹配。三项为独立服务，不以已有平台子页增加数量；CEPALSTAT 补充拉美加勒比区域而非重复声称全球覆盖。

## 认知入口 · 全球宏观：CEPALSTAT

- [ECLAC 官方数据介绍](https://www.cepal.org/en/data-and-statistics)确认 CEPALSTAT 是其收集、整理、发布拉美加勒比统计的入口。
- [英文门户](https://statistics.cepal.org/portal/cepalstat/index.html?lang=en)本次可打开但为动态页面，文本抽取有限；[开放数据 API 入口](https://statistics.cepal.org/portal/cepalstat/open-data.html?lang=en)公开列出接口规范。
- [官方指标样例](https://statistics.cepal.org/portal/cepalstat/dashboard.html?area_id=2599&indicator_id=4963&lang=en)包含定义、技术表、年份及地区范围，可用于核对口径。公开说明无需登录可读；未验证批量 API 配额和单项下载，未找到足以概括全库的再分发许可，因此不承诺无限调用或开放许可。

```yaml
- title: CEPALSTAT
  logo: finance.png
  url: https://statistics.cepal.org/portal/cepalstat/index.html?lang=en
  description: 联合国拉美加勒比经委会统计门户｜查询区域经济、社会与环境指标及开放数据接口；各指标覆盖、年份和口径不同，复用须核对来源与许可。
```

## 认知入口 · 企业披露：DART 韩国企业披露

- [FSS 综合检索页](https://englishdart.fss.or.kr/dsbb007/main.do)的第一方搜索索引显示企业、报告标题、日期、披露种类与市场过滤器，覆盖定期报告、重大事项、股权和外部审计等文件。
- [FSS 官方功能说明](https://englishdart.fss.or.kr/about/engAbout4.do)确认综合检索、公司检索和撤回文件检索功能。
- [韩国金融委员会说明](https://www.fsc.go.kr/eng/pr010101/81262?curPage=2&srchBeginDt=&srchCtgry=1&srchEndDt=&srchKey=&srchText=)说明英语披露平台及机器翻译改进；不应把英文检索视为所有韩文原件均已翻译。
- 本次直接抓取主页及检索页出现 502，第一方索引可读，故仅确认官方入口与功能，不声称本地完整检索成功。网页查询与 Open DART API 分开；[API 申请条款](https://engopendart.fss.or.kr/uss/umt/EgovMberInsertView.do)要求认证密钥申请，原则免费但保留部分服务收费条款。未确认披露文件统一再分发许可。

```yaml
- title: DART 韩国企业披露
  logo: finance.png
  url: https://englishdart.fss.or.kr/dsbb007/main.do
  description: 韩国金融监督院企业披露检索｜按公司、日期和报告类型查找申报文件；英文覆盖与翻译有限，重要内容核对韩文原件，API 需另申请密钥。
```

## 认知入口 · 贸易供应链：Access2Markets

- [欧盟委员会主页](https://trade.ec.europa.eu/access-to-markets/en/home)本次直接读取成功，显示 My Trade Assistant、原产地规则、贸易协定和中小企业入口。
- [欧盟官方说明](https://www.eeas.europa.eu/delegations/south-korea/access2markets_en)明确免费，并说明其整合原 Market Access Database 与 Export Helpdesk；[官方介绍材料](https://trade.ec.europa.eu/access-to-markets/en/assets/leaflet_en.pdf)确认多语言、关税、原产地规则、海关程序、服务与采购等信息。
- 侧重欧盟进出口场景，并非任意两国交易的完整通关数据库；公开主页未出现登录门槛。未执行具体商品查询、未确认所有功能无账户要求；不把查询结果视为有约束力的海关裁定，实际适用须核对目的地主管机关。未承诺全站开放许可。

```yaml
- title: Access2Markets
  logo: finance.png
  url: https://trade.ec.europa.eu/access-to-markets/en/home
  description: 欧盟免费多语言贸易查询门户｜查看关税、原产地规则与进出口程序，侧重欧盟相关贸易；按商品和目的地核对适用条件，不替代海关正式裁定。
```
