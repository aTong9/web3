# 资源导航补充研究 · Batch 133

日期：2026-09-04。工程仿真、公共数据、社区社交各 1 项。仅公开来源核验，未安装或上传资料。

## 去重与选择

已阅读三个目标分类完整条目，并搜索完整 `src/data/webstack.yml` 的产品别名、组织与仓库 URL。SfePy / sfepy、Open Data Editor / opendataeditor / okfn、HumHub 均未出现。EnergyPlus 已在其他分类，含 NREL → NatLabRockies 迁移别名，排除；OpenRefine 已收录，排除。Open Data Editor 旧 frictionlessdata/open-data-editor 跳转至 okfn/opendataeditor，采用当前地址。

## 开源应用 · 工程仿真

```yaml
title: SfePy
logo: finance.png
url: https://github.com/sfepy/sfepy
description: Python 有限元求解库｜以脚本定义一至三维耦合偏微分方程，适合教学与自定义仿真；需科学计算依赖和外部网格，结果须验证收敛、边界条件及实际适用性
```

- [官方仓库](https://github.com/sfepy/sfepy)：BSD-3-Clause，可作为 PDE 求解器或 Python 库；依赖 NumPy/SciPy，输入问题定义与网格分开，项目不自带通用网格生成器。补充 Python 自定义弱形式工作流，而非重复通用桌面仿真套件。
- [官方 INSTALL](https://github.com/sfepy/sfepy/blob/master/INSTALL)：列 Linux、Intel Mac、Windows；源码构建涉及 C 编译器、Python、Cython，额外求解器有各自依赖。不据此承诺 Apple Silicon 原生兼容。
- [GitHub Releases](https://github.com/sfepy/sfepy/releases)为空，不能声称已验证 GitHub 稳定安装包；README 指向 [官方站点](https://sfepy.org)获取发布与文档。
- 开源库无需订阅，但计算资源与专业验证有成本。只作为数值建模工具，不提供安全关键工程认证，敏感模型不应无授权上传外部计算服务。

## 开源应用 · 公共数据

```yaml
title: Open Data Editor
logo: finance.png
url: https://github.com/okfn/opendataeditor
description: Windows、macOS、Linux 无代码表格数据检查应用｜探索数据并验证格式与质量，适合开放数据发布前整理；保留原件，检查通过不等于数据真实、完整或已获公开授权
```

- [官方仓库](https://github.com/okfn/opendataeditor)：MIT、免费开源，提供 EXE、DMG、AppImage/DEB；基于 Frictionless，但为面向非编程用户的桌面界面，不是已有 frictionless-py URL 重复。
- [官方文档](https://opendataeditor.okfn.org/)与[发布记录](https://github.com/okfn/opendataeditor/releases)公开可读；README 标注 beta，不能把发布号或安装包存在解释为零缺陷保证。
- 本次只核验基础探索与验证用途，不承诺所有处理都离线或推广可选 AI/在线发布功能。外部服务使用前单独确认数据流、费用与授权；清洗不能证明来源真实性或代替匿名化审查。

## 开源应用 · 社区社交

```yaml
title: HumHub
logo: finance.png
url: https://github.com/humhub/humhub
description: PHP 自托管组织社交平台｜以成员、空间、内容和模块组织社区与内部协作；须配置服务器、权限与审核，商业许可、托管及部分模块另计，敏感内容按空间可见范围管理
```

- [官方仓库](https://github.com/humhub/humhub)：用户、空间、内容、模块组成组织社交与内联网；浏览器界面适配桌面及移动设备，不是原生手机应用。区别于公开联邦动态与主题论坛。
- [官方 LICENSE](https://github.com/humhub/humhub/blob/master/LICENSE)：AGPL-3.0 与商业许可双轨；链接 AGPL-3.0-or-later 文本。不能将付费模块、托管或商业许可一并宣称免费。
- [官方服务器要求](https://docs.humhub.org/docs/admin/requirements/)：PHP Web 应用，Apache/nginx 等服务配置，须核对当前 PHP、数据库及扩展要求；不是下载即用的纯静态页面。
- [官方发布记录](https://github.com/humhub/humhub/releases)：可核对更新。自托管不自动带来隐私保障，需维护访问权限、TLS、备份、举报审核与模块安全；不要公开数据库和不必要成员资料。

## 边界

未修改 YAML，未安装、注册、运行仿真、导入数据或创建社区。文档核验不代表本机兼容、隐私或安全审计通过。
