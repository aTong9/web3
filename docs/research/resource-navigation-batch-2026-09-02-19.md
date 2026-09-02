# 资源导航第 19 批：系统与媒体开源工具核验

核验日期：2026-09-02

## 范围与去重

本批为密码管理、广播直播、嵌入式系统、工业控制、消息中间件、声学分析六个现有分类各筛选一个可安装、自托管或可嵌入的主维护 GitHub 项目。

读取 `src/data/webstack.yml` 后，将标题转为小写，将 URL 转为小写并移除协议、`www.`、末尾 `/` 与 `.git` 做全目录比对。目录当前有 2408 个条目及 2408 个有效、规范化后唯一的 URL；下列六个标题与 URL 均为零命中。核验前六个目标分类均有 6 项。

## 推荐条目

### 1. 密码管理：Proton Pass (Android)

- 主仓库：https://github.com/protonpass/android-pass
- 形态与平台：Kotlin 编写的 Android 原生密码管理器客户端，可管理加密保险库、登录信息、自动填充与通行密钥。
- 许可证：GPL-3.0-or-later。
- 维护信号：核验时远端 HEAD 为 `cb4bc258f5b3e4091548a66215f3d23e3506366e`；CHANGELOG 持续记录 2026 年 Android 版本更新。
- 一手来源：[主仓库 README](https://github.com/protonpass/android-pass#readme)、[CHANGELOG](https://github.com/protonpass/android-pass/blob/main/CHANGELOG.md)、[核验时 HEAD](https://github.com/protonpass/android-pass/commit/cb4bc258f5b3e4091548a66215f3d23e3506366e)

建议描述：`Android 密码管理器客户端｜管理加密保险库、自动填充登录信息并使用通行密钥。`

### 2. 广播直播：LibreTime

- 主仓库：https://github.com/libretime/libretime
- 形态与平台：可自托管的广播电台自动化平台，适用于在线或地面电台，提供媒体库、节目编排和自动播出。
- 许可证：AGPL-3.0。
- 维护信号：核验时远端 HEAD 为 `d5050be16be68131876218420285bc0c67a6b960`；Releases 提供 v4.5.0，并记录播出队列与元数据修复。
- 一手来源：[主仓库 README](https://github.com/libretime/libretime#readme)、[LICENSE](https://github.com/libretime/libretime/blob/main/LICENSE)、[v4.5.0 Release](https://github.com/libretime/libretime/releases/tag/v4.5.0)、[核验时 HEAD](https://github.com/libretime/libretime/commit/d5050be16be68131876218420285bc0c67a6b960)

建议描述：`自托管广播电台自动化平台｜管理媒体库、节目编排、自动播出与在线或地面广播。`

### 3. 嵌入式系统：FreeRTOS

- 主仓库：https://github.com/FreeRTOS/FreeRTOS
- 形态与平台：面向微控制器和小型微处理器的实时操作系统完整发行版，包含内核端口、嵌入式库与预配置示例。
- 许可证：内核与多数示例采用 MIT；发行版包含各自许可的第三方组件，不能将整个仓库概括为单一 MIT 许可。
- 维护信号：核验时远端 HEAD 为 `f4fcc3b228643144727e9257ba12db1cb632b6e6`；Releases 提供 `FreeRTOSv202411.00`，官方 LTS 仓库继续发布长期支持组件清单。
- 一手来源：[主发行仓库 README](https://github.com/FreeRTOS/FreeRTOS#readme)、[许可证说明](https://github.com/FreeRTOS/FreeRTOS/blob/main/FreeRTOS/License/license.txt)、[Releases](https://github.com/FreeRTOS/FreeRTOS/releases)、[官方 Kernel Book](https://github.com/FreeRTOS/FreeRTOS-Kernel-Book/blob/main/ch02.md)、[FreeRTOS-LTS](https://github.com/FreeRTOS/FreeRTOS-LTS)、[核验时 HEAD](https://github.com/FreeRTOS/FreeRTOS/commit/f4fcc3b228643144727e9257ba12db1cb632b6e6)

建议描述：`微控制器实时操作系统发行版｜提供内核端口、嵌入式库和预配置示例项目。`

### 4. 工业控制：Eclipse Milo

- 主仓库：https://github.com/eclipse-milo/milo
- 形态与平台：Java 17 可嵌入开发库，实现 OPC UA（IEC 62541）协议栈以及客户端、服务端 SDK；构建产物发布至 Maven Central。
- 许可证：EPL-2.0。
- 维护信号：核验时远端 HEAD 为 `2cb1643de14a0ad3e656fb8d5c4cc20f83d50136`；README 当前列出 1.1.6 客户端与服务端 SDK 版本。
- 一手来源：[主仓库 README](https://github.com/eclipse-milo/milo#readme)、[LICENSE](https://github.com/eclipse-milo/milo/blob/main/LICENSE.md)、[pom.xml](https://github.com/eclipse-milo/milo/blob/main/pom.xml)、[核验时 HEAD](https://github.com/eclipse-milo/milo/commit/2cb1643de14a0ad3e656fb8d5c4cc20f83d50136)

建议描述：`Java OPC UA 开发库｜提供 IEC 62541 协议栈以及可嵌入的客户端和服务端 SDK。`

> 边界：以上仅说明工业通信开发用途与部署形态，不代表生产环境安全认证、功能安全认证或适用性保证。

### 5. 消息中间件：Apache RocketMQ

- 主仓库：https://github.com/apache/rocketmq
- 形态与平台：可自托管的分布式消息与流平台，提供 NameServer、Broker、生产者和消费者，并支持本地二进制及集群部署。
- 许可证：Apache-2.0。
- 维护信号：核验时远端 HEAD 为 `e348efa66b08eb645ee123706ea6492fa9a3ad35`；Releases 提供 `rocketmq-all-5.5.0`，包含 2026 年功能与修复记录。
- 一手来源：[主仓库 README](https://github.com/apache/rocketmq#readme)、[LICENSE](https://github.com/apache/rocketmq/blob/develop/LICENSE)、[Releases](https://github.com/apache/rocketmq/releases)、[核验时 HEAD](https://github.com/apache/rocketmq/commit/e348efa66b08eb645ee123706ea6492fa9a3ad35)

建议描述：`自托管分布式消息与流平台｜支持发布订阅、请求响应、顺序与事务消息，并可横向扩展部署。`

### 6. 声学分析：pyroomacoustics

- 主仓库：https://github.com/LCAV/pyroomacoustics
- 形态与平台：可通过 Python 安装的室内声学与阵列信号处理库，包含房间脉冲响应模拟、波束成形、声源定位、滤波和降噪算法。
- 许可证：MIT。
- 维护信号：核验时远端 HEAD 为 `ff7d61f219e4eb41489963c4bb5f57bea5bc2c69`；最新 Release 为 v0.10.1，包含 2026 年构建系统、仿真与声学分析更新。
- 一手来源：[主仓库 README](https://github.com/LCAV/pyroomacoustics#readme)、[安装与贡献说明](https://github.com/LCAV/pyroomacoustics/blob/master/CONTRIBUTING.rst)、[Releases](https://github.com/LCAV/pyroomacoustics/releases)、[核验时 HEAD](https://github.com/LCAV/pyroomacoustics/commit/ff7d61f219e4eb41489963c4bb5f57bea5bc2c69)

建议描述：`Python 室内声学与阵列处理库｜模拟房间脉冲响应，并提供波束成形、声源定位、滤波和降噪算法。`

## 未采用候选

- `emqx/emqx`：已在全目录其他分类收录，避免重复 URL。
- `keepassxreboot/keepassxc`：已在其他密码与安全工具分类收录，本批选择当前目录未包含的 Android 原生客户端。
- `open62541/open62541`：适配工业通信，但目录已有多个 C/C++ 工业运行时；本批采用 Java 客户端与服务端 SDK，补足语言和集成形态。
