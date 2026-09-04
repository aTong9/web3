# 资源导航第 106 批核验

核验日期：2026-09-04。仅整理公开第一方资料，不进行账户注册、安装、咨询或个体诊疗。

## 筛选与去重

检查 `src/data/webstack.yml` 的全部标题及 URL，未发现 Relationships Australia / relationships.org.au、Better Health Channel / betterhealth.vic.gov.au、Carers UK / carersuk.org。已有 NHS Better Health Get Active 属于英国 NHS，与澳大利亚 Better Health Channel 不同。三项分别为不同机构入口，不采用已有产品的子页面凑数。

## 终身成长 · 家庭关系

- [Relationships Australia 关系建议目录](https://www.relationships.org.au/category/relationship-advice/) 可公开阅读，列出伴侣分离、儿童与分离、婚姻和孤独等资料；核验时未要求账户或付款。
- [机构首页](https://www.relationships.org.au/) 说明面向澳大利亚个人、家庭及社区提供关系支持；[联系说明](https://www.relationships.org.au/contact/) 明确全国办公室不处理个人咨询，应联系州或领地服务。不能把公开文章等同于免费个案咨询。
- 未确认开放内容许可，仅添加链接与原创短介绍，不复制其教材。猜测路径 `/relationship-advice/` 未成功，采用已打开的真实分类路径。

```yaml
- title: Relationships Australia Advice
  logo: finance.png
  url: https://www.relationships.org.au/category/relationship-advice/
  description: 澳大利亚关系支持机构公开资料｜了解伴侣沟通、分离与儿童适应；文章无需账户，个案服务须另查当地机构，不替代专业咨询。
```

## 终身成长 · 家庭健康知识

- [Better Health Channel](https://www.betterhealth.vic.gov.au/) 由维多利亚州卫生部门管理，提供疾病、检查、健康生活与服务导航，公开可读，无账户门槛。
- [使用条款](https://www.betterhealth.vic.gov.au/about/terms-of-use) 确认免费服务、主要面向澳大利亚居民、仅为信息用途而非诊疗建议；复制及商业使用受限制，不能标为开源。站内链接不表示政府背书；不得将链接放入收费区域或附加收费机制。

```yaml
- title: Better Health Channel
  logo: finance.png
  url: https://www.betterhealth.vic.gov.au/
  description: 澳大利亚维多利亚州健康科普｜免费查阅疾病、检查与健康生活资料；服务导航以当地为主，内容不替代诊疗，转载须遵守条款。
```

## 终身成长 · 家庭照护

- [Carers UK 帮助与建议](https://www.carersuk.org/help-and-advice/) 提供照护安排、照护者自护、设备及支持目录，公开页面无需登录；会员加入免费，但不据此推断全部附属服务或工具免费。
- 页面按英国各地区区分，福利和服务不可直接套用其他国家。[使用条款](https://www.carersuk.org/terms-and-conditions/) 说明资料仅供参考，个人非商业复制需署名并保留声明，不允许任意修改，其他网站转载需书面同意。本批仅原创介绍和外链。

```yaml
- title: Carers UK Help and Advice
  logo: finance.png
  url: https://www.carersuk.org/help-and-advice/
  description: 英国家庭照护支持资料｜公开查阅照护安排、设备和照护者自护指南；福利与服务依英国地区而异，具体方案需专业评估。
```

## 核验边界

已阅读公开正文及相关第一方条款；未验证付费或会员功能，未下载手册，未把目录条目当作诊疗或福利资格结论。备选 Family Lives 原域名跳转后出现验证页，未采用。
