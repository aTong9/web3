# 资源导航开源应用候选核验（2026-09-02，第 11 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按完整 GitHub URL 和建议标题检查，以下 6 个主维护仓库均未收录。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库 README 证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · 数学计算 | GAP | [gap-system/gap](https://github.com/gap-system/gap) | 交互式离散代数命令行系统｜Linux、macOS 源码构建，Windows 二进制发行；可安装扩展包 | 固定版本 [README](https://github.com/gap-system/gap/blob/fa264836a223e1aa8763bd7945ed4bc40dca7181/README.md#L10-L31) 将 GAP 定义为侧重计算群论的离散代数系统，并指向稳定发行版和安装流程；同版本 [INSTALL](https://github.com/gap-system/gap/blob/fa264836a223e1aa8763bd7945ed4bc40dca7181/INSTALL.md#L18-L29) 明确覆盖 Linux、macOS 源码发行和 Windows 二进制发行，适合补充群、环、域及组合结构计算。 |
| 开源应用 · 供应链物流 | Odoo Community | [odoo/odoo](https://github.com/odoo/odoo) | 自托管 Web ERP 与业务套件｜生产部署优先 Linux，另有 Windows Community 安装器 | 固定版本 [README](https://github.com/odoo/odoo/blob/928ae2ba164022a51cdfe548dec9491c61339a5f/README.md#L7-L27) 将其定义为可组合的 Web 开源应用，明确列出仓储、制造、采购等模块并链接标准安装；官方 [本地部署文档](https://www.odoo.com/documentation/19.0/administration/on_premise/packages.html) 给出 Debian、Ubuntu、RPM Linux 和 Windows Community 安装方式，适合补充库存、采购、制造和仓储流程。 |
| 开源应用 · 医疗影像 | Weasis | [nroduit/Weasis](https://github.com/nroduit/Weasis) | DICOM 桌面查看器｜Windows、macOS、Linux；可独立运行或连接 PACS、DICOMweb | 固定版本 [README](https://github.com/nroduit/Weasis/blob/0a42299e9b01f5dac65e9e0064d8bc4dc494f2af/README.md#L19-L54) 将其定义为独立或 Web 集成使用的 DICOM 查看器，列出三平台桌面发行与 PACS、DICOMweb 接入；适合补充医学影像的浏览、对比、导入导出和服务连接，不对影像作诊断结论。 |
| 开源应用 · 工程求解 | FreeFEM | [FreeFem/FreeFem-sources](https://github.com/FreeFem/FreeFem-sources) | 有限元偏微分方程求解环境｜Windows、macOS、Linux；二进制安装或源码构建，支持脚本和命令行 | 固定版本 [README](https://github.com/FreeFem/FreeFem-sources/blob/754dae8ae8f858784ad46b2f46dfd7862829cb5a/README.md#L26-L32) 将其定义为二维、三维非线性多物理 PDE 有限元求解器；[构建与安装段落](https://github.com/FreeFem/FreeFem-sources/blob/754dae8ae8f858784ad46b2f46dfd7862829cb5a/README.md#L81-L127) 给出配置、编译、检查和安装命令，适合补充脚本化工程方程与多物理场求解。 |
| 开源应用 · 无线电通信 | SDR++ | [AlexandreRouma/SDRPlusPlus](https://github.com/AlexandreRouma/SDRPlusPlus) | 软件无线电桌面应用｜Windows、Linux、macOS、BSD；发行包或源码构建 | 固定版本 [README](https://github.com/AlexandreRouma/SDRPlusPlus/blob/8c9f5ee8fe405775bfcd62c8c8f8c0fc928a64af/readme.md#L1-L20) 将其定义为跨平台、模块化 SDR 软件；[安装段落](https://github.com/AlexandreRouma/SDRPlusPlus/blob/8c9f5ee8fe405775bfcd62c8c8f8c0fc928a64af/readme.md#L22-L70) 给出 Windows、Linux、macOS、BSD 的发行包或源码入口，适合补充多类 SDR 硬件的调谐、频谱观察与模块化收发流程。 |
| 开源应用 · 数字取证 | Timesketch | [google/timesketch](https://github.com/google/timesketch) | 自托管协作取证时间线 Web 平台｜Ubuntu 与 Docker Compose；另提供 API/CLI 客户端 | 固定版本 [README](https://github.com/google/timesketch/blob/a705aabad73b6227f72c980ac0110840439dc6ea/README.md#L17-L35) 将其定义为协作式取证时间线分析工具，可组织、检索和标注多条时间线；官方 [安装指南](https://timesketch.org/guides/admin/install/) 以 Ubuntu 和 Docker Compose 部署为主。仅应在获授权的事件响应或调查中分析合法取得的证据。 |

## 建议目录描述

- `GAP`：离散代数命令行系统｜在 Linux、macOS 或 Windows 研究群、环、域、向量空间与组合结构，并可安装扩展包。
- `Odoo Community`：自托管 Web 业务套件｜组合仓储、采购、制造、销售和库存应用，在 Linux 服务器部署 Community 版。
- `Weasis`：Windows、macOS 与 Linux DICOM 桌面查看器｜浏览、对比和导出医学影像，并可连接 PACS 或 DICOMweb 服务。
- `FreeFEM`：跨平台有限元求解环境｜用脚本在二维或三维网格上建立并求解偏微分方程及多物理场模型。
- `SDR++`：跨平台软件无线电桌面应用｜连接多种 SDR 设备，调谐、观察频谱并运行模块化收发流程。
- `Timesketch`：自托管取证时间线平台｜在获授权的调查或事件响应中汇集、检索、标注并协作分析合法取得的时间线证据。

## 核验边界

- 项目用途、安装形态与平台优先采用主仓库 README；目录写入前仍需复核发行说明、安装文档、许可证和安全公告。
- GAP 的代数对象、算法和扩展包各有适用范围，计算结果仍需按数学模型、假设和精度要求复核。
- Odoo Community 是可组合的通用业务套件；具体供应链能力、依赖模块、迁移、权限、备份和生产运维应按所选版本配置。
- Weasis 仅作为影像查看、管理和系统连接工具收录；本记录不评价其诊断性能，也不将软件输出作为医疗诊断结论。
- FreeFEM 的结果取决于方程、边界条件、网格、材料参数和数值设置，不能替代工程验证或专业签核。
- 使用 SDR++ 发射、接收或解码无线电信号前，应遵守所在地频谱、设备、功率、许可和隐私规定。
- Timesketch 仅用于拥有明确授权的调查、事件响应或合规场景；证据采集、传输、保全、访问和导出应遵守适用法律及证据链要求。
- 实际写入目录前应再次执行规范化 URL 与标题去重，并复核仓库最新维护状态。
