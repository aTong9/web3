# 资源导航第 94 批核验

核验日期：2026-09-04。仅补充官方查询入口，不注册、不下载安装、不宣称检索结果构成法律或科研结论。

## 去重与归类

已全文检索 `src/data/webstack.yml` 的 KIPRIS / kipris.or.kr / Korea Intellectual、OpenAIRE / openaire.eu、ERIC / eric.ed.gov / Education Resources Information 别名。无相同产品；ERIC 子串命中 American、Generic 等无关项目。三个目标分类目前各 7 项。以下是独立平台，不是已有产品子页。

## 专利创新：KIPRIS

- [韩国知识产权部门官方公告](https://kipo.go.kr/ko/kpoBultnDetail.do?aprchId=BUT0000029&menuCd=SCD0200618&ntatcSeq=20962&sysCd=)明确说明 KIPRIS 是公众免费检索、阅览国内外知识产权信息的公共服务；[官方英文首页](https://www.kipo.go.kr/en/MainApp.do)将详细检索指向 KIPRIS。
- [官方 FAQ](https://www.kipo.go.kr/kcall/faqRead.do?curMenuCd=SCD0300081&pgmId=PGM0000014&pgmSeq=106)提醒检索信息不决定最终可注册性，最终由审查决定。
- [入口](https://kipris.or.kr/)返回页面但抓取正文为空：确认入口及官方背书，未完成交互检索；账户增强功能未验证，不承诺所有功能免登录。免费检索不是无限制再分发许可，批量复用须另核对条款。

```yaml
- title: KIPRIS
  logo: finance.png
  url: https://kipris.or.kr/
  description: 韩国官方知识产权检索｜免费查询国内外专利等公开记录；检索结果不等于可获授权结论，法律状态与数据复用条件须另行核对。
```

## 科研证据：OpenAIRE EXPLORE

- [官方入口](https://explore.openaire.eu/)提供论文、数据、软件、项目和机构关联发现，并主动说明覆盖、消歧和语义质量仍在改进。
- [官方服务手册](https://catalogue.openaire.eu/ebooks/OpenAIRE_EXPLORE_Ebook.pdf)第 14 页（零基）说明检索导航免费；API 有日限额，定制国家门户另收费。主页无账户即可读取；未测试提交、认领等写入功能，不将免费检索扩展成所有功能无需账户。
- [官方权限字段规范](https://guidelines.openaire.eu/en/latest/data/field_rights.html)区分访问权限和许可；被索引不表示全文开放或统一许可。未下载安装论文，科研质量需回到原始研究核对。

```yaml
- title: OpenAIRE EXPLORE
  logo: finance.png
  url: https://explore.openaire.eu/
  description: 免费跨学科科研发现平台｜关联论文、数据、软件、项目与机构；索引不保证全文开放或研究可靠，复用须核对原始来源许可。
```

## 就业教育：ERIC

- [官方历程资料](https://eric.ed.gov/pdf/ERIC_Through_the_Decades.pdf)说明任何联网用户可免费使用 ERIC、主题词表和服务资源，全文 PDF 在获许可时提供。
- [官方产品指南](https://eric.ed.gov/pdf/ERIC_Product_Guide.pdf)确认教育研究索引用途及免费帮助材料；[官方索引页面](https://eric.ed.gov/?q=databases)可检索到同行评审和站内全文筛选项。教育研究检索与现有就业统计、教育指标工具用途不同。
- 本次首页及另一检索 URL 抓取超时，官方搜索索引与官方 PDF 可提供依据；不声称已验证交互搜索或全部全文可下载。未注册账户；公开检索证据不覆盖高级账户功能。全文版权因作品而异，不作统一开放许可声明。

```yaml
- title: ERIC
  logo: finance.png
  url: https://eric.ed.gov/
  description: 美国教育研究文献索引｜免费检索教育论文与报告，可筛选同行评审及站内全文；部分仅有摘要，全文获取与复用取决于来源和版权。
```
