# 资源导航第 85 批核验

核验日期：2026-09-04。范围：终身成长中的缝纫纺织、木工制作、自行车维护，各补一个独立出版者或制造商入口。未注册、购买、安装或下载文件；PDF 仅由网页工具解析。本文不表示实际完成机械操作或视频播放测试。

## 去重

读取 `src/data/webstack.yml`，三个目标分类目前各 7 项。全局检索 `singer|svpworldwide|pfaff|husqvarna|thewoodwhisperer|woodtalkonline|twwstore|shimano` 无匹配，候选不是已收录产品的另一子页。SINGER 的品牌家族及 The Wood Whisperer 的商店、论坛、Guild 均仅算一个来源，不额外拆项。

## 1. SINGER Sewing & Embroidery Guides

- 分类：终身成长 · 缝纫纺织。
- [官方指南索引](https://www.singer.com/blogs/sewing-embroidery-guides)公开列出穿线、梭芯、暗缝、拉链、包边与刺绣等教程，直接读取无需账户；机器、耗材是另行销售的商品，不代表教程对应硬件免费。
- [官方故障排查](https://www.singer.com/blogs/sewing-embroidery-guides/troubleshooting-tips)可直接读取正文，说明针型与面料应匹配、不要拉推布料，并要求参照机器手册核对张力。不同机型的梭芯、压脚与操作不能直接混用。
- 边界：北美站存在购物地区限制；仅作为学习入口，不承诺国内购买或售后。操作遵守对应机型说明书及防护要求，教程不是维修资质。

```yaml
- title: SINGER Sewing & Embroidery Guides
  logo: finance.png
  url: https://www.singer.com/blogs/sewing-embroidery-guides
  description: 官方缝纫与刺绣图文指南｜公开学习穿线、梭芯、包边和常见故障排查；设备耗材另购，针型、压脚及操作须核对具体机型手册。
```

## 2. The Wood Whisperer

- 分类：终身成长 · 木工制作。
- [官方视频索引](https://thewoodwhisperer.com/videos/)提供家具、夹具、工具及表面处理项目；[FAQ](https://thewoodwhisperer.com/faq/)明确免费内容由赞助、广告及观众支持维持，Guild 深入课程另购或订阅。目录可访问，未测试视频播放。
- [安全专题](https://thewoodwhisperer.com/category/the-shop/safety/)包含防护、推棍、疲劳和铣削风险；[免责声明](https://thewoodwhisperer.com/disclaimer/)为额外核对入口。
- 边界：这是创作者原创教程，不是工具厂商手册或安全认证；设备型号不同应采用相应厂家规范，实际切削需防护及指导。页面存在联盟链接，不把商业推荐视为独立产品认证。

```yaml
- title: The Wood Whisperer
  logo: finance.png
  url: https://thewoodwhisperer.com/videos/
  description: 木工项目与技法视频库｜免费内容涵盖家具、夹具和表面处理，Guild 课程另收费；工具操作须遵守厂家规范与防护要求，不能替代现场指导。
```

## 3. SHIMANO Manuals & Technical Documents

- 分类：终身成长 · 自行车维护。
- [官方手册索引](https://si.shimano.com/en/manual)的官方搜索索引列有 Dealer's Manual 与 Service Instructions；直接文本提取仅返回动态页面壳，未宣称验证其交互检索。
- [官方 M8050 经销商手册](https://si.shimano.com/en/pdfs/dm/M8050/DM-M8050-08-ENG.pdf)可无账户解析，共 98 页。第 4 页明确手册主要面向专业自行车技师，未经培训者不应据此自行安装，不清楚之处应联系经销商；并确认官方手册可在线查看。
- 边界：按实际部件型号和对应文档版本使用，不以抽样 M8050 手册覆盖其他部件。通用 GN0001 手册尝试被网页工具以文件过大拒绝，未下载；不影响已核验的小型手册依据。资料公开可读，零件与维修服务不是免费承诺。

```yaml
- title: SHIMANO Manuals & Technical Documents
  logo: finance.png
  url: https://si.shimano.com/en/manual
  description: 禧玛诺官方技术文档入口｜按部件型号核对用户与经销商手册；资料公开阅读，经销商安装说明面向专业技师，未经培训不要据此自行装配。
```
