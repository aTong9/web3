# 资源导航开源应用候选核验（2026-09-02，第 12 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按完整 GitHub URL 和建议标题检查，以下 6 个主维护仓库均未收录。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库 README 证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · 航空航天 | Open MCT | [nasa/openmct](https://github.com/nasa/openmct) | 可自托管 Web 任务控制框架｜Node.js、npm 与现代浏览器，可在桌面和移动端使用 | 固定版本 [README](https://github.com/nasa/openmct/blob/8782f884ed3b31d853fe655ee07ed89fd27f7eef/README.md#L1-L6) 说明它由 NASA Ames 开发，用于航天任务数据分析以及实验漫游车的规划和运行；[本地运行段落](https://github.com/nasa/openmct/blob/8782f884ed3b31d853fe655ee07ed89fd27f7eef/README.md#L12-L44) 给出 Node.js、`npm install`、`npm start` 和本机 8080 端口，适合补充遥测可视化与任务控制界面。 |
| 开源应用 · 食品餐饮 | Open Food Network | [openfoodfoundation/openfoodnetwork](https://github.com/openfoodfoundation/openfoodnetwork) | 自托管本地食品交易 Web 平台｜服务器部署，官方提供 Ansible playbook | 固定版本 [README](https://github.com/openfoodfoundation/openfoodnetwork/blob/2126e16dc9fa0cfabb94d769e7a42d1e5e7be369/README.md#L3-L14) 将其定义为连接农户、食品枢纽、合作社、农贸市场、独立食品商家与消费者的本地食品在线市场；[部署段落](https://github.com/openfoodfoundation/openfoodnetwork/blob/2126e16dc9fa0cfabb94d769e7a42d1e5e7be369/README.md#L27-L31) 指向项目自有 Ansible 服务器配置仓库，适合补充食品生产者和分销节点的线上交易。 |
| 开源应用 · 网络实验 | netlab | [ipspace/netlab](https://github.com/ipspace/netlab) | Python 命令行网络实验编排器｜Linux、macOS 或 WSL，驱动 libvirt/KVM、Docker、containerlab、Vagrant 与 Ansible | 固定版本 [README](https://github.com/ipspace/netlab/blob/ad0074a84598b4bd2e9d5cf0b6766283f509f6bd/README.md#L1-L16) 说明它用 YAML 描述拓扑和路由意图，可生成虚拟化、寻址、协议及自动化配置；[CLI 段落](https://github.com/ipspace/netlab/blob/ad0074a84598b4bd2e9d5cf0b6766283f509f6bd/README.md#L28-L41) 给出实验创建、启动、停止和重配命令，后续段落还覆盖设备连接、抓包和链路损伤，适合可重复网络实验。 |
| 开源应用 · 地球科学 | ParFlow | [parflow/parflow](https://github.com/parflow/parflow) | 流域水文模拟器与命令行求解程序｜Linux 工作站到超级计算机，源码构建安装 | 固定版本 [README](https://github.com/parflow/parflow/blob/acbc2e75a0f07636f90e097df13ce8cde607b13c/README.md#L1-L20) 将其定义为开放、模块化、并行的流域流动模型，可联合模拟地表与地下水、地形、地质和陆面过程；[构建安装段落](https://github.com/parflow/parflow/blob/acbc2e75a0f07636f90e097df13ce8cde607b13c/README.md#L71-L87) 说明其跨平台设计及主要 Linux 构建边界，[安装命令](https://github.com/parflow/parflow/blob/acbc2e75a0f07636f90e097df13ce8cde607b13c/README.md#L209-L218) 给出 `make` 和 `make install`，适合补充水文与地表—地下耦合模拟。 |
| 开源应用 · 制造自动化 | Eclipse BaSyx Java V2 SDK | [eclipse-basyx/basyx-java-server-sdk](https://github.com/eclipse-basyx/basyx-java-server-sdk) | 自托管 Industry 4.0 数字孪生与 AAS 服务组件｜Docker 或 Java/Maven | 固定版本 [README](https://github.com/eclipse-basyx/basyx-java-server-sdk/blob/8a12cebdecda0c057ff2b5e1443f7f0b4bb00d4f/README.md#L1-L13) 说明其组件兼容 Asset Administration Shell V3，支持内存、MongoDB、MQTT 等后端或功能，并提供可配置的 Docker 镜像；[组件清单](https://github.com/eclipse-basyx/basyx-java-server-sdk/blob/8a12cebdecda0c057ff2b5e1443f7f0b4bb00d4f/README.md#L15-L28) 覆盖 AAS、子模型、注册、发现与文件服务，适合补充制造资产数字孪生和标准化数据接口。 |
| 开源应用 · 图书馆管理 | SLiMS 9 Bulian | [slims/slims9_bulian](https://github.com/slims/slims9_bulian) | 自托管 Web 图书馆管理系统｜PHP 8.1+、MySQL 或 MariaDB，支持 Docker Compose | 固定版本 [README](https://github.com/slims/slims9_bulian/blob/1d892599c131db3ae86d3f5376f245af3e87d4c7/README.md#L1-L18) 明确覆盖图书、期刊、数字文档、流通、馆藏、会员和盘点，并列出 PHP 与数据库要求；[Docker 段落](https://github.com/slims/slims9_bulian/blob/1d892599c131db3ae86d3f5376f245af3e87d4c7/README.md#L20-L32) 给出 Compose 启动方式，适合补充中小型图书馆的完整自托管业务系统。 |

## 建议目录描述

- `Open MCT`：可自托管 Web 任务控制框架｜可视化遥测数据，支持航天任务分析、规划与运行界面扩展。
- `Open Food Network`：自托管本地食品交易平台｜连接农户、食品枢纽、合作社、商家与消费者并管理线上销售。
- `netlab`：命令行网络实验编排工具｜用 YAML 部署虚拟拓扑、路由协议、抓包和链路损伤测试。
- `ParFlow`：Linux 流域水文模拟器｜联合模拟地表水、地下水、地形、地质和陆面过程，可扩展到并行计算环境。
- `Eclipse BaSyx Java V2 SDK`：Docker 化工业数字孪生组件｜部署 AAS 仓库、注册发现服务及 Industry 4.0 数据接口。
- `SLiMS 9 Bulian`：自托管图书馆管理系统｜管理书目、流通、会员、馆藏盘点和数字资料。

## 核验边界

- 项目用途、安装形态与平台优先采用主仓库 README；目录写入前仍需复核发行说明、安装文档、许可证和安全公告。
- Open MCT 是可扩展框架而非开箱即用的完整任务中心；遥测源、持久化、权限和运行界面需要按具体任务集成。
- Open Food Network 的正式部署依赖独立的官方 Ansible 配置；支付、税务、食品经营、隐私及服务器运维应按所在地要求核验。
- netlab 会创建或销毁虚拟实验环境；应仅在自有或明确授权的主机、镜像、设备和网络范围内使用。
- ParFlow 输出依赖网格、边界条件、物理参数和数值设置，不能替代水文、地质或工程专业复核。
- BaSyx 提供的是 AAS 服务与 SDK 组件；生产系统仍需完成身份认证、网络隔离、设备安全、数据治理和高可用设计。
- SLiMS 的 Docker Compose 段落标注为开发运行方式；生产部署必须另行落实 Web 服务、TLS、权限、备份、升级和数据库维护。
- 实际写入目录前应再次执行规范化 URL 与标题去重，并复核仓库最新维护状态。
