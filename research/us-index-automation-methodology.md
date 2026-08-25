# 美国核心指数自动更新、龙头回测与定投计算方法

> 研究日期：2026-08-25  
> 适用对象：Invesco QQQ（跟踪 Nasdaq-100）与 S&P 500 的可投资代理产品（默认 SPY）。  
> 目标：规定后续自动采集、历史快照、龙头跟随回测和定投计算器的可复核口径。  
> 边界：税费因个人身份、账户类型和税收居民地而异，第一版明确排除税；结果仅供研究，
> 不构成收益承诺或投资建议。

## 1. 必须先固定的对象与回报口径

页面中的三个对象不能混用：

| 对象 | 用途 | 回报口径 |
| --- | --- | --- |
| Nasdaq-100 / S&P 500 指数 | 解释构建规则、成分变化和理论基准 | 明确标注 PR（价格）、TR（总回报）或 NTR（税后净总回报） |
| QQQ / SPY ETF | 普通投资者实际可买的代理产品 | 市场成交价或 NAV；基金费用已在资产净值中持续体现 |
| 每期龙头组合 | 检验“跟买重仓股”假设 | 与对应 ETF 使用完全相同的现金流、执行日和分红政策 |

默认可投资基准为 `QQQ` 和 `SPY`。QQQ 当前总费率为 0.18%；SPY 当前总费率为
0.0945%。费率必须做成带生效区间的版本记录，而不是永久常量。Invesco 明确 QQQ 跟踪
Nasdaq-100，且基金市场回报反映费用；State Street 明确 SPY 追踪 S&P 500、业绩包含分红和
资本利得再投资并扣除费用。[Invesco QQQ 官方页](https://www.invesco.com/qqq-etf/en/home.html)、
[QQQ SEC 文件：0.18% 单一管理费](https://www.sec.gov/Archives/edgar/data/1067839/000168035925000676/invescoqqq1485apos8262025.htm)、
[SPY 官方产品页](https://www.ssga.com/us/en/individual/etfs/state-street-spdr-sp-500-etf-trust-spy)、
[SPY 2026 SEC Prospectus](https://www.sec.gov/Archives/edgar/data/884394/000119312526022775/d77353d497.htm)。

### 费用不得重复扣除

- 用 QQQ/SPY 的真实市场价、NAV 或 `adjclose` 计算历史回报时，基金日常运营费用已经反映在
  基金资产净值和价格路径中，**不得再按费率逐日扣一次**。
- 计算器仍要展示“管理费已内含”，并可用同期平均资产乘费率给出近似费用影响说明，但不能把
  这个说明值再次从最终资产中减去。
- 只有使用不含产品费用的指数 TR 序列构造“理论 ETF”时，才按相应日期生效的费率逐日计提；
  该结果必须标为模拟值，不能冒充基金实际业绩。
- 交易佣金、平台费、买卖价差、滑点应作为用户可选参数单独计算，不能混入 expense ratio。

S&P DJI 的标准定义是：PR 不处理普通现金股息，TR 在除息日收盘按税前股息再投资，NTR 则在
扣除适用预提税后再投资。第一版指数研究比较应选 **gross total return（TR）**；普通投资者
计算器应优先使用实际 ETF 的总回报路径，并明确税未建模。
[S&P DJI Index Mathematics Methodology](https://www.spglobal.com/spdji/en/documents/methodologies/methodology-index-math.pdf)。

## 2. 自动数据获取设计

自动化拆为两条互相独立的证据链：

1. **官方结构链**：Invesco、Nasdaq、S&P DJI、State Street 和 SEC 文件，负责持仓、权重、
   方法、费率、分配记录及其 `asOf` / `publishedAt`。
2. **市场时序链**：服务端使用 `yahoo-finance2` 获取日线、股息和拆股事件。它是非官方 Yahoo
   客户端，数据可缺失、改写或因退市而不可用，因此只能作为行情计算来源，不能替代官方成分
   证据；每次入库须保留原始响应摘要、抓取时间和校验状态。

不得从浏览器直接请求 Yahoo；应由 Worker 或受控的服务端任务调用。使用 v3/v4 类实例 API，
并固定精确依赖版本：

```ts
const result = await yahooFinance.chart(symbol, {
  period1,
  period2,
  interval: '1d',
  events: 'div|split',
  return: 'array',
})
```

`chart` 的数组结果包含日 OHLCV、可选 `adjclose`，以及 dividends / splits 事件；项目源码也
明确提示退市证券的全部历史数据可能不可用。任务要对空报价、重复事件、币种变化、缺失交易日、
无效代码和校验异常降级处理，不得用零值静默填补。
[yahoo-finance2 chart 官方源码与说明](https://github.com/gadicc/yahoo-finance2/blob/dev/src/modules/chart.ts)。

### 建议更新节奏

| 数据 | 节奏 | 触发和验收 |
| --- | --- | --- |
| QQQ、SPY 与龙头证券日线/股息/拆股 | 每个美股交易日收盘后 2—4 小时；次日补查一次 | 仅写入完整交易日；按 `symbol + date` 幂等；最近 10 个交易日滚动重取以接收修订 |
| QQQ 官方持仓 | 每个交易日一次 | 保存源文件哈希和官方 `asOf`；日常展示可更新，策略快照仍按月末冻结 |
| S&P 500 官方成分、前十大与行业 | 每月末冻结；重大公告后补采 | 不把网页抓取时间当成生效时间；无逐只官方权重时保持 `null` |
| 龙头策略快照 | 每月末；另存季度/年度标签 | 只使用收盘后已公开资料；记录 `publishedAt`，下一交易日才允许成交 |
| Nasdaq-100 重构/再平衡 | 关注 3、6、9、12 月，公告期每日检查 | Nasdaq-100 年度重构、季度再平衡；特殊调整和 Fast Entry 单独记录 |
| S&P 500 成分变化 | 每周检查公告，事件驱动更新 | S&P 500 没有固定年度重构，不能只靠季度任务 |
| 费率、Prospectus、方法文件 | 每周检查 URL/ETag/哈希；季度强制复核 | 变化生成新版本并人工复核，禁止覆盖历史生效区间 |
| 历史回填与质量巡检 | 每周 | 查缺失交易日、异常跳变、拆股前后连续性、股息重复、快照发布日期倒挂 |

Nasdaq-100 当前方法规定 12 月年度重构、3/6/9/12 月再平衡，并允许特殊再平衡及特定快速纳入；
S&P 500 由委员会按需调整，股数通常按季度更新。因此两者不能使用同一个“季度换仓”假设。
[Nasdaq-100 Index Methodology](https://indexes.nasdaqomx.com/docs/methodology_NDX.pdf)、
[S&P U.S. Indices Methodology](https://www.spglobal.com/spdji/en/documents/methodologies/methodology-sp-us-indices.pdf)。

## 3. “每期重仓龙头”定义

建议页面允许 `Top 1 / Top 3 / Top 5 / Top 10`，默认 Top 5，并提供两种权重：

- `official_weight`：按快照中的官方证券权重同比例归一化，最接近“跟着指数重仓买”。
- `equal_weight`：等权，回答龙头名单本身是否有效，减少最大一只股票对结果的支配。

“每期”默认月末，另可选择季度末。每个快照必须同时保存：

- `asOf`：持仓权重所对应的市场时点；
- `publishedAt`：数据首次可被本系统观察到的时点；
- `effectiveAt`：指数调整的官方生效时点（若有）；
- `capturedAt`：系统抓取时点；
- 原始来源 URL、内容哈希、证券行排名、公司归并键和权重口径。

Alphabet 等多股权类别默认按**证券行**排名和交易；另提供公司合并视图用于解释集中风险，但不应
把两个股权类别先合并后又重复买入。

### 历史数据的硬边界

不能使用今天的成分列表、今天的前十大或当前存活证券去重建过去组合；这会造成幸存者偏差和
前视偏差。公开官网通常只保证当前快照，不保证完整、机器可读的历史成分与历史权重。正确做法是：

- 从系统开始运行之日起，持续归档官方快照，形成可复演的 prospective history；
- 旧时期只有在取得当时发布的官方文件并能确认发布日期时才允许回填；
- 缺少历史权重、发布时点或退市证券行情时，该期标为 `unavailable`，不得用当前数据替代；
- 官方指数历史成分若受许可限制，只保存允许存储和展示的字段，并记录许可证版本。

## 4. 龙头跟随回测

### 4.1 默认可执行规则

1. 在 `publishedAt` 之前策略不可见该快照。
2. 调仓日为 `max(asOf, publishedAt, effectiveAt)` 之后的**下一个共同交易日**。
3. 默认用下一个共同交易日收盘价成交；可选开盘价，但所有组合和基准必须一致。
4. 标的当天停牌或无有效价格时保留现金，不允许用最后价格假装成交；超过五个交易日仍无价格则
   该期标为不完整。
5. 支持碎股时按目标金额成交；不支持碎股时向下取整并保留现金。
6. 持有到下一可执行快照，股息默认在除息日形成应收现金并在支付日后的下一个共同交易日再投资；
   另提供“股息留现金”。若行情源没有支付日，优先用基金/发行人的官方分配记录补齐；仍缺失时
   只能按除息日收盘再投资并将该期标为 `ex_date_approximation`。拆股按事件比例调整份额和成本，
   不产生收益。
7. 调仓手续费、滑点和价差按用户参数计入；默认 0 仅代表理想化场景，结果必须显示该假设。
8. 组合退市、并购和分拆必须依官方公司行动或可核验事件处理；无法处理时停止该路径并显示缺口，
   不能删除亏损证券后继续计算。

### 4.2 公平比较

龙头组合与 QQQ/SPY 基准必须从相同日期、相同初始资金和相同后续现金流出发。每笔定投在两边
同日发生。基准使用 ETF 的实际可投资总回报路径；若以 raw close + distribution events 模拟，
则基准与龙头都使用同一股息再投资规则。不得一边使用含息 `adjclose`、另一边只用不含息 close。

输出至少包括：

- 期末资产、总投入、总收益率、资金加权回报 XIRR、时间加权回报；
- 年化波动率、最大回撤、回撤持续时间、最好/最差年度；
- 相对 ETF 的超额收益、跟踪差、胜出期比例、换手率和交易成本；
- 股息贡献、现金拖累、费用口径、缺失数据期数；
- 滚动 1/3/5 年胜率，而不只展示一个起止点结论。

“是否大于指数”的页面结论必须写成特定样本期和假设下的历史结果。还应提供 Top N、等权/官方
权重、月度/季度换仓、含/不含交易摩擦的敏感性矩阵，避免挑选唯一有利参数。

## 5. 定投计算器

### 输入

- 产品：QQQ / SPY（未来可扩展到其他明确的 S&P 500 ETF，不能只写“标普500”）；
- 开始与结束日期、首次投入、每期金额；
- 频率：每周 / 每月 / 每季度；指定日（如每月 1、15、最后一日）；
- 非交易日规则：默认顺延至下一交易日，可选前移；
- 成交价格：默认收盘价，可选开盘价；
- 分红：默认再投资，可选留现金；再投资时点按上述规则；
- 碎股：允许 / 不允许；
- 每笔佣金、固定平台费、滑点/价差基点；
- 币种显示和可选汇率转换；美元资产计算本体保持 USD，汇率收益单独拆分；
- 税：第一版固定为“不计税”，UI 不提供虚假的通用税率。

### 计算顺序

1. 按用户日历生成计划日期，再映射到所选规则下的有效交易日。
2. 交易价应用滑点，扣除佣金和平台费后购买可得份额；不足一股时按碎股规则处理。
3. 每个股息事件按除息日前持有份额计算应收；选择再投资时，在支付日后的下一有效交易日买入。
4. 拆股调整份额；价格路径与份额只能调整一次。
5. 末日按有效收盘价估值，分别报告证券市值、现金、累计股息、总费用和总投入。

建议提供三条可视化曲线：总投入、含分红资产、假设不再投资分红的资产；并列显示一次性投入、
固定日期定投和“任意交易日差异”对照。高级功能可增加：错过最好若干交易日的脆弱性、不同起始
月份的滚动结果、目标金额反推月供、通胀调整后的实际购买力，以及 QQQ/SPY 50:50 自定义组合。

### `adjclose` 与事件法只能二选一

- 快速总回报图可使用 `adjclose`，但不得再把 dividend 和 split 事件加一次。
- 需要逐笔展示分红、真实现金和再投资份额时，使用 raw OHLC + dividend/split events，自行维护
  份额；此模式不再用 `adjclose` 计算资产。
- 生产实现应以事件法为权威账本，并用 `adjclose` 作为合理区间校验。两者差异超过阈值时暂停发布。

## 6. 建议 JSON 架构

以下是一份逻辑交换格式；落库时可正规化为 source、snapshot、holding、price、event、fee_version、
run 等表。所有时间均为带时区 ISO 8601，交易日另存 `YYYY-MM-DD`。

```json
{
  "schemaVersion": 1,
  "dataset": {
    "id": "us-core-indexes",
    "generatedAt": "2026-08-25T12:00:00Z",
    "status": "complete",
    "warnings": []
  },
  "products": [
    {
      "id": "qqq",
      "ticker": "QQQ",
      "tracksIndexId": "nasdaq100",
      "currency": "USD",
      "feeVersions": [
        {
          "effectiveFrom": "2025-12-20",
          "effectiveTo": null,
          "grossExpenseRatioPct": 0.18,
          "sourceId": "sec-qqq-sai-2025"
        }
      ]
    },
    {
      "id": "spy",
      "ticker": "SPY",
      "tracksIndexId": "sp500",
      "currency": "USD",
      "feeVersions": [
        {
          "effectiveFrom": null,
          "effectiveTo": null,
          "grossExpenseRatioPct": 0.0945,
          "verifiedAsOf": "2026-01-26",
          "sourceId": "sec-spy-prospectus-2026"
        }
      ]
    }
  ],
  "snapshots": [
    {
      "id": "qqq-2026-06-30",
      "objectId": "qqq",
      "objectType": "etf_holdings",
      "asOf": "2026-06-30T20:00:00-04:00",
      "publishedAt": "2026-06-30T22:15:00-04:00",
      "effectiveAt": null,
      "capturedAt": "2026-07-01T03:00:00Z",
      "sourceId": "invesco-qqq-holdings",
      "sourceHash": "sha256:...",
      "weightBasis": "net_assets_pct",
      "classificationSystem": "ICB",
      "quality": { "sumWeightPct": 100.0, "status": "verified", "issues": [] },
      "holdings": [
        {
          "rank": 1,
          "ticker": "NVDA",
          "securityId": "US67066G1040",
          "companyKey": "nvidia",
          "name": "NVIDIA Corp.",
          "weightPct": 8.7,
          "sector": "Technology"
        }
      ]
    }
  ],
  "marketSeries": [
    {
      "symbol": "QQQ",
      "date": "2026-06-30",
      "currency": "USD",
      "open": 0,
      "high": 0,
      "low": 0,
      "close": 0,
      "adjClose": 0,
      "volume": 0,
      "source": "yahoo-finance2",
      "capturedAt": "2026-07-01T03:00:00Z"
    }
  ],
  "corporateActions": [
    {
      "symbol": "QQQ",
      "type": "dividend",
      "exDate": "2026-06-22",
      "payDate": null,
      "amount": 0,
      "currency": "USD",
      "source": "yahoo-finance2",
      "verifiedByOfficialDistribution": false
    }
  ],
  "strategyRuns": [
    {
      "id": "run-...",
      "createdAt": "2026-08-25T12:00:00Z",
      "snapshotIds": ["qqq-2026-06-30"],
      "benchmarkProductId": "qqq",
      "strategy": { "topN": 5, "weighting": "official_weight", "rebalance": "monthly" },
      "execution": {
        "timing": "next_common_trading_day_close",
        "fractionalShares": true,
        "dividendPolicy": "reinvest_after_pay_date",
        "commissionUsd": 0,
        "slippageBps": 0,
        "taxPolicy": "excluded"
      },
      "dataCutoff": "2026-08-24T23:59:59Z",
      "result": { "status": "complete", "metrics": {}, "missingPeriods": [] }
    }
  ]
}
```

示例中的行情和股息数值 `0` 只是字段占位，绝不能作为真实数据写入生产库。`securityId` 应优先
使用 ISIN/CUSIP 等稳定标识；ticker 变化时保留别名历史。

## 7. 发布闸门

一次自动更新只有同时满足以下条件才能成为页面“最新已验证”版本：

- 官方快照有可识别的 `asOf`，且来源哈希与上一版可追踪；
- 权重合计在预设容差内，排名无重复，证券标识映射无冲突；
- 行情交易日与交易所日历一致，拆股前后没有未解释的价格断层；
- 股息事件未被 `adjclose` 和现金账本重复计算；
- 费率版本覆盖整个测算区间，且没有重叠或空洞；
- 龙头组合不存在未来快照参与过去交易；
- 基准与策略现金流、成交时点、分红规则一致；
- 输出展示 `dataCutoff`、缺失期、来源状态和税费假设。

若任一关键条件失败，保留上一份已验证数据，显示“更新失败/部分数据”，并保存错误证据；不得用
当前成分、零价格或估算权重悄悄补齐。

## 8. 官方来源清单

- [Invesco QQQ 官方页](https://www.invesco.com/qqq-etf/en/home.html)
- [QQQ SEC SAI：费用结构](https://www.sec.gov/Archives/edgar/data/1067839/000168035925000676/invescoqqq1485apos8262025.htm)
- [QQQ SEC 半年报：持仓快照示例](https://www.sec.gov/Archives/edgar/data/1067839/000119312526250483/8deb6f921189c0e.htm)
- [Nasdaq-100 Index Methodology](https://indexes.nasdaqomx.com/docs/methodology_NDX.pdf)
- [S&P 500 官方页](https://www.spglobal.com/spdji/en/indices/equity/sp-500/)
- [S&P U.S. Indices Methodology](https://www.spglobal.com/spdji/en/documents/methodologies/methodology-sp-us-indices.pdf)
- [S&P DJI Index Mathematics Methodology](https://www.spglobal.com/spdji/en/documents/methodologies/methodology-index-math.pdf)
- [SPY 官方产品页](https://www.ssga.com/us/en/individual/etfs/state-street-spdr-sp-500-etf-trust-spy)
- [SPY 2026 SEC Prospectus](https://www.sec.gov/Archives/edgar/data/884394/000119312526022775/d77353d497.htm)
- [yahoo-finance2 chart 官方源码与说明](https://github.com/gadicc/yahoo-finance2/blob/dev/src/modules/chart.ts)
