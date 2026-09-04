# 资源导航第 140 批来源核验

核验日期：2026-09-04。三个分类各一项，仅研究，不修改 YAML。

## 去重与筛选

已阅读客服支持、企业搜索、人力资源现有条目，并对完整 `src/data/webstack.yml` 检索 django-helpdesk / Jutda、Fess / codelibs、Jorani / bbalet / jorani.org 及仓库 URL，均未发现同产品。三项分别补充 Django 应用嵌入式工单、跨来源爬取搜索门户、聚焦休假和加班审批的轻量工具。
TimeOff.Management 候选虽未收录，但官方 README 仍以 Node 4 为安装要求，未进一步确认现代维护与兼容性，因此本轮不采用。

## 开源应用 · 客服支持

```yaml
title: django-helpdesk
logo: finance.png
url: https://github.com/django-helpdesk/django-helpdesk
description: 可嵌入 Django 项目的客服工单组件，也可独立部署｜Python/Django，BSD-3-Clause；需配置生产安全与邮件权限，演示服务不可直接上线
```

- [官方仓库](https://github.com/django-helpdesk/django-helpdesk)：旧名 Jutda Helpdesk，提供独立部署及既有 Django 应用集成路径，BSD-3-Clause；第三方组件另有许可文件。不是免费云端客服账号。
- 适合已有 Django 业务系统需要内嵌工单跟踪的团队，和现有独立多渠道客服产品形成部署方式互补。运行环境为 Python/Django 服务与数据库，经浏览器使用，不承诺桌面原生安装。
- README 的演示包含预设账户及 SQLite 示例，不能直接用于生产；实际部署应移除演示凭据、启用 HTTPS，限制工单正文、附件、客户资料和邮箱凭据访问，并备份数据。邮件服务与托管费用独立于开源许可。
- [官方安全政策](https://raw.githubusercontent.com/django-helpdesk/django-helpdesk/main/SECURITY.md)仅支持最新版本，明确建议及时升级补丁。文档与测试存在不等于本轮完成安全测试；未访问真实客服数据。

## 开源应用 · 企业搜索

```yaml
title: Fess
logo: finance.png
url: https://github.com/codelibs/fess
description: 自托管企业搜索门户，爬取获授权网站、文件与数据库并统一检索｜Java/OpenSearch，Apache-2.0；需限制抓取范围并验证索引后的访问权限
```

- [官方仓库](https://github.com/codelibs/fess)与[官方 README](https://raw.githubusercontent.com/codelibs/fess/master/README.md)：包含管理界面、爬取器及搜索页面，可从网站、文件系统、CSV/数据库建立索引；并非 OpenSearch 引擎的重复链接，而是面向内容采集与检索的独立应用层。
- 提供 Java 环境下的发行包及 Docker 方式；底层使用 OpenSearch，具体 Java、插件和 OpenSearch 版本须匹配目标发布。README 的版本可能滞后，不在目录写死版本号。
- [本仓库 LICENSE](https://raw.githubusercontent.com/codelibs/fess/master/LICENSE)明确 Apache-2.0。特意核验实际许可证，而不是沿用 README 徽章指向另一个 GitBucket 仓库的链接。核心源码无许可收费，但服务器、存储、付费数据源和可选外部 AI 服务另计。
- 爬取可能复制内部秘密与个人资料到索引；必须限定授权源、只读连接凭据和结果可见权限，不能假设源系统 ACL 自动等价继承。启用云或 AI 连接器时单独审查文本去向；更改默认管理凭据，不公开管理端口。本轮未爬取、索引或连接任何企业系统。

## 开源应用 · 人力资源

```yaml
title: Jorani
logo: finance.png
url: https://github.com/jorani/jorani
description: 自托管请假与加班管理工具，提供审批、余额报告和团队日历｜PHP/MySQL，当前 MIT 开源；保护员工缺勤信息，规则需按组织与所在地要求配置
```

- [官方仓库](https://github.com/jorani/jorani)由旧 `bbalet/jorani` 重定向而来；当前 README 说明 PHP 8.1+/MySQL 8+，专注小型组织的单审批人请假与加班流程，包含报表、日历及导出。没有描述成完整薪酬平台。
- [当前 LICENSE](https://raw.githubusercontent.com/jorani/jorani/master/LICENSE)为 MIT；未套用旧版本可能不同的许可。生产安装按官方要求选 Releases 而非开发分支，依赖、发行版本许可与迁移路径仍应再核。
- [官网](https://jorani.org/)确认免费获取和申请—批准/拒绝工作流；自托管仍需服务器、数据库、邮件与维护，不代表免费托管或劳动法合规保证。
- 日历、报告、邮件和导出可能暴露病假、家庭安排等敏感信息；需按角色最小化可见字段，更改默认账户、加密传输和备份，不上传真实员工资料到演示站。休假余额和加班计算是配置结果，不是法定权益结论。
- 官网部分文章年代较早，当前仓库技术要求与许可作为本轮证据；未宣称更新频率或维护服务等级。

## 完成边界

本轮没有安装、注册、上传资料、连接邮箱、爬取站点或处理员工数据。开源许可核验仅覆盖上述核心项目，不延伸担保所有可选插件和外部服务。
