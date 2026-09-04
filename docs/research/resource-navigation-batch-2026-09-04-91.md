# 资源导航第 91 批核验

核验日期：2026-09-04。范围：志愿服务、旅行规划、环境行动。仅阅读公开第一方网页；未注册、报名、购买、下载或安装。

## 候选与依据

### 终身成长 · 志愿服务：GoVolunteer

- [Volunteering Australia 官方介绍](https://www.volunteeringaustralia.org/get-involved/govolunteer/)确认 GoVolunteer 为其发起的澳大利亚全国志愿机会数据库，信息由志愿组织与服务中心发布。
- [入口](https://govolunteer.com.au/)可公开浏览，按地点、议题、类型筛选，并有线上/远程入口；不代表所有远程岗位均接受境外人员。岗位资格与时间要求须逐条查看，本批未申请，不承诺录取或签证资格。
- [官方参与指南](https://govolunteer.com.au/about-volunteering/volunteering-guidelines)要求确认组织真实性、保险和职责，并讨论费用报销。公开浏览未见收费门槛，不将交通、培训等实际参与成本宣称全免。

### 终身成长 · 旅行规划：TripIt

- [官网](https://www.tripit.com/web)与[使用说明](https://www.tripit.com/web/free/how-it-works)说明，用户自行预订后转发确认邮件，由服务整理行程并同步日历或分享；有免费注册入口，使用行程功能需账户。
- [Pro 页面](https://www.tripit.com/web/pro)将实时航班提醒等列入付费服务。本批不固定价格，避免促销及地区价格变化；不将其作为开源工具收录。
- 适合整理跨平台预订而非政府旅行警示替代品。转发邮件涉及向第三方提供预订与行程信息，使用前需考虑隐私；未测试邮件解析成功率、各地区应用商店可用性或订票。

### 终身成长 · 环境行动：Plastic Free July

- [官方首页](https://www.plasticfreejuly.org/)提供家庭、工作、学校与社区减少一次性塑料的行动建议，是澳大利亚注册慈善组织推动的全球活动。
- [FAQ](https://www.plasticfreejuly.org/faqs/)明确任何人可免费参加挑战，政府与企业合作另有付费方案；宣传材料仅限非商业使用并须遵守品牌规则。不是必须一次性完全去塑的比赛，可自行选择目标和持续时间。
- 内容可公开阅读；未提交挑战表单或下载材料。FAQ 说明不同包装处理受本地废物设施影响，因此不把所有可降解材料描述为可随意丢弃或通用回收。

## 去重与范围

全局检查 `src/data/webstack.yml` 中 `govolunteer`、`volunteering australia`、`tripit`、`plastic free`、`plasticfree`、`无塑` 均无匹配。三个独立服务各归一类，不增设分类，不以已有产品子页凑数；旅行候选 Seat61 和 Wikivoyage 因已存在而排除。

## 建议 YAML

```yaml
# 终身成长 · 志愿服务
- title: GoVolunteer
  logo: finance.png
  url: https://govolunteer.com.au/
  description: 澳大利亚志愿机会目录｜按地区、议题及线上方式浏览；申请须核对岗位资格、职责、保险与费用安排，不保证接受境外参与者。

# 终身成长 · 旅行规划
- title: TripIt
  logo: finance.png
  url: https://www.tripit.com/web
  description: 预订邮件转行程工具｜需账户，基础版免费，实时航班提醒等属付费 Pro；转发邮件涉及第三方处理预订信息，出行仍需核对承运方通知。

# 终身成长 · 环境行动
- title: Plastic Free July
  logo: finance.png
  url: https://www.plasticfreejuly.org/
  description: 全球减塑行动指南｜家庭、学校与社区可免费参与，自选目标与期限；宣传材料限非商业使用，包装处理须核对本地回收条件。
```
