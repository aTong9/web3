# 资源导航补充研究 · Batch 134

日期：2026-09-04。低代码内建、可观测性、天文观测各 1 项；未安装、连接数据源或执行硬件操作。

## 全目录去重

已读取三个分类现有条目，对完整 `src/data/webstack.yml` 搜索 amis / baidu/amis / fex-team、Fluent Bit / fluent-bit、astroplan。只有 AMIS Market Monitor 和 FamiStudio 字符串命中，属于不同产品；三个候选无产品或 URL 重复。astroplan 是 Astropy 生态独立观测规划包，区别于现有 Astropy 通用天文数据工具。

## 开源应用 · 低代码内建

```yaml
title: amis
logo: finance.png
url: https://github.com/baidu/amis
description: JSON 驱动的前端低代码框架｜在浏览器生成后台页面、表单与数据展示；需自行接入 API 和服务端鉴权，不是完整业务后端，配置与自定义脚本须可信
```

- [官方仓库](https://github.com/baidu/amis)：Apache-2.0；README 明确只实现前端低代码，不应把另一个爱速搭产品的后端能力归给 amis。补充可嵌入前端项目的 JSON 页面渲染方式，区别于现有完整自托管平台。
- [官方发布记录](https://github.com/baidu/amis/releases)：可核对版本。浏览器前端框架非桌面安装程序；开发构建依赖 Node/npm，旧 README 运行时建议不直接作为当前安全推荐版本。
- 代码许可不要求商业平台账户，托管、API 和商业产品另有成本。前端显示权限不替代服务端鉴权；接口、表达式及脚本配置需审核，不能在浏览器配置中放服务端秘密。

## 开源应用 · 可观测性

```yaml
title: Fluent Bit
logo: finance.png
url: https://github.com/fluent/fluent-bit
description: 跨平台轻量遥测采集与转发 Agent｜处理日志、指标和追踪并发送到指定后端；不是完整查询平台，须限制采集权限、脱敏并核对输出端点、TLS 与存储费用
```

- [官方 README](https://github.com/fluent/fluent-bit)：Apache-2.0；支持 Linux、Windows、macOS、BSD 等，有 Linux 包、Docker 与 Windows 二进制入口。用途是采集、过滤、转发，与现有查询/存储平台互补。
- [官方发布记录](https://github.com/fluent/fluent-bit/releases)：版本与变更公开；具体插件、架构与平台能力应按部署版本确认，不承诺所有输入输出在各平台一致。
- 采集软件开源不代表远端日志平台、网络和存储免费。读取日志及宿主机数据按最小权限执行，避免凭据、用户标识或敏感内容流向错误端点；缓冲、重试和数据保留需独立配置验证。

## 开源应用 · 天文观测

```yaml
title: astroplan
logo: finance.png
url: https://github.com/astropy/astroplan
description: Linux、macOS、Windows 的 Python 观测规划包｜结合目标、地点与时间安排天文观测；需 Astropy 等依赖，计划不包含天气保证，核对坐标、时区与实际观测条件
```

- [官方仓库](https://github.com/astropy/astroplan)：BSD-3-Clause，Astropy 关联的独立观测规划包；不宣称内置硬件控制或自动获得观测数据。
- [官方安装说明](https://astroplan.readthedocs.io/en/latest/installation.html)：Linux、Mac OS X、Windows；通过 pip 或 conda 安装，依赖 Python、NumPy、Astropy、pytz，绘图及远程查询可需 Matplotlib/astroquery。开发文档的 Python 要求不可无条件套用所有历史版本。
- [官方发布记录](https://github.com/astropy/astroplan/releases)：有版本记录；[官方文档](https://astroplan.readthedocs.io/en/latest/)提供规划入口。开源包不要求付费账户，但远程目录或服务受其可用性和条款限制。
- 仓库明确不能规划云层等天气；预测可见性不等于实际观测成功。地点与查询内容可能敏感，使用网络查询前核对数据流；本次未采集位置、操作望远镜或执行观测。

## 边界

仅写研究记录，未改 YAML、安装、运行、注册或上传数据；来源核验不等于本机兼容性、安全审计和生产部署验证。
