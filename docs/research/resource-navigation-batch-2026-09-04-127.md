# 资源导航补充研究 · Batch 127

核验日期：2026-09-04。仅研究 3 项，无 YAML 修改、安装、注册或部署。

## 去重和分类理由

已读三个目标分类；全库检索 inkle/ink、Inky、inkjs、gohugoio、gohugo.io、Hugo 标题、opensourcepos、OSPOS、Open Source Point of Sale 无匹配。Hugo 仅在既有 cState 描述中作为依赖出现，不是独立资源。Ren'Py 已收录，未重复加入。三项分别补独立叙事脚本、静态发布、门店销售登记。

## 开源应用 · 游戏互动

```yaml
- title: ink
  logo: finance.png
  url: https://github.com/inkle/ink
  description: MIT 开源互动叙事语言｜通过命令行编译器或 Inky 编辑器编写与预览分支故事，可集成游戏或导出网页；发布前测试分支、存档兼容及素材授权。
```

- [官方仓库](https://github.com/inkle/ink)：MIT，C# 叙事引擎与编译器；可用于文字游戏和图形游戏中的分支故事。与视觉小说引擎不同，重点是可嵌入的叙事逻辑。
- README 区分核心 ink、桌面编辑器 Inky、命令行 inklecate、Unity 集成及社区 inkjs；不可把所有模块版本视为相同。命令行示例覆盖 Windows/macOS/Linux，网页导出通过 Inky 配套流程。
- [发行页](https://github.com/inkle/ink/releases)可读，提供版本记录。引擎许可不覆盖故事版权、素材或外部游戏引擎授权；本地编写无需注册托管服务，未安装或发布故事。

## 开源应用 · 内容建站

```yaml
- title: Hugo
  logo: finance.png
  url: https://github.com/gohugoio/hugo
  description: Apache-2.0 静态网站生成器｜在本地构建博客、文档和多语言站点，再发布静态文件；审查主题与构建依赖，避免将草稿、凭据和私密资料打包公开。
```

- [官方仓库](https://github.com/gohugoio/hugo)：Go 编写、Apache-2.0，静态页面生成、模板、分类与多语言；不要求线上常驻 CMS 数据库。
- [安装文档](https://gohugo.io/installation/)和[发行页](https://github.com/gohugoio/hugo/releases)提供平台与版本入口。构建在本地进行，发布到独立主机或 Git 构建流程；内置预览服务不等于正式托管。
- 主题、外部模块、资源处理可能引入网络或构建依赖，应先审查。域名、托管与外部表单/搜索等服务可能收费；不声称静态站天然私密或没有脚本风险。

## 开源应用 · 电商零售

```yaml
- title: Open Source Point of Sale
  logo: finance.png
  url: https://github.com/opensourcepos/opensourcepos
  description: PHP 自托管门店销售系统｜管理库存、销售登记、客户、报价与收据；许可要求保留可见页脚署名，上线前修改默认凭据、配置 HTTPS 并复核当地票据规则。
```

- [官方仓库](https://github.com/opensourcepos/opensourcepos)：OSPOS，PHP/CodeIgniter 与 MySQL/MariaDB；库存、销售、客户、权限和收据。补线下门店登记，非再加无头电商框架。
- 许可是 MIT 条件附加可见页脚署名要求，**不是标准 MIT 无附加条款**。每页的项目版本、署名和链接须保留，不能随意移除；卡片已显式揭示。
- [安装说明](https://github.com/opensourcepos/opensourcepos/blob/master/INSTALL.md)：PHP/数据库/Web 服务或容器部署。文档明确示例容器设置不能直接作为生产配置，须修改默认密码；生产必须配置允许的主机名，并配置 HTTPS 与持久数据备份。
- [发行页](https://github.com/opensourcepos/opensourcepos/releases)可读；应选正式构建而非直接运行未构建仓库或开发分支。未测试扫码枪、打印机、支付接口或税务合规。开源可用不代表云托管、硬件和支付服务免费。

## 限制

研究依据为第一方仓库、安装资料和发行记录，不等于安装、安全审计或业务合规验证；风险提示是使用建议，不能理解为默认安全保证。
