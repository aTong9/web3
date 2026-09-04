# 资源导航第 139 批来源核验

核验日期：2026-09-04。范围为图书馆管理、环境水务、心理实验各一项。

## 全目录去重

检查三个现有分类，并检索完整 `src/data/webstack.yml` 中 Invenio / invenio-app-ils、FloPy / modflowpy、SweetPea / sweetpea-py 等产品、别名与 URL。FloPy、SweetPea 无命中；已有 InvenioRDM，但官网将 InvenioILS 明确列为独立产品，前者研究数据管理、后者馆藏与借阅工作流，并非重复站点或翻译页面。

## 开源应用 · 图书馆管理

```yaml
title: InvenioILS
logo: finance.png
url: https://github.com/inveniosoftware/invenio-app-ils
description: 可扩展自托管图书馆系统，管理结构化书目、借阅与馆际互借｜Python/Flask 与 React，MIT 开源；需部署数据库和搜索服务并保护读者记录
```

- [官方产品页](https://invenio-software.org/products/ils/)：支持 JSON Schema 书目模型、可配置流通、采购、馆际互借与 REST API；补充可定制研究机构图书馆工作流，不是 InvenioRDM 的另一条入口。
- [官方仓库](https://github.com/inveniosoftware/invenio-app-ils)提供 MIT 源码、Docker 配置和安装文件。形态为需要技术人员维护的 Web 服务，不是单文件桌面安装器。
- 产品页列出 Python/Flask、React、OpenSearch、PostgreSQL 或 MySQL。服务器、迁移、运维和外部支持不因核心许可免费而自动免费；馆员与读者权限、借阅历史、备份及公开检索字段需分别管理。
- 仓库 README 明示文档仍在开发；其 CERN 文档链接本轮返回 403，因此未据此声称一键部署可用或安装经过验证。官方产品页与仓库可读，不需要注册。

## 开源应用 · 环境水务

```yaml
title: FloPy
logo: finance.png
url: https://github.com/modflowpy/flopy
description: Python 地下水建模工具，为 MODFLOW 模型创建输入并整理计算结果｜CC0 开源，实际求解需另备模型程序；数据与参数须校准，不能替代水务专业审查
```

- [官方仓库](https://github.com/modflowpy/flopy)：覆盖 MODFLOW 多个版本及相关模型，提供模型创建、运行接口与结果处理，补充地下水方向而非重复雨洪或供水管网入口。
- 安装支持 pip/conda；Python 依赖与求解程序应分别准备。开发分支和稳定包可能不同，不在卡片硬编码 Python 最低版本或宣称所有系统组合支持。
- [许可证原文](https://raw.githubusercontent.com/modflowpy/flopy/develop/LICENSE.md)：美国公共领域来源，并使用 CC0 1.0 全球权利放弃，除另有说明部分；不可误写为 MIT/BSD。模型可执行程序、数据及额外依赖另核条件。
- 源码免费不包含外部算力；本地运行可避免必需云上传，但若使用外部 Notebook 或共享集群需控制地点、水井与模型资料权限。专业模型必须检查边界、校准及不确定性，不提供饮水安全、取水许可或工程合规结论。
- README 提供版本变更文档与模型校验说明，未据开发分支版本号宣称已发布稳定版本；本轮没有运行模拟。

## 开源应用 · 心理实验

```yaml
title: SweetPea
logo: finance.png
url: https://github.com/sweetpea-org/sweetpea-py
description: Python 实验设计工具，按因素、水平与约束生成随机试次序列｜MIT 开源；复杂设计的均匀抽样有局限，不负责刺激呈现、受试者招募或心理诊断
```

- [官方仓库](https://github.com/sweetpea-org/sweetpea-py)明确 MIT，主要功能是因子实验规格与试次合成；[官方文档](https://sweetpea-org.github.io/)介绍声明式因素及序列约束。补充实验设计前置环节，而不是重复 PsychoPy/jsPsych 的实验播放。
- Python 包支持 PyPI 或源码安装，无必需云账号。[安装页](https://sweetpea-org.github.io/guide/installation.html)仍提及旧 Python 3.7.9，而当前仓库要求 Python 3.9+；采用仓库为准，卡片只写 Python，实际使用再核目标版本。
- README 明确复杂/大规模设计不能普遍保证均匀样本，部分采样方式只在实践上近似均匀；不能描述成保证无偏或自动有效的实验设计。所用外部求解组件适用各自许可与平台条件。
- 不需要真实受试者资料即可生成试次；接入实际研究仍需伦理、知情同意、隐私与实验计时验证。源码免费不覆盖研究托管或受试者成本。本轮未设计针对个人的诊断或处理任何参与者数据。
- [官方组织页](https://github.com/sweetpea-org)可见 2026 年项目更新，作为维护信号而非服务保证。正确仓库为 `sweetpea-py`，不是不可访问的猜测地址 `sweetpea`。

## 边界

仅新增研究文档，不修改 YAML、不安装、不运行服务、不操作设备、不接触真实读者或受试者数据；来源核验不等于运行测试、安全审计或专业认证。
