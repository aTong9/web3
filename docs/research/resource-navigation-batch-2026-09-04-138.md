# 资源导航第 138 批来源核验

核验日期：2026-09-04。范围仅供应链物流、工程求解、食品餐饮各一项；本文件不修改目录。

## 去重与用途互补

已检查三个分类现有条目，并对完整 `src/data/webstack.yml` 检索 Stockpyl / LarrySnyder、PETSc / petsc.org / petsc4py、CookCLI / Cooklang 及仓库 URL；未发现同产品或别名条目。
Stockpyl 补充库存策略的模型级仿真，不是 OpenBoxes 仓库台账或 frePPLe 排产界面的替代条目；PETSc 补充并行矩阵与求解器底层，不重复现有具体有限元应用；CookCLI 补充可版本管理的纯文本食谱工作流，不是另一个数据库型食谱站。

## 开源应用 · 供应链物流

```yaml
title: Stockpyl
logo: finance.png
url: https://github.com/LarrySnyder/stockpyl
description: Python 库存策略优化与仿真库，研究订货批量及多级库存配置｜MIT 开源，本地代码使用；结果依赖需求与成本假设，不自动执行采购
```

- [官方仓库](https://github.com/LarrySnyder/stockpyl)：支持单节点库存模型、多级库存优化及仿真，附教学 Notebook；README 明确 MIT 许可。
- [官方安装文档](https://stockpyl.readthedocs.io/en/latest/install.html)：通过 PyPI 安装到 Python 环境，不是图形化仓储系统。未承诺所有操作系统/依赖组合均经测试，因此卡片仅标明 Python 形态。
- 源码可免费使用，无必需云账号；企业需求、库存和成本数据应保留在受控运行环境。部署到共享 Notebook 或外部计算服务时另行核验数据去向。
- 数学模型有假设与适用范围，不能直接保证补货收益或服务水平；本轮未执行仿真或实际采购。仓库提供测试、文档和变更文件，未据此承诺维护 SLA。

## 开源应用 · 工程求解

```yaml
title: PETSc
logo: finance.png
url: https://github.com/petsc/petsc
description: 并行科学计算工具库，提供稀疏线性与非线性方程求解器｜Linux、macOS 与 Windows 需配置构建环境；BSD-2-Clause，需编程及数值验证
```

- [官方 GitHub 仓库](https://github.com/petsc/petsc)明确为官方 GitLab 项目的镜像，非独立分叉；主开发与问题协作应按项目指引前往上游。
- [官方概览](https://petsc.org/release/overview/)：服务 C、C++、Fortran、Python 科学程序，包含并行矩阵/向量与多类求解算法。它是程序库，不是直接打开 CAD 模型就能求解的桌面软件。
- [支持平台](https://petsc.org/release/overview/features/)与[安装文档](https://petsc.org/release/install/)提供 Linux、macOS、Windows/HPC 路径；具体编译器、并行和加速器依赖按构建方案核查。官方文档当前显示 3.25.5；不将镜像的 Releases 列表作为维护判据。
- [LICENSE 原文](https://raw.githubusercontent.com/petsc/petsc/main/LICENSE)是两条款 BSD 许可，并明确自动下载的第三方软件各自适用许可证。核心源码免费不代表外部求解器、云算力或集群零成本。
- 本地或受控集群可处理模型；共享集群权限由使用方负责。收敛、网格与物理模型均需验证，结果不构成工程安全认证；未安装或运行计算。

## 开源应用 · 食品餐饮

```yaml
title: CookCLI
logo: finance.png
url: https://github.com/cooklang/cookcli
description: Cooklang 纯文本食谱命令行工具，可生成购物清单并在本地网页浏览｜Windows、macOS、Linux；MIT 开源，食谱内容与食材安全需自行核验
```

- [官方仓库](https://github.com/cooklang/cookcli)：命令行维护食谱、购物清单与报告，可启动内嵌网页服务器；README 明确 MIT 许可，部分集成源码同为 MIT。
- [官方发布页](https://github.com/cooklang/cookcli/releases)可见 2026-06-26 的 v0.32.1 及 Windows/macOS/Linux 发行包；这是可查发行信号，不承诺该缓存页面版本始终最新。
- CLI 本地工作流无需付费账号，不能将其他 Cooklang 移动客户端或第三方服务一并描述为免费开源。浏览器演示站不等同于本地运行，不向演示站上传私人菜单。
- 服务公开到网络前需要自行处理访问权限；私人食谱、家庭习惯不应无意公开。生成的数量或到期记录不能判定食品是否安全，也不能验证过敏原；未下载、上传、部署或执行食品操作。

## 证据边界

本轮只完成目录候选与一手来源研究，没有运行时测试、依赖审计或安全认证。PETSc 两个猜测路径无法直接打开，已改用官方概览实际链接及仓库许可证核验；未以打不开的页面作为证据。
