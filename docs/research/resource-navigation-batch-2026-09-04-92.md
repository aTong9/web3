# 资源导航扩充：第 92 批

核验日期：2026-09-04。范围：终身成长的独立生活、居家经营、汽车维护；仅研究，不安装、注册或执行维修操作。

## 去重与选择

全局检索 `src/data/webstack.yml` 的 Love Food Hate Waste / lovefoodhatewaste / WRAP / wrap.ngo、American Cleaning Institute / cleaninginstitute / 美国清洁、Toyota / 丰田：无命中。三个候选均为未收录的独立机构或品牌资源，不是已有产品的另一个子页；各目标分类现有 7 项。

## 1. 独立生活：Love Food Hate Waste

- [机构介绍](https://www.lovefoodhatewaste.com/our-story)说明由气候行动慈善机构 WRAP 提供；[WRAP 项目说明](https://www.wrap.ngo/resources/guide/waste-prevention-activities/love-food-hate-waste)明确覆盖计划、分量、日期标签、剩菜和储存，适合日常采购与减少浪费。
- [网站条款](https://www.lovefoodhatewaste.com/terms-and-conditions)确认运营者为英国注册慈善机构；英国背景下的标签说明不应直接套用其他地区。
- 官方索引可读；主页和介绍页直接抓取返回 520。本次没有验证计算器交互，也不承诺实时可达、全站免费或材料可自由再发布。收录公开指南，不宣称开源软件。

```yaml
- title: Love Food Hate Waste
  logo: finance.png
  url: https://www.lovefoodhatewaste.com/
  description: WRAP 家庭减废指南｜学习餐食计划、分量、剩菜利用与储存；英国背景的日期标签说明须结合当地规定和食品包装使用。
```

## 2. 居家经营：American Cleaning Institute

- [官方主页](https://www.cleaninginstitute.org/)的第一方索引列出逐房间清洁清单和污渍去除指南；其清洁产品行业机构身份应保留，不能称政府监管或独立消费检测机构。
- [清洁产品安全](https://www.cleaninginstitute.org/understanding-products/ingredients/cleaning-product-safety)要求阅读安全标签、不要混合清洁产品；[洗衣安全](https://www.cleaninginstitute.org/cleaning-tips/clothes/laundry-safety-tips)进一步说明某些混合物可能释放刺激性气体。
- 官方搜索索引可读，安全页直接抓取 403，cleaning-tips 路径被抓取器拒绝；因此链接使用官方根入口，不声称完成全站交互验证。公开信息未见付费门槛，不推断全站无收费。适用美国产品背景，具体材质和产品依标签核对。

```yaml
- title: American Cleaning Institute
  logo: finance.png
  url: https://www.cleaninginstitute.org/
  description: 美国清洁行业机构指南｜查找居家清洁清单、洗衣与去污知识；按产品标签和材质要求操作，勿混合清洁剂，资料不等于政府认证。
```

## 3. 汽车维护：Toyota Manuals & Warranties

- [美国丰田手册入口](https://www.toyota.com/owners/warranty-owners-manuals/)直接抓取成功。页面要求选择车辆，提供手册、保修说明及车型功能资料；采用跳转后的正式路径。
- 同页说明多数 1990 年之前车型的额外资料可通过 TIS 订阅获得，纸本手册另有购买渠道。不能把所有资料描述为免费；本次未登录、未选择 VIN 或下载具体手册。
- 美国站内容按年款/车型区分，不能当全球通用维修规范。高压系统或制动维修交专业人员是收录时的保守安全边界，不声称网站提供对应教程。

```yaml
- title: Toyota Manuals & Warranties
  logo: finance.png
  url: https://www.toyota.com/owners/warranty-owners-manuals/
  description: 美国丰田车主手册入口｜按车型与年款查阅使用和保修信息；部分老车型资料需订阅，其他市场须核对当地手册，高压及制动维修交专业人员。
```
