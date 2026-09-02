# 资源导航开源应用候选核验（2026-09-02，第 13 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按规范化 GitHub URL 和建议标题检查，以下 6 个主维护仓库均未收录。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库 README 证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · 灾害应急 | OpenQuake Engine | [gem/oq-engine](https://github.com/gem/oq-engine) | 地震灾害与风险计算引擎｜Python 包及命令行工具，支持桌面、服务器和计算集群 | 固定版本 [README](https://github.com/gem/oq-engine/blob/641deb6384bcef76ea3cbe0d56163f8de193b7fb/README.md#L1-L6) 将其定义为 GEM 基金会开发的开源地震危险性、风险计算和决策支持软件；[版本与文档段落](https://github.com/gem/oq-engine/blob/641deb6384bcef76ea3cbe0d56163f8de193b7fb/README.md#L25-L51) 提供 PyPI、LTS/稳定版本和入门手册入口，适合补充震害情景和风险评估工具。 |
| 开源应用 · 环境水务 | Pywr | [pywr/pywr](https://github.com/pywr/pywr) | Python 水资源网络模拟包｜Windows、Linux、macOS，可用 pip、PyPI 或 Anaconda 安装 | 固定版本 [README](https://github.com/pywr/pywr/blob/28cfe05d4ea69c914545015884e22428e76f018b/README.rst#L5-L30) 说明它以线性规划求解离散时步网络资源分配，主要用于供水网络，并支持 Python API、Jupyter 和 JSON 模型；[安装段落](https://github.com/pywr/pywr/blob/28cfe05d4ea69c914545015884e22428e76f018b/README.rst#L41-L54) 明确三大桌面平台及 `pip install pywr`，适合补充供水、库容、流量约束和情景分配模拟。 |
| 开源应用 · 心理实验 | lab.js | [FelixHenninger/lab.js](https://github.com/FelixHenninger/lab.js) | 浏览器研究实验构建器与 JavaScript 库｜图形化 Web Builder、发布包和 starter kit | 固定版本 [README](https://github.com/FelixHenninger/lab.js/blob/b8206ad7e558476a7222adc91c0bc184329832d9/readme.md#L1-L21) 说明它用于在浏览器中构建、运行和分享研究实验与问卷，并提供图形化构建器及 npm 包；[入门段落](https://github.com/FelixHenninger/lab.js/blob/b8206ad7e558476a7222adc91c0bc184329832d9/readme.md#L31-L42) 说明可无代码使用 Builder，也可下载每个发行版附带的 starter kit 直接编写 JavaScript，适合补充行为与认知研究的实验制作。 |
| 开源应用 · 车载系统 | vSomeIP | [COVESA/vsomeip](https://github.com/COVESA/vsomeip) | C++ SOME/IP 车载通信中间件与命令行工具｜Linux、Android、Windows，CMake/AOSP 构建 | 固定版本 [README](https://github.com/COVESA/vsomeip/blob/7875a1cb8a89f6a6ffed889f7b7ddbf16fb53b6c/README.md#L18-L28) 说明其实现 SOME/IP，并提供核心、配置、服务发现和端到端保护共享库；[Linux 构建段落](https://github.com/COVESA/vsomeip/blob/7875a1cb8a89f6a6ffed889f7b7ddbf16fb53b6c/README.md#L28-L58) 给出 C++20、CMake、Boost、编译与安装命令，后续 README 还列出 Android 和 Windows 构建，适合补充 ECU/车载服务通信开发与测试。 |
| 开源应用 · 公民参与 | Loomio | [loomio/loomio](https://github.com/loomio/loomio) | 自托管协作决策 Web 平台｜Ubuntu 服务器、Docker Compose、浏览器访问 | 固定版本 [README](https://github.com/loomio/loomio/blob/5eb8c33e884b2ae3746613abef8a8aaf074e6628/README.md#L1-L15) 将其定义为面向协作组织的共同决策工具，并明确提供自托管部署指南；固定版本 [部署 README](https://github.com/loomio/loomio/blob/5eb8c33e884b2ae3746613abef8a8aaf074e6628/deploy/README.md#L1-L12) 说明可在单台 Ubuntu 服务器以 Docker Compose 运行并自动配置 TLS，适合补充讨论、提案和集体决策协作。 |
| 开源应用 · 海洋科学 | pyTMD | [pyTMD/pyTMD](https://github.com/pyTMD/pyTMD) | Python 潮汐预测软件包｜PyPI、conda/mamba、Pixi/JupyterLab | 固定版本 [README](https://github.com/pyTMD/pyTMD/blob/edb01ef13fca818df9a3c8f465e3085a5d255255/README.md#L1-L3) 说明它用于估算海洋潮、负荷潮、固体地球潮和极潮；[安装段落](https://github.com/pyTMD/pyTMD/blob/edb01ef13fca818df9a3c8f465e3085a5d255255/README.md#L48-L75) 给出 PyPI、conda、mamba 与 GitHub 安装命令，适合补充海洋潮汐计算和相关地球物理研究。 |

## 建议目录描述

- `OpenQuake Engine`：地震危险性与风险计算引擎｜通过 Python/命令行运行震害情景和风险模型，适用于桌面、服务器与计算集群。
- `Pywr`：跨平台水资源网络模拟包｜用 Python、Jupyter 或 JSON 构建供水、库容、流量约束与情景分配模型。
- `lab.js`：浏览器研究实验构建工具｜用图形化 Builder 或 JavaScript starter kit 制作、运行和分享行为研究实验与问卷。
- `vSomeIP`：跨平台 SOME/IP 车载中间件｜提供服务通信、服务发现、配置及端到端保护库，可从源码构建集成。
- `Loomio`：Docker 化协作决策平台｜自托管讨论、提案与集体决策空间，适用于社群和协作组织。
- `pyTMD`：Python 潮汐预测软件｜计算海洋潮、负荷潮、固体地球潮与极潮，支持 pip、conda 和 Jupyter 工作流。

## 核验边界

- 项目用途、安装形态与平台优先采用主仓库 README；目录写入前仍需复核最新发行说明、依赖、许可证和安全公告。
- OpenQuake 输出取决于危险源、暴露度、脆弱性和计算参数，不能替代当地应急部门、结构工程师或地震风险专家的判断。
- Pywr 是情景和资源分配模型；结果依赖网络结构、约束、入流与需求数据，不自动证明现实供水方案安全、合规或可实施。
- lab.js 仅作为研究实验和问卷制作工具收录，不提供心理诊断、治疗建议或医疗结论；涉及参与者时仍需独立落实伦理审查、知情同意、隐私和数据治理。
- vSomeIP 是通信库而非完整车载操作系统；上车使用仍需完成实时性、功能安全、网络安全、硬件和整车级验证。
- Loomio 仅按讨论、提案和共同决策的软件功能描述，不评价或比较任何政治制度、组织或立场；正式公共参与还需另行处理身份、无障碍、隐私、审计和当地规则。
- pyTMD 的计算需要选定适用潮汐模型和数据源；结果精度取决于模型覆盖、输入坐标、时间尺度与插值设置，不替代航海安全或工程潮位核验。
- 实际写入目录前应再次执行规范化 URL 与标题去重，并复核仓库最新维护状态。
