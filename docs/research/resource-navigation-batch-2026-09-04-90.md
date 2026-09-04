# 资源导航第 90 批核验

核验日期：2026-09-04。范围：职业方向、求职与职业转型、自由职业。仅公开第一方网页阅读，未注册、购买、下载或安装。

## 候选与依据

### 终身成长 · 职业方向：Prospects Job Profiles

- [官方目录](https://www.prospects.ac.uk/job-profiles/)及[行业索引](https://www.prospects.ac.uk/job-profiles/browse-sector/)可直接读取，支持行业和字母浏览；匹配测验另有注册/登录入口，不将其宣称为免账户功能。
- [软件工程师样例](https://www.prospects.ac.uk/job-profiles/software-engineer/)有职责、薪酬、资格、技能、工作经验与职业发展章节，内容以英国毕业生就业市场为背景；明确收入数字仅作参考。公开资料阅读未见付费门槛，不代表外链课程免费或岗位保证。
- 独立职业信息服务，不与既有美国、加拿大职业数据库重复。

### 终身成长 · 求职与职业转型：UC Berkeley Job Search Resources

- [官方求职资源](https://www.career.berkeley.edu/find-opportunities/jobs/)可公开读取，汇集简历、求职信、人脉、作品集和申请追踪表，适合作为求职行动入口。
- 同页明确 Handshake 面向学生及校友；[公开服务说明](https://www.career.berkeley.edu/alumni/publicly-available-services/)另行区分公众服务。不能将校内招聘、咨询与账户功能宣称向所有人免费开放；复制 Google 表格可能需相应账户，本批未操作。
- 美国大学就业语境，不承诺签证资格、录用或跨地区适用。目录已有 `undsci.berkeley.edu` 科学方法教育，但不是 Career Engagement 职业服务；该独立服务标题与域名均未收录。

### 终身成长 · 自由职业：Leapers Resources

- [项目首页](https://www.leapers.co/)说明其关注英国自由职业者工作与心理健康；[资源目录](https://www.leapers.co/resources/)可公开读取，列出淡季、社群、工作节奏、项目复盘等主题。
- 资源区注明正在重建；本批只确认目录与公开文字入口，未逐个下载电子书或测试订阅服务，不承诺全部外链或服务免费。
- 补充可持续工作方式，不是获客平台。英国背景下的合同、税务旧文章不作为现行法律结论；心理健康内容仅教育，不替代诊疗或紧急支持。

## 去重与范围

全局检查 `src/data/webstack.yml` 中 `prospects`、`leapers`、`workwellwith`、`career.berkeley`、`Career Engagement` 无匹配。`berkeley` 唯一既有项为不同团队的 Understanding Science。建议三个资源各归一个分类，不添加同一产品多条子页，不新增分类。

## 建议 YAML

```yaml
# 终身成长 · 职业方向
- title: Prospects Job Profiles
  logo: finance.png
  url: https://www.prospects.ac.uk/job-profiles/
  description: 英国职业探索目录｜按行业查看职责、技能、资格与发展路径；公开资料可直接阅读，匹配测验需账户，薪酬仅供当地市场参考。

# 终身成长 · 求职与职业转型
- title: UC Berkeley Job Search Resources
  logo: finance.png
  url: https://www.career.berkeley.edu/find-opportunities/jobs/
  description: 伯克利大学求职资源｜汇集简历、求职信、人脉与申请追踪工具；公开指南可阅读，校内招聘和咨询另有身份限制，不保证录用。

# 终身成长 · 自由职业
- title: Leapers Resources
  logo: finance.png
  url: https://www.leapers.co/resources/
  description: 自由职业工作支持指南｜了解淡季、社群与工作节奏；公开文章可阅读，资源区正在重建，以英国语境为主，不替代心理诊疗或法律建议。
```
