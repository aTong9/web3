# 资源导航第 82 批核验

核验日期：2026-09-04。范围：终身成长中的数据统计素养、数学思维、经济常识各补充一个独立入口；仅研究，不安装、下载或注册。

## 去重与取舍

已全局检索 `src/data/webstack.yml` 中标题、域名及别名：`onlinestatbook`、`Online Statistics Education`、`3Blue1Brown`、`3b1b`、`Sanderson`、`rba.gov`、`Reserve Bank of Australia`、`澳大利亚储备`，均无已有条目。不是现有资源的子页面重复收录。

淘汰 Econ Lowdown：其首页现重定向到 Federal Reserve Education，与目录已有联储教育入口重复，不新增。

## 数据统计素养：Online Statistics Education

- [官方首页](https://onlinestatbook.com/)说明由 Rice University、University of Houston-Clear Lake 和 Tufts University 开发；提供入门统计教材、视频、交互演示、模拟、案例和分析实验室。
- 首页明确作品属于公有领域，允许复制，建议署名；公开列出 Web、移动版、PDF 与 ePub。页面为英文，未核对完整中文版本。
- 本次确认首页内容可读；Web 2.0 深层入口请求超时，未实际运行模拟或下载电子书，因此不承诺全部旧交互组件兼容现代浏览器。

```yaml
- title: Online Statistics Education
  logo: finance.png
  url: https://onlinestatbook.com/
  description: 免费英文统计教材｜结合案例、视频和交互模拟理解入门统计；正文属公有领域，旧版交互组件兼容性需自行确认。
```

## 数学思维：3Blue1Brown

- [官方介绍](https://www.3blue1brown.com/about/)说明以视觉讲解数学，覆盖本科 STEM 基础和趣味问题，网站提供部分视频的文字及交互版本。
- [首页](https://www.3blue1brown.com/)列出线性代数、微积分、几何、概率等主题；公开课程与支持者提前观看分开。官网主要为英文；官方介绍链接中文 Bilibili 翻译团队，不保证所有内容都有中文字幕。
- 官网无需登录即可阅读所核验介绍；未实际播放全套视频。视频网络可达性取决于所在地区，课程内容不因动画工具 Manim 开源而自动获得开源许可，转载须遵守作者要求。

```yaml
- title: 3Blue1Brown
  logo: finance.png
  url: https://www.3blue1brown.com/
  description: 可视化数学课程｜通过公开动画与图文理解线性代数、微积分和概率；英文为主，官网提供中文频道入口，提前观看等支持者权益另计。
```

## 经济常识：RBA Education

- [澳大利亚储备银行教育首页](https://www.rba.gov.au/education/)明确面向学生、教师和一般公众，提供经济知识与教育资源。
- [Explainers](https://www.rba.gov.au/education/resources/explainers/)列出通胀、货币政策、就业、增长、生产率和汇率等概念，公开网页及 PDF 链接；已核对公开网页可读，没有登录或付费墙，未下载 PDF。不能由此推断所有线下活动免费。
- 语言为英文，澳大利亚制度语境明显；页面保留版权，部分交互要求 JavaScript。仅作为经济教育，不作投资建议或其他国家政策依据。

```yaml
- title: RBA Education
  logo: finance.png
  url: https://www.rba.gov.au/education/
  description: 澳大利亚储备银行英文教育资源｜公开阅读通胀、就业、增长和货币政策解说；以澳大利亚制度为背景，仅供经济学习，不构成投资建议。
```
