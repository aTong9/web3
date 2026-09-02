# 资源导航开源应用候选核验（2026-09-02，第 9 批）

本批仅记录候选，不修改 `src/data/webstack.yml`。已按不区分大小写的完整 URL 与标题检查，以下 6 个主维护 GitHub 仓库均未收录。

| 分类 | 候选 | 主维护 GitHub | 项目形态 / 平台 | 主仓库 README 证据与分类适配 |
| --- | --- | --- | --- | --- |
| 开源应用 · CAD 建模 | Dune 3D | [dune3d/dune3d](https://github.com/dune3d/dune3d) | 参数化三维 CAD 桌面应用｜Linux、Windows、macOS；源码构建 | [README](https://github.com/dune3d/dune3d#readme) 将其定义为可在 Linux、Windows 和 macOS 构建的参数化三维 CAD 应用，支持 STEP 导入导出、圆角和倒角，并分别给出各平台构建入口；适合补充图形化参数建模工作流。 |
| 开源应用 · 法律政务 | OpenSlides | [OpenSlides/OpenSlides](https://github.com/OpenSlides/OpenSlides) | 自托管 Web 会议与议事管理系统｜服务器与浏览器；官方安装脚本 | [README](https://github.com/OpenSlides/OpenSlides#readme) 将其定义为 Web 演示与大会管理系统，可在浏览器中管理并投屏议程、动议和选举，并给出建立 OpenSlides 4 实例的安装入口；适合补充组织会议与公共参与流程，不用于判断议事程序是否合法或有效。 |
| 开源应用 · 无障碍辅助 | OptiKey | [OptiKey/OptiKey](https://github.com/OptiKey/OptiKey) | 眼动、鼠标或摄像头控制的屏幕键盘与语音辅助应用｜Windows；发行版安装器 | [README](https://github.com/OptiKey/OptiKey#readme) 将其定义为帮助运动神经元疾病用户操作 Windows 的屏幕键盘，支持用眼动完成输入，也可使用鼠标或摄像头，并指向最新发行版 Windows 安装器；适合补充替代输入与辅助沟通工具。 |
| 开源应用 · 物联网平台 | ChirpStack | [chirpstack/chirpstack](https://github.com/chirpstack/chirpstack) | 自托管 LoRaWAN 网络服务器与 Web 管理平台｜Linux 服务器；预编译包、Docker Compose 或源码构建 | [README](https://github.com/chirpstack/chirpstack#readme) 将其定义为可搭建 LoRaWAN 网络的开源服务器，提供网关、设备、租户、数据集成管理和 gRPC API，并列出预编译二进制及 Docker / Nix 源码构建流程；适合补充长距离低功耗设备接入。 |
| 开源应用 · 气象气候 | xclim | [Ouranosinc/xclim](https://github.com/Ouranosinc/xclim) | 气候服务 Python 库｜跨平台 Python；PyPI 或 Conda 安装 | [README](https://github.com/Ouranosinc/xclim#readme) 将其定义为面向气候服务的 Python 库，提供 150 多项温度、降水、径流和海冰等指标，并支持降尺度、偏差订正与模式集合分析；README 给出 pip 和 Conda 安装方式，适合补充气候数据分析。 |
| 开源应用 · 化学材料 | pymatgen | [materialsproject/pymatgen](https://github.com/materialsproject/pymatgen) | 材料分析 Python 库、应用与 CLI｜跨平台 Python；PyPI 安装 | [README](https://github.com/materialsproject/pymatgen#readme) 将其定义为开源材料分析库，支持晶体与分子结构、主流电子结构格式、相图、反应、缺陷、弹性、能带等分析，并列出终端应用、CLI 和 `pip install pymatgen`；适合补充计算材料数据处理与分析。 |

## 建议目录描述

- `Dune 3D`：跨平台参数化三维 CAD 应用｜支持 STEP 导入导出、圆角与倒角，可在 Linux、Windows 和 macOS 构建运行。
- `OpenSlides`：自托管议事会议系统｜管理并投屏会议议程、动议与选举流程，适合组织大会和公共参与会议。
- `OptiKey`：Windows 屏幕键盘与语音辅助应用｜通过眼动、鼠标或摄像头完成文字输入和电脑控制。
- `ChirpStack`：自托管 LoRaWAN 网络服务器｜管理网关、设备、租户、数据集成并通过 gRPC API 扩展。
- `xclim`：Python 气候服务工具库｜计算多类气候指标，并支持降尺度、偏差订正与模式集合分析。
- `pymatgen`：Python 材料分析库与 CLI｜处理晶体和分子结构、电子结构文件、相图、反应及材料性质。

## 核验边界

- 项目用途、安装形态与平台优先采用各主仓库 README；目录写入前仍需复核对应版本的发行说明和安装文档。
- Dune 3D 仍在持续开发；文件兼容性、模型稳定性和制造精度应按具体版本、样例及实际工艺验证。
- OpenSlides 只提供会议、议程、动议和选举的软件管理功能；使用方式是否符合组织章程、法定程序或当地法律需另行核验。
- OptiKey 的 README 明示 Windows 8 / 8.1 / 10；较新 Windows、具体眼动设备及摄像头兼容性应按最新发行版和硬件清单实测。
- ChirpStack 的生产部署需要自行维护 PostgreSQL、Redis、MQTT、证书、备份和访问控制；Docker 示例不能直接等同于生产配置。
- xclim 的计算结果取决于输入数据、指标定义、日历与单位处理；用于科研或决策前仍需验证数据质量、方法和适用范围。
- pymatgen 提供计算材料数据结构与分析工具，不替代输入数据质控、计算方法验证、实验验证或专业判断。
- 实际写入目录前应再次执行规范化 URL 与标题去重，并复核仓库最新维护状态、稳定发行版、许可证和安全公告。
