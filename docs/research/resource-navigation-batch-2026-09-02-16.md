# 资源导航第 16 批：专业开源工具核验

核验日期：2026-09-02

## 范围与去重

本批为显微成像、身份认证、通信服务、量子计算、遥感处理、数字典藏六个现有分类各筛选一个可安装、自托管或开发库项目。

读取 `src/data/webstack.yml` 后，将标题转为小写，将 URL 转为小写并移除末尾 `/` 做全目录比对。下列六个标题与规范化 URL 均为零命中；同时排除了目录已有的 napari、Omeka Classic 等项目。核验前六个目标分类均有 6 项。

## 推荐条目

### 1. 显微成像：OMERO

- 主仓库：https://github.com/ome/openmicroscopy
- 形态与平台：面向生物显微图像及元数据的开源客户端—服务器平台；官方文档提供 Linux 服务器安装和客户端接入流程。
- 许可证：GPL-2.0。
- 维护信号：主仓库未归档，2026-08-21 仍有提交；GitHub Releases 于 2026-05-19 发布 v5.6.18。
- 一手来源：[主仓库](https://github.com/ome/openmicroscopy)、[OMERO.server 安装文档](https://omero.readthedocs.io/en/stable/sysadmins/unix/server-installation.html)、[LICENSE](https://github.com/ome/openmicroscopy/blob/develop/LICENSE.txt)、[v5.6.18](https://github.com/ome/openmicroscopy/releases/tag/v5.6.18)

建议描述：`生物显微图像服务器平台｜集中存储、检索、查看和分析多维显微数据及实验元数据。`

### 2. 身份认证：Dex

- 主仓库：https://github.com/dexidp/dex
- 形态与平台：可自托管的 OpenID Connect 与 OAuth 2.0 身份提供方；通过 LDAP、SAML、GitHub、Google 等连接器联合现有身份源，并可作为 Kubernetes 身份认证组件运行。
- 许可证：Apache-2.0。
- 维护信号：主仓库未归档，2026-08-31 仍有提交；GitHub Releases 于 2026-03-03 发布 v2.45.1。
- 一手来源：[主仓库 README](https://github.com/dexidp/dex)、[LICENSE](https://github.com/dexidp/dex/blob/master/LICENSE)、[v2.45.1](https://github.com/dexidp/dex/releases/tag/v2.45.1)

建议描述：`自托管 OIDC 身份联合服务｜通过 LDAP、SAML 与常用云身份连接器为应用和 Kubernetes 提供统一登录。`

### 3. 通信服务：OpenSIPS

- 主仓库：https://github.com/OpenSIPS/opensips
- 形态与平台：面向专业 VoIP 平台的可自托管 SIP 服务器，可承担代理、注册、路由和信令处理；仓库提供源码安装说明及跨平台构建工作流。
- 许可证：GPL。
- 维护信号：README 明确由 OpenSIPS Solutions 维护；主仓库未归档，2026-09-01 仍有提交。
- 一手来源：[主仓库 README](https://github.com/OpenSIPS/opensips)、[INSTALL](https://github.com/OpenSIPS/opensips/blob/master/INSTALL)、[COPYING](https://github.com/OpenSIPS/opensips/blob/master/COPYING)、[提交记录](https://github.com/OpenSIPS/opensips/commits/master/)

建议描述：`自托管 SIP 通信服务器｜为 VoIP 平台提供高性能代理、注册、路由与可扩展信令处理。`

### 4. 量子计算：CUDA-Q

- 主仓库：https://github.com/NVIDIA/cuda-quantum
- 形态与平台：NVIDIA 的 C++ 与 Python 量子—经典混合编程平台，将 QPU、GPU 和 CPU 工作流统一到同一工具链；官方文档提供发行包安装入口。
- 许可证：Apache-2.0。
- 维护信号：主仓库未归档，2026-09-01 仍有提交；GitHub Releases 于 2026-07-02 发布 0.15.0。
- 一手来源：[主仓库 README](https://github.com/NVIDIA/cuda-quantum)、[安装文档](https://nvidia.github.io/cuda-quantum/latest/using/quick_start.html#install-cuda-q)、[LICENSE](https://github.com/NVIDIA/cuda-quantum/blob/main/LICENSE)、[0.15.0](https://github.com/NVIDIA/cuda-quantum/releases/tag/0.15.0)

建议描述：`C++ 与 Python 混合量子编程平台｜统一编排 QPU、GPU 和 CPU，构建及运行量子—经典工作流。`

### 5. 遥感处理：rioxarray

- 主仓库：https://github.com/corteva/rioxarray
- 形态与平台：可通过 PyPI 或 conda-forge 安装的 Python 库，在 xarray 上提供由 Rasterio 支撑的地理空间栅格读取、坐标参考和裁剪等能力。
- 许可证：Apache-2.0。
- 维护信号：主仓库未归档；GitHub Releases 于 2026-07-27 发布 0.23.0，同日仍有提交。
- 一手来源：[主仓库 README](https://github.com/corteva/rioxarray/blob/master/README.rst)、[安装文档](https://corteva.github.io/rioxarray/stable/installation.html)、[LICENSE](https://github.com/corteva/rioxarray/blob/master/LICENSE)、[0.23.0](https://github.com/corteva/rioxarray/releases/tag/0.23.0)

建议描述：`Python 地理空间栅格库｜扩展 xarray 以读取、投影、裁剪和导出带坐标参考的遥感栅格数据。`

### 6. 数字典藏：Omeka S

- 主仓库：https://github.com/omeka/omeka-s
- 形态与平台：面向高校、画廊、图书馆、档案馆和博物馆的自托管数字出版系统；官方 README 定义为 Linux、Apache、MySQL、PHP 的 LAMP Web 应用。
- 许可证：GPL-3.0。
- 维护信号：主仓库未归档，2026-08-31 仍有提交；GitHub Releases 于 2026-06-18 发布 v4.2.1。
- 一手来源：[主仓库 README 与安装说明](https://github.com/omeka/omeka-s)、[LICENSE](https://github.com/omeka/omeka-s/blob/develop/LICENSE)、[v4.2.1](https://github.com/omeka/omeka-s/releases/tag/v4.2.1)

建议描述：`自托管数字典藏发布系统｜为机构协作管理藏品、媒体与元数据，并搭建相互关联的在线展览。`

## 未采用候选

- `orfeotoolbox/OTB`：GitHub 仓库说明其为官方 GitLab 的镜像，不符合本批“主维护 GitHub 项目”的边界。
- `napari/napari`：已在全目录其他分类收录，避免重复 URL。
- `omeka/Omeka`：已以 Omeka Classic 收录；本批选择架构与主仓库均不同的 Omeka S，并确认标题、URL 均不重复。
