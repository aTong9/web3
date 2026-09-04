# 资源导航第 102 批核验

核验日期：2026-09-04。范围：日语、韩语、法语学习各补充一个独立资源；不新增分类，不安装、注册或下载软件。

## 去重与归类

读取 `src/data/webstack.yml`，三个目标分类当前各 7 项。全局检索 `guidetojapanese`、`Tae Kim`、`korean.go.kr`、`Basic Korean Dictionary`、`francaisfacile.com`、`FrançaisFacile` 以及后者关联域名 `anglaisfacile`、`tolearnfrench`、`mesexercices`，均无命中。三个候选不是现有资源的子页补数；均为资源作者/运营方入口，其中只有韩语词典属于政府机构，不将其余两项描述为政府认证。

## 1. Tae Kim's Guide to Learning Japanese

- 分类：语言学习 · 日语学习与证书。
- [作者主页](https://guidetojapanese.org/learn/)明确免费在线学习，提供 Complete Guide 与 Grammar Guide；前者仍未完成，后者用于辅助理解语法。
- [语法指南](https://guidetojapanese.org/learn/grammar)可直接读取，无需账户；本次未核验主页链接的移动应用，不在卡片承诺应用可用。
- 英文讲解为主，适合作为教材补充，不是 JLPT 官方课程或认证。主页的 CC BY-SA 3.0 声明只明确指向 KanjiVG 字形图，不能扩张为整站统一许可；不标为开源工具。

```yaml
- title: Tae Kim's Guide to Learning Japanese
  logo: finance.png
  url: https://guidetojapanese.org/learn/
  description: 免费日语语法与自学指南｜以英文讲解文字、词汇和句法，无需账户阅读；综合指南仍未完成，适合作为课程补充而非考试认证。
```

## 2. Korean-English Learners' Dictionary

- 分类：语言学习 · 韩语学习与证书。
- [国立国语院词典](https://krdict.korean.go.kr/eng/mainAction)显示政府网站标识，提供韩英词汇入口及中文等语言切换；公开页面无需登录。
- [官方帮助](https://krdict.korean.go.kr/eng/help/helpList)说明学习等级、例句、主题/情境分类及多媒体辅助。它是学习词典，不是系统课程或 TOPIK 认证。
- [版权政策](https://krdict.korean.go.kr/eng/kboardPolicy/copyRightTermsInfo)规定文本署名、相同方式共享；图片、声音、视频等的商用和改编权限可能不同，须逐项查看。未申请 API、未批量抓取或播放验证全部音频。

```yaml
- title: Korean-English Learners' Dictionary
  logo: finance.png
  url: https://krdict.korean.go.kr/eng/mainAction
  description: 韩国国立国语院学习词典｜免费查询分级词汇、例句并切换中文等语言；文本复用需署名并相同方式共享，音视频权限另行核对。
```

## 3. FrançaisFacile

- 分类：语言学习 · 法语学习与证书。
- [运营方主页](https://www.francaisfacile.com/)提供免费课程、语法、词汇、音频及分级练习入口，包含用户贡献练习；不是 DELF/DALF 官方认证。
- [会员说明](https://www.francaisfacile.com/correspondants/why.php)说明免费账户可保存成绩、学习进度和参与论坛，部分功能需要完整免费账户。本次未注册、未提交测验。
- 无依据将免费访问等同开源或无限制复制，保持为网站学习资源，不标开放许可。

```yaml
- title: FrançaisFacile
  logo: finance.png
  url: https://www.francaisfacile.com/
  description: 免费法语课程与互动练习｜涵盖语法、词汇和听力，保存成绩与社区功能需免费账户；包含用户贡献内容，站内测试不等同正式证书。
```

## 验证边界

本记录核对第一方网页内容与全局名称/域名去重；未验证移动布局、登录后功能、全部音频播放或考试报名。本代理未修改目录 YAML，落地及构建验证由主代理完成。
