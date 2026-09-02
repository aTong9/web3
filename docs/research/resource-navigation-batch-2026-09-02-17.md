# 资源导航第 17 批：跨行业开源工具核验

核验日期：2026-09-02

## 范围与去重

本批为区块链节点、交通仿真、数据库管理、游戏引擎、航海船舶、3D 打印六个现有分类各筛选一个可安装、自托管、命令行或开发库项目。

读取 `src/data/webstack.yml` 后，将标题转为小写，将 URL 转为小写并移除末尾 `/` 与 `.git` 做全目录比对。目录当前有 2396 个有效 URL，规范化后仍为 2396 个；下列六个标题与 URL 均为零命中。核验前六个目标分类均有 6 项。

## 推荐条目

### 1. 区块链节点：Erigon

- 主仓库：https://github.com/erigontech/erigon
- 形态与平台：Go 语言以太坊执行层实现，可构建完整节点并使用内嵌共识层；README 提供 Linux、Windows/WSL、Docker 与源码构建路径，并说明 JSON-RPC、P2P、交易池和快照组件。
- 许可证：LGPL-3.0。
- 维护信号：主仓库远端 HEAD 于核验时解析为 `8f908fba3846122b84d8d9abaa07043386f6449a`；Releases 页面持续提供 Erigon 3.x 正式版本及容器镜像。
- 一手来源：[主仓库 README](https://github.com/erigontech/erigon/blob/main/README.md)、[COPYING](https://github.com/erigontech/erigon/blob/main/COPYING)、[Releases](https://github.com/erigontech/erigon/releases)、[核验时 HEAD](https://github.com/erigontech/erigon/commit/8f908fba3846122b84d8d9abaa07043386f6449a)

建议描述：`高效以太坊执行客户端｜运行完整节点、同步链状态，并通过内嵌共识层和 JSON-RPC 提供链上服务。`

### 2. 交通仿真：CARLA

- 主仓库：https://github.com/carla-simulator/carla
- 形态与平台：面向自动驾驶研发的开源城市与道路交通仿真平台，支持车辆、行人、传感器、天气和环境条件；官方快速开始文档提供 Ubuntu、Windows 预编译包和 Python API。
- 许可证：CARLA 代码为 MIT，CARLA 资产为 CC-BY；所依赖 Unreal Engine 另有许可条款。
- 维护信号：主仓库远端 HEAD 于核验时解析为 `0a5ce0d5b4952bd8294a163c12d49f197bdb2aba`；Releases 页面提供 0.9.16 的 Ubuntu 与 Windows 包。
- 一手来源：[主仓库 README](https://github.com/carla-simulator/carla)、[快速安装](https://github.com/carla-simulator/carla/blob/ue5-dev/Docs/start_quickstart.md)、[Releases](https://github.com/carla-simulator/carla/releases)、[核验时 HEAD](https://github.com/carla-simulator/carla/commit/0a5ce0d5b4952bd8294a163c12d49f197bdb2aba)

建议描述：`自动驾驶交通仿真平台｜构建城市道路、车辆、行人、传感器与天气场景，用于训练和验证驾驶系统。`

### 3. 数据库管理：CloudBeaver

- 主仓库：https://github.com/dbeaver/cloudbeaver
- 形态与平台：DBeaver 团队维护的自托管 Web 数据库管理器，服务端为 Java、前端为 TypeScript/React；社区版可通过官方 Docker 镜像部署。
- 许可证：Apache-2.0。
- 维护信号：主仓库远端 HEAD 于核验时解析为 `dcbf3f4d6d146e6dfa5b13b896b855e135405fd0`；README 的 2026 版本日志及公开里程碑显示持续迭代。
- 一手来源：[主仓库 README](https://github.com/dbeaver/cloudbeaver)、[LICENSE](https://github.com/dbeaver/cloudbeaver/blob/devel/LICENSE)、[发布周期](https://github.com/dbeaver/cloudbeaver/wiki/CloudBeaver-release-cycles)、[核验时 HEAD](https://github.com/dbeaver/cloudbeaver/commit/dcbf3f4d6d146e6dfa5b13b896b855e135405fd0)

建议描述：`自托管 Web 数据库管理器｜在浏览器连接多种数据库，浏览结构、编辑数据、执行 SQL 并管理访问权限。`

### 4. 游戏引擎：Wicked Engine

- 主仓库：https://github.com/turanszkij/WickedEngine
- 形态与平台：现代图形导向的 C++ 三维引擎，既可作为开发框架，也提供独立编辑器与 Lua 脚本；README 给出 Windows、Linux、macOS/iOS 构建方式，并列出 Vulkan、DirectX 12 与 Metal 后端。
- 许可证：MIT。
- 维护信号：主仓库远端 HEAD 于核验时解析为 `70ec32cc62f3dadbf796fd5574ff3e34c3c47301`；仓库提供持续构建的夜间编辑器包。
- 一手来源：[主仓库 README](https://github.com/turanszkij/WickedEngine)、[LICENSE](https://github.com/turanszkij/WickedEngine/blob/master/LICENSE.md)、[提交记录](https://github.com/turanszkij/WickedEngine/commits/master/)、[核验时 HEAD](https://github.com/turanszkij/WickedEngine/commit/70ec32cc62f3dadbf796fd5574ff3e34c3c47301)

建议描述：`现代 C++ 三维游戏引擎｜提供跨平台编辑器、Lua 脚本及 DirectX、Vulkan、Metal 实时渲染能力。`

### 5. 航海船舶：CANboat

- 主仓库：https://github.com/canboat/canboat
- 形态与平台：面向船载 NMEA 2000 CAN 网络的 C 与 Rust 命令行套件，可读取网关、解码 PGN、转换、回放和分析消息；可在 Linux、macOS 和 Windows 使用源码或发布包。
- 许可证：Apache-2.0。
- 维护信号：主仓库远端 HEAD 于核验时解析为 `1765550d6d69679e057bf9c5b6eaab448f3be7b9`；Releases 于 2026-08-02 发布 v8.0.0-beta1，并保留 v7.1.0 稳定版。
- 一手来源：[主仓库 README](https://github.com/canboat/canboat)、[构建文档](https://github.com/canboat/canboat/wiki/Building)、[LICENSE](https://github.com/canboat/canboat/blob/master/LICENSE)、[Releases](https://github.com/canboat/canboat/releases)

建议描述：`船载 NMEA 2000 命令行套件｜读取 CAN 网关、解码 PGN，并转换、回放和分析船舶电子网络消息。`

### 6. 3D 打印：OctoPrint

- 主仓库：https://github.com/OctoPrint/OctoPrint
- 形态与平台：面向消费级 3D 打印机的自托管 Python Web 服务，可上传 G-code、远程控制打印机、监控任务并通过插件扩展；适合 Raspberry Pi 与常规 Linux 主机。
- 许可证：AGPL-3.0。
- 维护信号：主仓库远端 HEAD 于核验时解析为 `096cf3c7f312245c049ecaf8f94ebea0e8fb19f3`；Releases 页面提供 OctoPrint 2.0 系列并记录安全修复与 Python 版本要求。
- 一手来源：[主仓库 README](https://github.com/OctoPrint/OctoPrint)、[LICENSE](https://github.com/OctoPrint/OctoPrint/blob/master/LICENSE.txt)、[Releases](https://github.com/OctoPrint/OctoPrint/releases)、[核验时 HEAD](https://github.com/OctoPrint/OctoPrint/commit/096cf3c7f312245c049ecaf8f94ebea0e8fb19f3)

建议描述：`自托管 3D 打印机 Web 控制台｜上传 G-code、远程控制和监控打印任务，并通过插件扩展工作流。`

## 未采用候选

- `dbeaver/dbeaver`、`sqlitebrowser/sqlitebrowser`、`prusa3d/PrusaSlicer`、`godotengine/godot` 与 `stride3d/stride`：已在全目录其他分类收录，避免重复 URL。
- `Floanter/Wicked-Engine` 等 Wicked Engine 分叉：不是项目当前主维护仓库；采用 README 指向的 `turanszkij/WickedEngine`。
- `canboat/canboat-rs`：README 明确说明代码已合并回 `canboat/canboat` 且旧仓库只读，因此采用仍维护的主仓库。
