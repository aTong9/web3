# NautilusTrader 与 FIRE Finance Workbench 集成研究

> 调研日期：2026-08-22  
> 范围：只判断技术与产品集成可行性，不授权实盘交易，不安装依赖、不连接账户、不下单。  
> 来源政策：仅使用 NautilusTrader 官方文档、官方 GitHub 仓库及其中的源码/配置。

## 结论

**可以集成，而且对本项目最有价值的角色是“独立的回测、Sandbox 和 Testnet 执行引擎”，不应作为
Vue 页面或 Cloudflare Worker 内的库直接嵌入。**

推荐保留当前系统的职责：

- Vue：研究界面、证据查看、人工确认与审计导入导出；
- Cloudflare Worker + D1：轻量控制面、权限、配置、证据摘要和现有 Paper/Testnet 记录；
- NautilusTrader sidecar/service：历史数据回放、事件驱动策略、模拟成交、实时行情、订单状态机、
  风险引擎与 Binance Testnet 适配。

首期只接 **离线回测结果导入**，第二期接 **只读 Sandbox/影子运行**，第三期才评估 **Binance
Testnet 双向同步**。不得让 NautilusTrader 获得 Binance Live 凭据，也不得把它接成网页发出的直接下单
代理。当前项目的 `research → Paper → Testnet` 顺序和 `liveTradingAuthorized: false` 必须保持不变。

## 1. 项目状态、版本与许可证

NautilusTrader 是一个 Rust-native、确定性事件驱动、多资产/多场所交易系统；Python 用作策略、配置和
编排控制面，也可完全使用 Rust 编写交易系统。官方称其覆盖研究、确定性模拟和实时执行，并让同一策略
在研究和实时环境复用。[官方概览](https://nautilustrader.io/docs/latest/concepts/overview/)

截至调研日，版本线正处于迁移期：

- 官方最新正式发布标签是预发布版 **v2.0.0rc3**；若排除预发布版，官方稳定包索引的 1.x 稳定线为
  **1.231.0**。
  [v2.0.0rc3 release](https://github.com/nautechsystems/nautilus_trader/releases/tag/v2.0.0rc3) ·
  [官方包索引](https://packages.nautechsystems.io/simple/nautilus-trader/)
- 官方 `master` 的 Python 项目配置为 **2.0.0rc3**，Python `>=3.12,<3.15`；Rust workspace 配置为
  **0.62.0**、Rust **1.97.1**。这说明 Python v2/Rust API 仍在 RC 演进中，不能混用 `latest` 文档、
  1.x 示例和 2.0 RC 类型定义。
  [Python 配置](https://github.com/nautechsystems/nautilus_trader/blob/master/python/pyproject.toml)
  · [Rust workspace 配置](https://github.com/nautechsystems/nautilus_trader/blob/master/Cargo.toml)
- 官方安装文档明确说明项目仍在活跃开发，版本间可能发生破坏性变化。
  [安装与版本政策](https://nautilustrader.io/docs/latest/getting_started/installation/#versioning-and-releases)

许可证为 **LGPL-3.0-only**。
[官方 LICENSE](https://github.com/nautechsystems/nautilus_trader/blob/master/LICENSE)
这通常允许本项目通过独立进程/API 使用未修改的库，但分发二进制、静态链接、修改 NautilusTrader
本身或打包进桌面产品时需单独做 LGPL 合规审查；本报告不是法律意见。官方还有独立商标政策，第三方
产品不得造成官方关联或认可的混淆。
[官方商标政策](https://github.com/nautechsystems/nautilus_trader/blob/master/TRADEMARK.md)

**版本建议：** 新原型优先锁定 `2.0.0rc3` + commit SHA 并接受 RC API 迁移成本；若团队暂时只接受
稳定包，则单独评估 `1.231.0`，不要混用两代 API。禁止使用浮动 `latest`。记录 Python 包版本、Rust
crate 版本、容器 digest、策略版本和数据目录 digest。

## 2. 架构与运行模型

核心组件包括 `MessageBus`、`Cache`、`DataEngine`、`ExecutionEngine`、`RiskEngine`、`Portfolio`
和 `Trader`。消息总线支持发布/订阅、请求/响应及类型化命令/事件；执行引擎负责订单生命周期、成交报告
和外部状态对账；风险引擎检查订单字段、余额、数量、名义价值、reduce-only 和速率限制。
[官方架构](https://nautilustrader.io/docs/latest/concepts/architecture/)

代码主体由 Rust crates 组成，通过 PyO3 暴露 Python API；官方预编译 wheel 在运行时不要求本机安装
Rust。网络侧使用异步运行时，节点自身是长生命周期事件循环，不是一次 HTTP 请求内完成的无状态函数。
[架构与 Python/Rust 边界](https://nautilustrader.io/docs/latest/concepts/architecture/#code-structure)

三个环境上下文含义不同：

| Nautilus 环境 | 数据 | 执行 | 在本项目中的建议用途 |
| --- | --- | --- | --- |
| Backtest | 历史数据 | 模拟成交 | 替代/补充分钟级回放与复杂成交模拟 |
| Sandbox | 实时数据 | 本地模拟场所 | 影子运行，验证实时调度、状态机和延迟 |
| Live | 实时数据 | 外部场所；可为 paper/demo/testnet/real | 仅允许连接 Binance Testnet；禁止 Live 资金 |

官方对环境的定义见[架构文档](https://nautilustrader.io/docs/latest/concepts/architecture/#environment-contexts)。
Backtest 和 Sandbox 使用模拟交易所；官方说明其模拟成交会生成确定性的 `TradeId`，便于去重和金丝雀
结果对比。[回测执行顺序](https://nautilustrader.io/docs/latest/concepts/backtesting/execution-flow/)

生产运行约束：

- 官方支持 Python 3.12–3.14；Linux wheel 需要 glibc 2.35+，支持 Ubuntu 22.04+ x86_64/ARM64、
  macOS 15 ARM64、Windows Server 2022 x86_64。
  [安装要求](https://nautilustrader.io/docs/latest/getting_started/installation/)
- LiveNode 应作为独立 Python 脚本或服务运行，不建议用 Jupyter；单进程只运行一个 LiveNode，多节点需
  多进程隔离；策略回调不得执行阻塞 I/O 或重计算。
  [LiveNode 配置指南](https://nautilustrader.io/docs/latest/how_to/configure_live_trading/)
- 官方提供 wheel 和容器；生产更适合固定 digest 的 Linux 容器，由 supervisor/Kubernetes/systemd
  管理重启、健康检查、日志和优雅停机。
  [官方仓库安装与 Docker](https://github.com/nautechsystems/nautilus_trader#docker)
- Redis 是可选的缓存/外部消息总线后端，PostgreSQL 可用于持久层；不用它们也可先做离线回测。
  [Cache 持久化](https://nautilustrader.io/docs/latest/concepts/cache/)

## 3. 数据、策略与执行能力

高层 `BacktestNode` 以配置和 `ParquetDataCatalog` 驱动批量回测；低层 `BacktestEngine` 适合直接控制。
两者都复用 Cache、MessageBus、Portfolio、Strategy、ExecutionAlgorithm 等生产组件。
[回测概念](https://nautilustrader.io/docs/latest/concepts/backtesting/)

数据模型可处理 quote、trade、bar、order book、mark price、index price、funding rate 和自定义数据。
自定义类型可以用 Python 或 Rust 定义，经统一路由，并注册 JSON 与 Arrow/Parquet 编解码。
[自定义数据与持久化](https://nautilustrader.io/docs/latest/concepts/custom_data/)

执行路径是 `Strategy → OrderEmulator/ExecutionAlgorithm/RiskEngine → ExecutionEngine →
ExecutionClient`，包含提交、修改、撤单、平仓、账户/订单查询，以及订单/持仓状态跟踪和对账。
[执行模型](https://nautilustrader.io/docs/latest/concepts/execution/)

### 与现有策略模型的语义差异

当前项目是 5 分钟 Cron 驱动的 TypeScript 决策与有限 Paper/Testnet adapter；NautilusTrader 是逐事件、
长驻、有内部时钟/Cache/Portfolio/订单状态机的完整引擎。不能简单地把现有 `decision` JSON 当作 Nautilus
Strategy，也不能让两个系统同时拥有同一订单的生命周期。

需要明确一个唯一执行所有者：

- **推荐：** Nautilus 拥有 Testnet 订单状态，D1 只保存其不可变事件投影和评审证据；
- **不推荐：** Worker 和 Nautilus 同时向 Testnet 下单或分别执行对账；这会破坏幂等、持仓闭合和
  `tradeId` 关联。

## 4. Binance Futures 与 Testnet

官方 Binance adapter 是 Rust 实现、通过公共配置/工厂暴露给 Python，明确支持 Spot、USDT-M Futures
和 COIN-M Futures；`BTCUSDT` 永续在 Nautilus 中标识为 `BTCUSDT-PERP.BINANCE`。
[Binance 集成概览](https://nautilustrader.io/docs/latest/integrations/binance/)

它支持 `BinanceEnvironment.LIVE`、`DEMO` 和 `TESTNET`，三者使用独立端点与凭据；Live 是默认值，
因此所有配置必须显式指定 `TESTNET` 或 `DEMO`，不能依赖默认值。官方将 `TESTNET` 描述为 legacy
测试网络，并建议新的 Futures 模拟交易优先用 `DEMO`；集成路线应先走 DEMO，只有需要复现现有
Testnet 证据时才单独验证 TESTNET。
[Binance environments](https://nautilustrader.io/docs/latest/integrations/binance/#environments)

USDT Futures 支持 market/limit/stop/market-if-touched/trailing-stop 等订单，支持 post-only、reduce-only、
对冲持仓 ID、订单状态、成交历史和实时状态更新；但 bracket order 尚未实现，hedge mode 下
`reduce_only` 受交易所限制，必须逐项对照现有 Worker 语义。
[Binance order capabilities](https://nautilustrader.io/docs/latest/integrations/binance/#order-capability)

adapter 内部使用 HTTP REST 和 WebSocket；官方明确指出低层 HTTP/WS 客户端不属于 Python 公共 API，
应通过 client config/factory 使用，而不是让本项目依赖其内部实现。
[Binance 公共 API 边界](https://nautilustrader.io/docs/latest/integrations/binance/#overview)

这意味着它可以替代当前 Worker 中的 Binance Testnet 网络与订单状态部分，但第一阶段不应直接替换：
先以相同历史数据和 Testnet 观测运行双轨对比，验证 symbol、position side、reduce-only、client order ID、
commission、funding、部分成交、超时恢复和对账语义完全一致。

## 5. API、序列化和存储集成

### Nautilus 提供什么

- 场所 adapters 自己消费交易所 REST/WebSocket；
- 内部 `MessageBus` 提供发布/订阅、请求/响应和命令/事件；可用 Redis 作为选择性外部 backing；
- 外部消息可使用 JSON/MessagePack，部分 schema 支持 Cap'n Proto/SBE；
- `ParquetDataCatalog` 使用 Arrow/Parquet 做历史数据和回测数据交换；
- Cache/Event Store 可承担恢复与审计，但其 API 仍在演进。

来源：[分布式与格式](https://nautilustrader.io/docs/latest/concepts/overview/#distributed) ·
[MessageBus](https://nautilustrader.io/docs/latest/concepts/architecture/#messagebus) ·
[事件溯源](https://nautilustrader.io/docs/latest/concepts/event_sourcing/)

### Nautilus 没有替本项目提供什么

官方文档没有定义一个可直接供 Vue/Cloudflare 调用的通用 HTTP“控制服务器”。官方公开入口是 Node、
Strategy、Actor、adapter factory 和消息总线。因此，如需 Web 控制面，应由本项目新增一个很薄的
**Nautilus Bridge Service**；这是基于官方公开接口的集成层，而不是调用未公开低层客户端。

建议 Bridge 只提供版本化、最小化 API：

| 方向 | 建议接口 | 安全性质 |
| --- | --- | --- |
| Worker → Bridge | 创建离线回测任务、启动/停止 Sandbox、读取健康状态 | 管理命令，强认证且默认拒绝 |
| Bridge → Worker | 上传批次结果、执行事件、校准观测、运行 manifest | 仅追加、幂等、签名/摘要校验 |
| Vue → Worker | 查看结果、人工确认、导出评审包 | 不直连 Bridge，不持有交易密钥 |

每条跨进程消息至少包含：`schemaVersion`、`eventId`、`runId`、`strategyVersion`、
`costModelVersion`、`instrumentId`、`environment`、`tsEvent`、`tsInit`、`payloadDigest`。订单命令额外带
稳定 `idempotencyKey` 和当前 D1 revision；回传事件保留 Nautilus `clientOrderId`、`venueOrderId`、
`tradeId`、commission、position side 和原始/规范化时间。

### Parquet 与 D1 的职责

- Parquet catalog：原始 tick/bar/order-book、完整回测输入、批量结果和可重放数据；
- D1：用户权限、运行索引、策略/成本版本、证据摘要、小型聚合指标和现有评审包；
- Object storage（以后可选）：Parquet 文件与 manifest；D1 仅存 URI、哈希、行数、时间范围。

不要把高频事件或 Parquet blob 写入 D1，也不要用 D1 替代 Nautilus 的运行时 Cache/Portfolio。

## 6. Vue + Cloudflare Worker/D1 兼容性

### 不可直接同进程运行

本项目 Worker 是 V8/workerd 中的 TypeScript/JavaScript 无状态请求与 Cron 运行时；Nautilus 要求 CPython
wheel 或原生 Rust binary、长驻事件循环、原生文件/Parquet 能力及进程生命周期。官方支持的平台清单也不
包含 Cloudflare Workers。因此，把 Nautilus wheel/crates import 到 `worker/index.ts` **不兼容**。

Electron 桌面包理论上可启动本地 sidecar，但不建议首选：跨平台 wheel/二进制体积、签名、自动更新、
进程监管和本地密钥面都会显著扩大风险。先采用独立 Linux 服务最清晰。

### 可通过进程边界集成

```text
Vue / Electron
      │ HTTPS（研究、审计、人工确认）
      ▼
Cloudflare Worker ─── D1（控制面与证据索引）
      │ mTLS/HMAC、版本化任务/事件 API
      ▼
Nautilus Bridge（Linux 容器）
      │ in-process public Node/MessageBus APIs
      ▼
Nautilus Backtest / Sandbox / Binance Testnet
      ├── ParquetDataCatalog
      └── Redis/PostgreSQL（按恢复需求选配）
```

Worker Cron 可创建“期望运行”记录，但不应承担 Nautilus node 的生命周期；sidecar 由自己的 supervisor
管理。Bridge 回写证据后，当前 readiness/校准系统重算，而不是信任 Bridge 自报的 `ready=true`。

## 7. 安全与交易边界

1. **硬禁 Live：** 配置 schema 只允许 `BACKTEST | SANDBOX | BINANCE_TESTNET`；Bridge 构建中拒绝
   `BinanceEnvironment.LIVE`，不要仅靠 UI 隐藏。
2. **凭据隔离：** Testnet key 只放在 sidecar 的 secret manager，不进入 Vue、D1、评审包、日志或 Worker
   环境；使用仅 Testnet、最小权限、禁提现、IP allowlist 的独立凭据。
3. **单一执行所有者：** 接管 Testnet 后禁用 Worker 原 Testnet 下单路径；迁移期间双轨只能一边执行，
   另一边 shadow。
4. **默认失效关闭：** 未知环境、版本不匹配、时钟漂移、数据陈旧、对账失败、状态不闭合、重复幂等键或
   Bridge 失联均禁止新开仓；平仓/撤单能力按预先演练的故障策略保留。
5. **命令面最小化：** Vue 不发送任意策略代码、Python import path、文件路径或原始订单；只引用服务端
   allowlist 中已签名的策略 manifest。
6. **证据不可自证：** Nautilus 结果必须携带原始输入范围、catalog digest、配置、版本和 run manifest；
   当前 Worker 重新计算门槛，不接受外部布尔结论。
7. **进程隔离与监控：** 一个 LiveNode 一个进程，设置资源限制、健康/心跳、日志脱敏、磁盘限额、优雅
   停机和 watchdog。官方也要求 LiveNode 独立服务运行并避免阻塞事件循环。
8. **供应链：** 固定 wheel/container digest 与 commit SHA；官方提供 SLSA provenance、容器签名和 SBOM，
   部署前验证。
   [官方制品完整性说明](https://github.com/nautechsystems/nautilus_trader#verifying-build-provenance)
9. **Fail-fast 外层恢复：** Nautilus 对无效价格、数量、时间等强调 fail-fast，panic 可终止进程；外部 supervisor
   必须将重启视为异常，恢复前完成 cache/venue reconciliation，不能自动继续开仓。
   [数据完整性政策](https://nautilustrader.io/docs/latest/concepts/architecture/#data-integrity-and-fail-fast-policy)
10. **资格与地区限制不变：** adapter 可用不代表用户有权使用 Binance；不得用代理、中转或 sidecar 部署
    绕过交易所/地区限制。

## 8. 推荐集成路线

### Phase A：离线可行性原型（推荐立即做）

不接任何账户，只做 BTCUSDT-PERP 历史回测：

1. 锁定版本与容器 digest；
2. 将现有 1m/5m bar 映射成 Nautilus `Bar`，写入独立 Parquet catalog；
3. 复刻一条最小策略，不复刻整个 UI/Worker；
4. 用相同样本、手续费、滑点、资金费和退出优先级比较两套结果；
5. 输出 schema v1 JSON manifest，导入现有综合评审包但标记为 `external-engine-shadow`。

通过标准：交易数、方向、入场/退出时间、同柱冲突、净 PnL 和 MAE 的差异都能逐笔解释；不能只比较总
收益。此阶段不能证明可以进入 Testnet。

### Phase B：Sandbox 影子运行

使用实时公共行情 + 本地模拟执行。验证断线重连、时钟、重复事件、部分成交模型、进程重启、每日文件
滚动和 Bridge 幂等，不向交易所发私有请求。

通过标准：连续运行至少一个完整评审窗口；所有计划、事件和恢复动作可按 runId/tradeId 重放；Bridge
断线不会制造重复订单或伪造成功证据。

### Phase C：Binance Testnet 单一执行者

在用户资格确认后才创建 Testnet key。先只允许最小名义金额、单标的、单策略、单持仓；完成撤单、部分
成交、超时、未知状态、断线和重启对账演练后，才允许它取代当前 Worker 的 Testnet adapter。

通过标准至少沿用本项目当前固定门槛：100 笔有效成交、开/平各 40 笔、40 个闭合往返、手续费证据覆盖、
延迟/拒单/恢复依赖/幂等和时效约束全部通过。Nautilus 自带风控不能替代现有评审闸门。

### 明确不做

- 不把 Nautilus 编译进 Cloudflare Worker；
- 不让 Vue/Electron 直接持有 key 或访问执行端口；
- 不在 Jupyter 中长期运行节点；
- 不同时启用 Worker 与 Nautilus 的 Testnet 下单；
- 不因回测对齐或 Testnet 通过而增加 Binance Live 适配；
- 不把“同一策略可跨 backtest/live”误解为“历史结果保证实时盈利”。

## 9. 最终判断

| 维度 | 判断 | 原因 |
| --- | --- | --- |
| 回测能力 | 高度适合 | 事件驱动、同一核心、Parquet catalog、模拟交易所与成本/延迟模型 |
| Sandbox/影子运行 | 高度适合 | 官方环境，实时数据配本地模拟执行 |
| Binance USD-M Testnet | 技术上适合 | 官方 adapter 明确支持 USD-M 和 Testnet/Demo |
| 直接嵌入 Vue/Worker | 不适合 | 原生 Rust/CPython、长驻事件循环、文件与进程要求不匹配 |
| 通过独立服务集成 | 适合 | REST/消息桥可保持 UI、D1 与执行引擎职责隔离 |
| 立即替换现有系统 | 不适合 | 语义迁移、版本 RC、双执行者、证据格式与运维风险尚未验证 |
| 真实资金交易 | 不在当前范围 | 技术能力不等于收益、资格、安全或实盘授权 |

因此，**建议集成，但定位为可替换的外部执行/回测引擎，并从离线影子适配器开始。** 它能补强当前项目
在事件级回测、订单状态机、对账、模拟成交和 venue adapter 上的能力；当前 Vue、Worker、D1 的研究、
权限和证据闸门仍应保留为独立控制面。

## 官方来源索引

- [NautilusTrader 官方仓库](https://github.com/nautechsystems/nautilus_trader)
- [官方概览](https://nautilustrader.io/docs/latest/concepts/overview/)
- [官方架构](https://nautilustrader.io/docs/latest/concepts/architecture/)
- [官方安装要求](https://nautilustrader.io/docs/latest/getting_started/installation/)
- [官方回测文档](https://nautilustrader.io/docs/latest/concepts/backtesting/)
- [官方 LiveNode 配置](https://nautilustrader.io/docs/latest/how_to/configure_live_trading/)
- [官方执行模型](https://nautilustrader.io/docs/latest/concepts/execution/)
- [官方 Binance adapter](https://nautilustrader.io/docs/latest/integrations/binance/)
- [官方自定义数据与 Parquet](https://nautilustrader.io/docs/latest/concepts/custom_data/)
- [官方 Cache](https://nautilustrader.io/docs/latest/concepts/cache/)
- [官方事件溯源](https://nautilustrader.io/docs/latest/concepts/event_sourcing/)
- [官方 Python 项目配置](https://github.com/nautechsystems/nautilus_trader/blob/master/python/pyproject.toml)
- [官方 Rust workspace 配置](https://github.com/nautechsystems/nautilus_trader/blob/master/Cargo.toml)
- [官方许可证](https://github.com/nautechsystems/nautilus_trader/blob/master/LICENSE)
