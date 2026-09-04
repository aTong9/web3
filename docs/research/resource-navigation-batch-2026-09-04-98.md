# 资源导航扩充核验：第 98 批

核验日期：2026-09-04。仅访问第一方资料；未注册、下载、安装、捐赠或修改目录 YAML。

## 去重与选择

全局检索 `src/data/webstack.yml` 的 OurAirports/ourairports/davidmegginson、GiveWell/givewell/Clear Fund、Full Fact/fullfact，均无匹配。三项分别为机场开放数据、公益项目效果研究、英国事实核查的独立产品，不是既有资源子页面。OurAirports 为社区维护项目，不是航空监管机关；GiveWell、Full Fact 是非营利机构，不是官方监管认证。

## 航空航运：OurAirports

- [项目介绍](https://ourairports.com/about.html)说明这是免费全球机场探索与社区资料维护网站。
- [官方数据入口](https://ourairports.com/data/)无需登录即可读取，列出机场、跑道、频率及导航设施 CSV；数据为 Public Domain，不要求署名，但不保证准确性及适用性。官方链接指向 `davidmegginson/ourairports-data`，本次未下载文件。
- 适合机场资料检索与数据分析，不是实时航班跟踪，也不能替代权威飞行资料；免费开放数据不等于适用于实际导航。

```yaml
- title: OurAirports
  logo: finance.png
  url: https://ourairports.com/data/
  description: 全球机场开放数据｜免费获取机场、跑道、频率和导航设施 CSV，数据属公有领域；社区资料不保证准确性，不可替代权威飞行导航资料。
```

## 公益透明：GiveWell

- [官网](https://www.givewell.org/)提供项目研究、理事会议与错误记录；[机构说明](https://www.givewell.org/about)明确研究免费公开，当前内容直接读取未见登录要求。
- [FAQ](https://www.givewell.org/about/FAQ)说明重点为国际援助、尤其全球健康，深度研究少量项目；不是审查所有慈善机构合法性或涵盖所有公益领域的登记册。
- 官网页脚标明 CC BY-NC-SA 3.0 US：署名、非商业、相同方式共享。项目效果估算含方法和判断，不是效果保证，也不构成对用户的捐赠建议。本次未进行任何捐赠。

```yaml
- title: GiveWell
  logo: finance.png
  url: https://www.givewell.org/
  description: 公益项目效果研究｜免费阅读国际援助与全球健康项目的证据、成本效果分析和资助记录；覆盖有限，并非机构合法性认证，复用须遵守非商业共享许可。
```

## 事实核验：Full Fact

- [机构介绍](https://fullfact.org/about/)说明核验公共人物、媒体及网络流传说法，提供原始来源和更正；重点为英国公共讨论，同时涉及网络错误信息。页面明确核查文章免费阅读，公开页面未要求登录；邮件订阅另需邮箱，未订阅。
- [资金披露](https://fullfact.org/about/funding/)提供资助来源及编辑独立性说明，用户仍应逐条审阅证据。
- [版权与条款](https://fullfact.org/terms-and-conditions/)为保留所有权利，授权应联系机构；免费阅读不等于可自由转载。条款不保证发表信息绝对准确，核验时须关注日期、原始来源和后续更正。

```yaml
- title: Full Fact
  logo: finance.png
  url: https://fullfact.org/about/
  description: 英国事实核查机构｜免费阅读公共言论与网络说法核验，查看证据、方法和资金披露；注意日期及后续更正，转载需核对版权授权。
```
