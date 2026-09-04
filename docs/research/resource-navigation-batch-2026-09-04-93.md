# 资源导航第 93 批核验

核验日期：2026-09-04。仅阅读官方公开网页，未注册、安装、下载数据或执行网络扫描。三类当前各 7 项；全局检索 `first.org|epss|bgp.tools|satnogs|libre.space` 无匹配，三项是独立服务，不是已收录产品的子页。

## 认知入口 · 网络安全：FIRST EPSS

- [官方入口](https://www.first.org/epss/)说明该模型估计公开 CVE 在未来 30 天被现实利用的概率，用于修复优先级，不是利用工具。
- [官方 FAQ](https://www.first.org/epss/faq)确认 CSV/API 免费且无需注册，产品或出版物使用时请求署名。它不是完整风险评分，不衡量影响或本地环境；已确认利用证据优先。训练数据与运行流水线不公开，不能标为完整开源模型。
- 不作无 CVE 漏洞全覆盖或预测准确保证；本次未调用 API。

```yaml
- title: FIRST EPSS
  logo: finance.png
  url: https://www.first.org/epss/
  description: 漏洞利用概率与修复排序参考｜免费免注册获取 CVE 的未来 30 天利用概率；不是完整风险评分，应结合资产影响及已确认利用证据，复用请署名。
```

## 认知入口 · 互联网基础设施：bgp.tools

- [官网](https://bgp.tools/)提供 ASN、IP 前缀、DNS 等搜索，公开近实时 BGP 浏览免费；网络及 IRR/RPKI 监控另有付费方案。公开首页无需登录。
- [官方自动查询说明](https://bgp.tools/kb/api)明确限制 HTML 抓取，应使用规定接口并遵守标识、缓存要求；表格导出最低约 30 分钟更新，不应更频繁获取。
- 无统一开放数据许可核验，故不写“开源/任意复用”；可见性取决于采集视角，不能把未见路由当成不存在。本次仅查文档，未执行接口、Looking Glass 或探测。

```yaml
- title: bgp.tools
  logo: finance.png
  url: https://bgp.tools/
  description: 互联网路由查询入口｜免费浏览 ASN、IP 前缀与 BGP 信息，网络监控另收费；路由可见性不等于完整网络，批量使用须遵守接口与抓取限制。
```

## 认知入口 · 航天卫星：SatNOGS DB

- [官方数据库](https://db.satnogs.org/)可公开按卫星名或 ID 查询，主页可见有数据与无数据记录。
- [官方 Wiki](https://wiki.satnogs.org/SatNOGS_DB)说明是卫星及发射机统一数据库，可导出和 API 接入；数据免费公开，许可 CC BY-SA 4.0。提交修订需登录，依赖社区来源并由管理员审核。
- 补充现有轨道/文献入口未覆盖的发射机与遥测资料。社区数据须核对原始来源和状态，不保证完整、实时；仅作为资料查询，不代表无线电发射许可。本次未下载或测试硬件。

```yaml
- title: SatNOGS DB
  logo: finance.png
  url: https://db.satnogs.org/
  description: 开放卫星与发射机数据库｜免费查询卫星标识、频率、模式和遥测资料；数据按 CC BY-SA 4.0 复用，修改需登录，社区记录须核对来源及状态。
```
