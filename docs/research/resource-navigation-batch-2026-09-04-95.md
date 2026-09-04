# 资源导航第 95 批核验

核验日期：2026-09-04。仅新增导航候选，未注册、下载、安装或调用受限 API。

## 全局去重与分类

检索 `src/data/webstack.yml` 的 EIA / eia.gov / 美国能源信息、Global Volcanism / volcano.si.edu、IPC / ipcinfo 别名与域名，三项均未收录。已有 Smithsonian Open Access、Learning Lab、Folklife、Collections，但 GVP 是独立的全球火山与喷发数据库，而非既有馆藏产品的子页。EM-DAT 与 DesInventar 已收录，因此排除。

## 气候能源：EIA Open Data

- [官方入口](https://www.eia.gov/opendata/)列出美国电力、油气、煤炭、排放与国际能源时间序列，提供浏览器、批量文件和 API；明确数据免费。
- [API 文档](https://www.eia.gov/opendata/documentation.php)明确 API 调用需注册免费密钥并通过邮件接收；不能把公开网页浏览等同于匿名 API 使用。
- [复用规则](https://www.eia.gov/about/copyrights_reuse.php)：政府数据可使用与分发，应注明 EIA 及发布日期；第三方素材、照片与标志另有限制。
- 适用：能源结构及历史统计查询。不同序列的覆盖、频率和单位不同，预测值不等于实测值。本次未测试密钥调用或下载。

```yaml
- title: EIA Open Data
  logo: finance.png
  url: https://www.eia.gov/opendata/
  description: 美国能源信息署开放数据｜免费查询能源生产、消费、价格与国际统计；API 需申请免费密钥，复用须注明来源，并核对序列单位、频率及预测口径。
```

## 灾害应急：Global Volcanism Program

- [Smithsonian 官方入口](https://volcano.si.edu/)提供全球火山、喷发检索及日/周/月尺度报告；公开页面可免登录阅读，未见收费门槛。
- [每周活动报告](https://volcano.si.edu/reports_weekly.cfm)提供事件资料；页面与数据库采用各自更新周期，不能承诺实时完整覆盖。
- [GVP 使用条款](https://volcano.si.edu/gvp_termsofuse.cfm)要求引用来源，数据库与图像的权利状态不同；照片可能受第三方版权限制，不将全站宣称为开放许可。
- 适用：历史喷发与活动背景查证，不能替代当地火山监测机构的预警、避险和疏散指令。

```yaml
- title: Global Volcanism Program
  logo: finance.png
  url: https://volcano.si.edu/
  description: Smithsonian 全球火山数据库｜公开检索火山、历史喷发和活动报告；资料有更新延迟，不替代当地预警与疏散指令，复用须核对引用及图像权利。
```

## 农业食品：IPC Analysis Portal

- [官方分析门户](https://www.ipcinfo.org/ipc-country-analysis/en/)按国家/地区、分析类型和有效期展示粮食不安全与急性营养不良分析；公开页面无需账户即可读取报告摘要。
- [官方条款](https://www.ipcinfo.org/ipcinfo-website/privacy-policy/en/)说明邮件订阅是可选项，不影响内容访问。IPC 结果采用 CC BY-NC-SA 3.0 IGO，商业用途需联系；第三方数据可能有不同许可。
- 适用：理解纳入分析地区的粮食安全分级与对应时段；不是所有国家连续实时监测，不可外推未覆盖地区。未调用 API，其另有附加条款。

```yaml
- title: IPC Analysis Portal
  logo: finance.png
  url: https://www.ipcinfo.org/ipc-country-analysis/en/
  description: 粮食安全阶段分类分析｜免费查看已分析国家和地区的粮食不安全、营养状况与有效期；非全球实时覆盖，IPC 结果按非商业署名相同方式共享许可复用。
```
