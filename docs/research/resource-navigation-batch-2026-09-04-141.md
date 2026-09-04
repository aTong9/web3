# 资源导航第 141 批来源核验

核验日期：2026-09-04。范围为教育平台、会议活动、表单调查各一项。

## 去重与互补

已阅读三个当前分类，对完整 `src/data/webstack.yml` 检索 nbgrader / jupyter/nbgrader、Rallly / lukevella / rallly.co、Nextcloud Forms / nextcloud/forms 等产品及 URL，未命中。Nextcloud 已有 Talk、News、Calendar 等独立应用，不含 Forms，功能并不重复。Kolibri 与 Moodle 已在其他分类收录，因此排除。

## 开源应用 · 教育平台

```yaml
title: nbgrader
logo: finance.png
url: https://github.com/jupyter/nbgrader
description: Jupyter 作业分发与评分系统，生成学生版 Notebook 并支持自动与人工评分｜Python/Jupyter，BSD-3-Clause；执行学生代码需隔离，成绩与身份数据须限权
```

- [官方仓库](https://github.com/jupyter/nbgrader)明确 BSD-3-Clause，包含教师界面、学生作业列表和 CLI，可生成、发布、收集和批改 Notebook。与完整 LMS 互补，专注编程与计算课程作业，不是另一套通用校务管理。
- [安装文档](https://nbgrader.readthedocs.io/en/stable/user_guide/installation.html)给出 pip/conda 路径，以及 JupyterLab 客户端与服务器扩展；需匹配 Python/Jupyter 环境，不是独立桌面程序。当前稳定文档显示 0.9.5，不据此承诺所有旧插件兼容。
- 核心开源无需服务订阅，但教学服务器、算力或第三方托管另计。自动评分会执行提交代码，应使用受控隔离环境，不将批改进程视为安全沙箱；成绩、学生标识、答案和反馈应限制访问并备份。
- 自动测试结果不等于学习能力的完整评价，保留人工复核。本轮不下载或执行学生作业，不访问真实学习者资料。

## 开源应用 · 会议活动

```yaml
title: Rallly
logo: finance.png
url: https://github.com/lukevella/rallly
description: 会议时间投票工具，汇总参与者可用时段以确定活动日期｜Docker 自托管，AGPL-3.0-or-later；官方多人管理与协作空间有付费许可方案
```

- [官方 README](https://raw.githubusercontent.com/lukevella/rallly/main/README.md)介绍时间选项投票、可用性网格、评论与最终日期通知；访客可免账号投票。明确 AGPLv3 或后续版本，[仓库 LICENSE](https://raw.githubusercontent.com/lukevella/rallly/main/LICENSE)可直接核查。
- [官方自托管文档](https://support.rallly.co/self-hosting/introduction)提供 Docker Compose 部署，包含应用、数据库、对象存储与 TLS 代理；自托管与云端配置不完全相同。与征稿、票务系统互补，聚焦活动日期协商。
- [官方商业授权说明](https://support.rallly.co/self-hosting/licensing)将个人单用户与多人实例/协作空间分层，申请付费授权；访客投票不计注册用户。页面同时说明用户限制采用诚信提醒方式。应区分仓库 AGPL 代码许可与官方发行/服务方案，不写成所有多人功能无限免费，也不提供绕过授权指引。
- 授权激活需访问官方许可服务器，邮件通知也有外部服务数据流；自托管不等于完全离线。姓名、可用时段、评论和分享链接可能透露参与者行程，应限制分享范围并配置保留期限。
- 本轮未注册、投票、邀请参与者或购买许可；价格和具体版本授权范围以官网实际方案为准，卡片不硬编码金额。

## 开源应用 · 表单调查

```yaml
title: Nextcloud Forms
logo: finance.png
url: https://github.com/nextcloud/forms
description: Nextcloud 内的简易表单与问卷应用，支持分享、结果图表和 CSV 导出｜需现有 Nextcloud 实例，AGPL-3.0-only；共享与 Webhook 须核查回答数据去向
```

- [官方 README](https://raw.githubusercontent.com/nextcloud/forms/main/README.md)标注 AGPL-3.0-only，支持简易问卷、响应展示与 CSV 导出；[COPYING](https://raw.githubusercontent.com/nextcloud/forms/main/COPYING)提供许可正文。定位轻量实例内问卷，不等同于 LimeSurvey 的复杂调查能力。
- [官方应用商店](https://apps.nextcloud.com/apps/forms)提供按 Nextcloud 版本匹配的稳定与开发发行；不能因为最高版本列出某版本便认定均有稳定包。通过现有 Nextcloud 管理，不是无后端的单页网页。
- 应用源码开源；Nextcloud 托管、运维和商业支持费用独立，不代表购买某商业服务。表单与回答在所用实例保存，若使用第三方托管，实例管理员和服务方仍是需要评估的数据处理方。
- README 链接 Webhook 配置，启用后会扩展数据接收方。匿名表单名称不能替代完整匿名性审查；需检查分享权限、导出、访问日志和数据保留，避免不必要地收集学生或未成年人身份信息。

## 边界

仅目录研究与说明文件；没有修改 YAML、安装、运行实例、注册、购买服务或上传调查/学生数据。源码许可核验不等于安全审计和运行验收。
