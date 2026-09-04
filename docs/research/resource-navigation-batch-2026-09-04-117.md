# 资源导航第 117 批核验

核验日期：2026-09-04。范围：韩国主管机构管辖查询、法国融入程序、德国咨询机构导航。

## 韩国出入境机构管辖查询 — 语言学习 · 韩国永居入籍

[韩国法务部机构目录](https://www.immigration.go.kr/immigration/2057/subview.do)公开韩语页面可直接读取，默认首尔/仁川/京畿，提供机构名称、管辖地区、地址、联系方式及其他地区切换。表内明确一些窗口不受理在留/国籍业务，因此不能把任意机构当作永居受理处。与已有 Hi Korea 办理门户和 1345 咨询不同，补充主管辖区定位。

```yaml
title: 韩国出入境机构管辖查询
logo: finance.png
url: https://www.immigration.go.kr/immigration/2057/subview.do
description: 韩国法务部韩语机构目录｜按地区核对出入境机构、管辖范围与联系方式；默认首尔周边，可切换其他地区，前往前确认窗口业务及预约要求。
```

## 法国共和融入程序 CIR — 语言学习 · 法语国家永居移民

[法国内政部官方程序页](https://www.immigration.interieur.gouv.fr/lintegration-des-etrangers/parcours-dintegration-republicaine)可直接读取，解释 CIR、公民与法语培训、OFII 面谈、适用与例外，以及相关考试入口。与已有居民卡、归化总页不同，专注融入程序。不硬编码语言门槛或培训时数；完成培训不能推导长期居留或国籍获批。阅读无需账户，实际培训/面谈依官方个案流程，本次未申请。

```yaml
title: 法国共和融入程序 CIR
logo: finance.png
url: https://www.immigration.interieur.gouv.fr/lintegration-des-etrangers/parcours-dintegration-republicaine
description: 法国内政部共和融入程序说明｜了解 OFII 面谈、法语与公民培训及适用例外；须按身份核验当前要求，完成培训不等于取得长期居留或国籍。
```

## BAMF-NAvI 移民咨询导航 — 语言学习 · 德语国家永居移民

[德国 BAMF-NAvI 咨询机构页](https://bamf-navi.bamf.de/en/Themen/Beratungsstellen/)可访问但正文抓取仅为动态壳；旧官方路径 [Migrationsberatung](https://bamf-navi.bamf.de/en/Themen/Migrationsberatung/)重定向至此。旧路径官方搜索索引显示地点/距离、成人移民咨询、青年服务及其他咨询种类，在线咨询标记当前只覆盖 MBE。采用重定向后的正式路径，未声称地图检索实际完成。

补充当地支持机构定位而非定居许可条款。网站依赖 JavaScript；具体资格、语言和预约需向机构核验，不把咨询机构视为居留审批机关。本批未提交地址或定位权限。

```yaml
title: BAMF-NAvI 移民咨询导航
logo: finance.png
url: https://bamf-navi.bamf.de/en/Themen/Beratungsstellen/
description: 德国 BAMF 官方咨询机构地图｜按地点查找成人移民咨询与青年服务等，需启用 JavaScript；语言、资格和预约向机构核验，咨询不代替居留审批。
```

## 去重与边界

全量检索 src/data/webstack.yml 的 2057/subview、BAMF/bamf-navi、parcours-dintegration/CIR/共和融入，无对应资源；Cirq、CircuitPython 等无关字符串未视作同产品。韩国同一政府域已有政策与热线，此项为具体管辖目录；法国与德国新增专门支持程序，不复制政策译文。

仅新增研究记录，不修改 YAML、不提交表单、不注册、不预约、不下载、不联系主管机关。未提供个人法律判断。BAMF 动态地图未实测，落盘与站内验证由主任务完成。
