# 资源导航第 53 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按标题及去除末尾 `/`、忽略大小写后的 URL 检查
`src/data/webstack.yml`，下列 6 项均未在全局目录中出现。

| 分类 | 建议条目 | 平台 / 形态 | 许可与近期维护 | 风险边界及推荐中文描述 |
| --- | --- | --- | --- | --- |
| 开源应用 · 法律政务 | [Open Zaak](https://github.com/open-zaak/open-zaak) | Python / Django 政务事项 API 与管理门户；提供 Docker 镜像和 VM，可按荷兰 ZGW 标准自托管案件、文件、决定、通知和授权接口。 | [EUPL-1.2](https://github.com/open-zaak/open-zaak/blob/main/LICENSE.md)；[主分支](https://github.com/open-zaak/open-zaak/commits/main/) 2026-08-20 仍有提交。 | 标准与辖区高度相关，案件可能含敏感个人信息；上线前须核对本地法律、权限、审计、留存和安全要求，不构成法律意见。推荐描述：**Docker 自托管政务事项 API｜按荷兰 ZGW 标准管理案件、文件、决定、通知与授权；跨辖区采用前须核对本地法规、数据保护、权限和留存要求。** |
| 开源应用 · 公共数据 | [Datasette](https://github.com/simonw/datasette) | Python CLI 与可自托管 Web / JSON API；支持 Homebrew、pip、pipx 和 Docker，把 SQLite 等数据发布为可检索站点。 | [Apache-2.0](https://github.com/simonw/datasette/blob/main/LICENSE)；[主分支](https://github.com/simonw/datasette/commits/main/) 2026-09-01 仍有提交。 | 发布前须清理个人和敏感信息、配置访问控制并核对来源许可与更新责任；工具本身不保证数据质量。推荐描述：**Python CLI 与自托管数据站点｜通过 Homebrew、pip、pipx 或 Docker 发布 SQLite 数据为可检索网页和 JSON API；公开前须核对许可、隐私、访问控制和更新责任。** |
| 开源应用 · 公民参与 | [FixMyStreet](https://github.com/mysociety/fixmystreet) | 可自托管地图式市政问题上报平台；公众定位坑洞、路灯等问题，系统通过邮件或 Open311 转交相应机构。 | [AGPL-3.0-or-later](https://github.com/mysociety/fixmystreet/blob/master/LICENSE.txt)；[主分支](https://github.com/mysociety/fixmystreet/commits/master/) 2026-09-01 仍有提交。 | 需接入真实责任机构与地图地址数据，并建立隐私、诽谤、滥用审核和处置闭环；网络部署须遵守 AGPL 源码提供义务。推荐描述：**自托管地图式市政问题上报平台｜让公众定位坑洞、路灯等问题并通过邮件或 Open311 转交责任机构；上线前须配置审核、隐私、反滥用和政府处置流程。** |
| 开源应用 · 供应链物流 | [Open Supply Hub](https://github.com/opensupplyhub/open-supply-hub) | Django + React 自托管供应链设施数据平台；通过 Docker Compose 开发和部署，导入、匹配、检索并地理编码生产设施清单。 | [MIT](https://github.com/opensupplyhub/open-supply-hub/blob/main/LICENSE.txt)；[主分支](https://github.com/opensupplyhub/open-supply-hub/commits/main/) 2026-09-01 仍有提交。 | 地图、地理编码、OpenSearch 等外部服务可能需要密钥、云资源或产生费用；设施匹配不能替代所有权、合规或审计结论。推荐描述：**Docker Compose 自托管供应链设施数据平台｜导入、匹配、检索并映射全球生产设施；外部地图服务可能计费，匹配结果须经权威来源与人工复核。** |
| 开源应用 · 航空航天 | [Tudatpy](https://github.com/tudat-team/tudatpy) | Python / C++ 航天动力学工具箱，推荐通过 Conda 安装；用于轨道与姿态仿真、真实数据处理和任务分析，Windows 主要经 WSL 使用。 | [BSD-3-Clause](https://github.com/tudat-team/tudatpy/blob/develop/LICENSE)；[开发分支](https://github.com/tudat-team/tudatpy/commits/develop/) 2026-09-01 仍有提交。 | 仿真结果取决于力学模型、时间坐标、初值和外部星历；任务或安全关键决策须用权威数据和独立工具复核。推荐描述：**Conda 安装的 Python 航天动力学工具箱｜模拟轨道、姿态并处理观测数据；Windows 主要经 WSL 使用，任务关键结果须以权威星历和独立工具验证。** |
| 开源应用 · 交通仿真 | [OpenTrafficSim](https://github.com/averbraeck/opentrafficsim) | Java / Maven 多层交通模拟器；联合微观、宏观、元仿真与多交通方式，并可连接外部代码、驾驶模拟器和数据源。 | [BSD-3-Clause](https://github.com/averbraeck/opentrafficsim/blob/main/LICENSE)；[主分支](https://github.com/averbraeck/opentrafficsim/commits/main/) 2026-08-31 仍有提交。 | 项目文档说明更面向普通用户的手册仍在规划；政策或安全结论须用本地路网、需求和行为数据校准并独立验证。推荐描述：**Java / Maven 多层交通模拟器｜联合微观、宏观与多交通方式模型，并连接外部代码和驾驶模拟器；政策或安全结论须以本地数据校准并独立验证。** |

## 结论

六项分别补充标准化政务事项 API、轻量公共数据发布、市政问题上报、供应链设施匹配、航天动力学计算和多层交通仿真，与现有七项形成明确功能增量。许可证均由主仓直接给出，六个仓库在 2026 年仍有维护；纳入目录时应保留辖区适用性、隐私合规、外部服务费用和仿真验证边界。
