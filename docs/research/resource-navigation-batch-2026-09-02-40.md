# 资源导航第 40 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按去除末尾 `/`、忽略大小写检查
`src/data/webstack.yml`；核验期间共享工作树已写入 PROJ、Landlab、GraphHopper、GeoNode 与
Baserow，最终合并时不得重复添加。Forgejo 的官方主仓不在 GitHub，因此改用 Harness Open
Source。

| 分类 | 建议条目 | 形态 / 平台 | 相关性与许可 | 维护状态与边界 |
| --- | --- | --- | --- | --- |
| 开源应用 · 代码托管 | [Harness Open Source](https://github.com/harness/harness) | 自托管开发平台；服务端、Web UI、CLI | 官方 README 将其定义为包含代码托管、DevOps 流水线、开发环境和制品库的开源平台；[Apache-2.0](https://github.com/harness/harness/blob/main/LICENSE)。 | 官方仓库未归档且持续维护；原 `harness/gitness` 已重定向到此仓库，目录项应使用当前规范 URL。它不只是单一 Git 服务器，部署前需按实际所需模块评估资源和权限。[README](https://github.com/harness/harness#readme) · [Releases](https://github.com/harness/harness/releases) |
| 开源应用 · 地理空间 | [PROJ](https://github.com/OSGeo/PROJ) | 跨平台开发库与命令行工具 | 官方 README 定义为通用坐标参考系统转换软件，提供 `proj`、`cs2cs`、`geod`、`cct`、`projinfo` 等工具；采用 [MIT-style 许可](https://github.com/OSGeo/PROJ/blob/master/COPYING)。 | OSGeo 官方主仓未归档并持续维护；高精度转换依赖正确的 CRS、基准网格与适用区域，不能只凭坐标数值判断结果可靠性。[README](https://github.com/OSGeo/PROJ#readme) · [Releases](https://github.com/OSGeo/PROJ/releases) |
| 开源应用 · 地球科学 | [Landlab](https://github.com/landlab/landlab) | Python 包、Jupyter 教程 | 官方 README 说明其以网格、地表过程组件、I/O 和可视化支持地貌、水文、冰川及地层建模；[MIT](https://github.com/landlab/landlab/blob/master/LICENSE.md)。 | 官方主仓未归档并持续维护；科研模拟结果受输入数据、参数和模型假设影响，必须结合领域验证解读。[README](https://github.com/landlab/landlab#readme) · [Releases](https://github.com/landlab/landlab/releases) |
| 开源应用 · 地图出行 | [GraphHopper](https://github.com/graphhopper/graphhopper) | Java 库与独立 Web 服务器 | 官方 README 定义为基于 OpenStreetMap 的路径规划引擎，可计算距离、时间、转向提示并支持 map matching；[Apache-2.0](https://github.com/graphhopper/graphhopper/blob/master/LICENSE.txt)。 | 官方主仓未归档并持续维护；道路数据和现实管制会变化，导航结果应在出行前复核。[README](https://github.com/graphhopper/graphhopper#readme) · [Releases](https://github.com/graphhopper/graphhopper/releases) |
| 开源应用 · 地图服务 | [GeoNode](https://github.com/GeoNode/geonode) | Docker 自托管地理空间内容管理平台 | 官方 README 将其定义为管理、发布和协作使用地理空间数据的平台，并提供 Docker Compose 启动方式；[GPL-2.0-or-later](https://github.com/GeoNode/geonode/blob/master/LICENSE)。 | OSGeo 生态官方主仓未归档并持续维护；公网部署涉及账户、空间数据和服务端组件，须配置权限、TLS、备份与安全更新。[README](https://github.com/GeoNode/geonode#readme) · [Releases](https://github.com/GeoNode/geonode/releases) |
| 开源应用 · 低代码内建 | [Baserow](https://github.com/baserow/baserow) | Docker 自托管与云端无代码数据库、应用构建平台 | 官方 README 支持数据库、应用、自动化和自托管；开放版主体采用 MIT，但 `premium/`、`enterprise/` 等目录适用各自许可，详见[仓库许可](https://github.com/baserow/baserow/blob/develop/LICENSE)。 | 当前官方仓库是 `baserow/baserow`，`bramw/baserow` 不存在；主仓未归档并持续维护。采用高级功能、再分发或商用部署前须核对版本与目录许可边界。[README](https://github.com/baserow/baserow#readme) · [Releases](https://github.com/baserow/baserow/releases) |

## 被替换的原候选

- `https://github.com/forgejo/forgejo` 返回 404；Forgejo 官方主仓位于
  [Codeberg](https://codeberg.org/forgejo/forgejo)，不符合本批“GitHub 主维护仓库”约束。
- `https://github.com/harness/gitness` 当前重定向到
  `https://github.com/harness/harness`，目录应保存规范 URL 和当前项目名。
- `https://github.com/bramw/baserow` 不存在；Baserow 当前官方主仓为
  `https://github.com/baserow/baserow`。
