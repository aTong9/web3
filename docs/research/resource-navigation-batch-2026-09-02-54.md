# 资源导航第 54 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按标题及去除末尾 `/`、忽略大小写后的 URL 检查
`src/data/webstack.yml`，下列 6 项均未在全局目录中出现。

| 分类 | 建议条目 | 平台 / 形态 | 许可与近期维护 | 风险边界及推荐中文描述 |
| --- | --- | --- | --- | --- |
| 开源应用 · 工业控制 | [Apache PLC4X](https://github.com/apache/plc4x) | 工业 PLC 统一通信开发库与适配层；主线提供 Java、Go 库，并含 OPC UA、PLC4X Server 等集成能力。 | [Apache-2.0](https://github.com/apache/plc4x/blob/develop/LICENSE)；[开发分支](https://github.com/apache/plc4x/commits/develop/) 2026-09-01 仍有提交。 | 它不是完整 PLC 运行时或 SCADA；生产接入须核验具体协议与驱动、网络隔离、认证加密和故障安全，不能把使用该库等同工业安全认证。推荐描述：**工业 PLC 通信开发库｜以统一 API 接入多种 PLC 协议，提供 Java、Go 库及 OPC UA 等集成；生产部署前需核验驱动兼容与工业网络安全。** |
| 开源应用 · 嵌入式系统 | [Tock](https://github.com/tock/tock) | Rust 嵌入式操作系统；面向 Cortex-M 与 RISC-V 微控制器，结合 Rust 内存安全和 MPU 隔离并发、不互信的应用。 | [MIT](https://github.com/tock/tock/blob/master/LICENSE-MIT) OR [Apache-2.0](https://github.com/tock/tock/blob/master/LICENSE-APACHE)；[主分支](https://github.com/tock/tock/commits/master/) 2026-09-01 仍有提交。 | 支持范围依赖具体芯片、开发板端口和 MPU；隔离模型不等于设备已获安全认证，量产仍须验证启动链、固件更新、密钥和硬件保护。推荐描述：**安全导向的嵌入式操作系统｜在 Cortex-M 与 RISC-V 微控制器上以 Rust 内核和 MPU 隔离驱动与应用；采用前需确认开发板支持。** |
| 开源应用 · 物联网平台 | [EdgeX Foundry](https://github.com/edgexfoundry/edgex-go) | Linux Foundation 托管的厂商中立 IoT 边缘互操作框架；该主仓提供 Go 微服务，可本机构建并以 Docker / Compose 部署。 | [Apache-2.0](https://github.com/edgexfoundry/edgex-go/blob/main/LICENSE)；[主分支](https://github.com/edgexfoundry/edgex-go/commits/main/) 2026-08-15 仍有提交。 | README 说明 main 是下一版本开发代码，不保证稳定；生产应使用 Releases、匹配组件版本，并保留安全服务和核验代理、令牌、密钥存储及暴露端口。推荐描述：**自托管 IoT 边缘微服务平台｜以 Go 服务连接设备、处理数据并衔接云端，支持 Docker 部署；生产环境应使用稳定发行版并配置安全组件。** |
| 开源应用 · 无人机 | [Helios](https://github.com/jamesagarside/helios) | Windows、macOS、Linux、iOS、Android 与 Web 无人机地面站；连接 MAVLink / MSP 飞控，提供任务规划、遥测、视频、本地飞行数据库和 SQL 分析。 | [GPL-3.0](https://github.com/jamesagarside/helios/blob/main/LICENSE)；[主分支](https://github.com/jamesagarside/helios/commits/main/) 2026-06-30 仍有提交。 | 项目仍较年轻，协议和平台能力不完全相同；飞行前须在仿真和受控环境验证失效保护、禁飞区、链路与命令行为，并遵守当地航空法规。推荐描述：**跨平台无人机地面站｜连接 MAVLink 或 MSP 飞控，规划任务、记录遥测并以本地数据库和 SQL 分析飞行；实飞前须验证兼容、失效保护和当地法规。** |
| 开源应用 · 无线电通信 | [OpenRTX](https://github.com/OpenRTX/OpenRTX) | 面向受支持数字业余无线电设备的模块化固件；提供发布固件、夜间构建和 Linux 仿真编译路径，并实验性支持 M17。 | [GPL-3.0](https://github.com/OpenRTX/OpenRTX/blob/master/LICENSE)；[主分支](https://github.com/OpenRTX/OpenRTX/commits/master/) 2026-08-15 仍有提交。 | README 明确项目高度实验性；刷写可能损坏或改变设备行为，发射、接收和改装须符合本地频谱、设备认证及业余无线电规则。推荐描述：**数字业余无线电开源固件｜为受支持手台提供模块化界面、语音和实验性 M17 功能；刷写前须核对机型、备份及当地无线电法规。** |
| 开源应用 · 声学分析 | [Acoular](https://github.com/acoular/acoular) | 可通过 pip 或 Conda 安装的 Python 声学测试与波束成形模块；处理麦克风阵列的多通道数据，定位声源并生成频谱和声源分布图。 | [BSD-3-Clause](https://github.com/acoular/acoular/blob/master/LICENSE)；[主分支](https://github.com/acoular/acoular/commits/master/) 2026-08-25 仍有提交。 | 结果取决于阵列几何、同步、校准、传播模型、环境和算法参数；职业噪声、产品认证或安全结论须以校准仪器和适用标准独立验证。推荐描述：**pip 或 Conda 安装的声学阵列分析工具｜通过波束成形处理多通道录音并绘制声源位置和频谱；测量结论须结合阵列校准与适用标准复核。** |

## 结论

六项分别补充统一 PLC 协议适配、Rust 隔离型嵌入式系统、IoT 边缘微服务、跨平台飞行数据分析、数字手台固件和麦克风阵列声源定位，与各分类现有七项形成明确功能增量。许可证均由主仓直接给出，六个仓库在 2026 年仍有维护；纳入目录时应保留工业网络、量产硬件、边缘服务、航空、频谱和测量校准边界。
