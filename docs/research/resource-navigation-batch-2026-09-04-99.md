# 资源导航第 99 批：法律、召回与国际司法

核验日期：2026-09-04。仅核对第一方公开页面，不注册、不下载软件，不提供个案法律判断。

## 去重与范围

全局检索 webstack.yml 中 legifrance/Légifrance、recalls-rappels/recall-alert、icj-cij/国际法院等域名与别名，无同产品入口。既有 Health Canada Drug Product Database 是药品数据库、Transport Canada 是车辆安全入口；本批加拿大跨产品召回门户是独立检索系统，并非上述页面子页。既有 ICC 为国际刑事法院，不同于处理国家间争端的 ICJ。

## 核验

- **Légifrance**：[首页](https://www.legifrance.gouv.fr/)公开展示法国法律搜索、仅现行文本筛选和官方公报；无登录墙。[DILA](https://www.dila.gouv.fr/home/open-data-et-api)说明法律数据免费复用，API 免费但需注册；[LEGI 数据说明](https://www.data.gouv.fr/datasets/legi-codes-lois-et-reglements-consolides)列明开放许可及公报认证应在 Légifrance 核对。主要为法语；注意生效日期与历史版本。网站免费浏览不等于可忽略数据许可或获得个案法律意见。
- **Canada Recalls and Safety Alerts**：[首页](https://recalls-rappels.canada.ca/en)无账户展示消费品、车辆、健康产品召回、搜索、RSS、CSV/JSON 数据入口；[加拿大数字服务说明](https://digital.canada.ca/2022/07/05/empower-to-protect-recalls-and-safety-alerts-in-canada/)解释跨产品门户及订阅。公开浏览免费，邮件订阅需提交邮箱；适用加拿大公告范围。未实际下载数据或检查每个数据集许可，不宣称所有内容可任意复用。应逐条核对型号、批次与措施，无记录不代表安全认证。
- **International Court of Justice Cases**：[官方案件目录](https://www.icj-cij.org/list-of-all-cases)及 index.php 变体本次直接抓取均失败（403/内部错误），但搜索索引可读第一方案件表，不能宣称实时页面正常或完整下载验证。[法院 FAQ](https://www.icj-cij.org/frequently-asked-questions)说明国家间争端和咨询意见两类职能，诉讼当事方仅国家；[搜索帮助](https://api.icj-cij.org/search-instructions)说明英法文公开文书搜索及 PDF。索引未显示查询收费或账户要求，未验证实际交互；不承诺所有出版物免费，[出版物页](https://www.icj-cij.org/publications)明确部分出版物销售。保留访问限制描述，不将其当作个人申诉入口或 ICC 替代品。

## 建议 YAML

```yaml
- term: 认知入口 · 法规政策
  links:
    - title: Légifrance
      logo: finance.png
      url: https://www.legifrance.gouv.fr/
      description: 法国官方法律检索｜公开查询法规、判例与官方公报，主要为法语；须核对生效日期和版本，API 需注册，复用遵守数据许可。
- term: 认知入口 · 产品安全标准
  links:
    - title: Canada Recalls and Safety Alerts
      logo: finance.png
      url: https://recalls-rappels.canada.ca/en
      description: 加拿大官方召回与安全警报｜免费检索消费品、车辆及健康产品公告；核对型号、批次与处理措施，无记录不代表安全认证。
- term: 认知入口 · 司法与人权
  links:
    - title: International Court of Justice Cases
      logo: finance.png
      url: https://www.icj-cij.org/list-of-all-cases
      description: 国际法院案件目录｜查询国家间争端与咨询意见的英法文资料；非个人申诉入口，本次直连受限，部分出版物另行收费。
```
