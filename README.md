# 个人金融工作台

一个文字优先的个人金融研究入口，用来集中管理宏观、股票、加密资产、新闻与常用工具。

模块	更新频率
全球市场快讯	每15分钟
KOL监控	每6小时，约02:15、08:15、14:15、20:15
美股/A股热门股票	工作日18:20、次日06:30
美股市值前十与PE	跟随热门股票，工作日18:20、次日06:30
A股行业基金	每天18:30
美股基金与定投额度	每天09:15
跨资产驾驶舱	工作日数据次日07:20更新
GitHub Pages部署	main每次提交后；上述数据任务成功后也会自动部署


## 当前功能

- 按主题浏览 `src/data/webstack.yml` 中的全部网站资源
- 搜索站点名称、描述和域名
- 按分组筛选资源
- 使用浏览器本地存储收藏常用站点
- 比较中国市场的美股场内 ETF 与场外基金，可按规模和综合费率排序
- 跟踪美股与A股每日、每周热门股票 Top 20
- 每天自动更新场外基金的申购、定投状态和参考额度
- 监控A股行业与主题 ETF，按日、周、月、季度、半年、今年以来和近一年涨幅排序
- 在行情、热门股票和巨头估值模块展示最新价格，在基金模块同时展示场内价格和最新净值
- 每个自动数据模块展示最近更新时间与北京时间下次预计更新时间
- 对美股基金与A股行业 ETF 展示年运作费、购买手续费、佣金假设、溢折价和首年成本估算
- 跨平台监控 KOL 公开内容并自动识别内容中的股票提及
- 聚合全球市场新闻与央行、监管机构公告，按市场影响和发布时间筛选
- 跨资产驾驶舱统一监控股票、债券、外汇、商品和加密资产，并计算60日相关性矩阵与传导链
- 全球资产量化信号台按跨资产方向、价格动量和证据强度排列买入、持有、减仓候选
- 美股前十大期权候选使用可配置的 Forward PE 纪律线、20%缓冲和纳指中期环境，不把高估值自动解释为裸卖 Call
- 量化页面提供浏览器本地模拟信号账本；当前只跟踪标的价格，不模拟期权 IV、Theta 和成交滑点
- 通过资讯台快速打开常用市场信息源
- 响应式左右管理布局，支持浅色、深色模式与系统主题初始化

网站清单由 YAML 文件统一维护。界面不依赖站点 Logo 或内容图片，所有外部网站均在新标签页打开。

## 开发

```bash
npm install
npm run dev
```

开发服务器默认运行于 `http://localhost:2333`。

## 验证与构建

```bash
npm run type-check
npm run lint
npm run build
```

项目通过 GitHub Pages 部署，Vite 基础路径为 `/web3/`。推送或合并提交到 `main` 后，
`.github/workflows/deploy.yml` 会先执行类型检查和生产构建，通过后自动发布；也支持手动触发。
构建会生成与入口相同的 `404.html` 作为 Vue Router 回退，因此直接刷新子路由不会落到 Pages 的404页面。

## 数据维护

资源数据位于 `src/data/webstack.yml`，结构为：

```yaml
- taxonomy: 分类
  list:
    - term: 分组
      links:
        - title: 网站名称
          url: https://example.com
          description: 网站用途
```

历史 `logo` 字段可以继续保留，但当前文字界面不会读取它。

## 美股基金数据

基金清单位于 `src/data/us-funds.json`，覆盖纳斯达克 100 与标普 500 的主流境内 QDII
产品。运行以下命令可以手动刷新：

```bash
npm run update:funds
```

`.github/workflows/update-us-funds.yml` 每天北京时间 09:15 自动更新数据。额度采用天天基金销售
渠道展示值，并保留来源页面链接；实际可购买额度仍以基金公司公告和下单渠道为准。

## A股行业数据

行业榜数据位于 `src/data/a-share-sectors.json`。当前使用行业内规模最大的 ETF 作为代表，运行
以下命令可手动更新：

```bash
npm run update:a-share
```

`.github/workflows/update-a-share-sectors.yml` 每天北京时间 18:30 更新收盘数据。更新过程会同时
检查全部基金，任何一只抓取失败都不会覆盖上一版完整数据。

## 热门股票

运行 `npm run update:hot-stocks` 可刷新 `src/data/hot-stocks.json`：

- A股日榜按成交额排序，周榜按近5日涨跌幅绝对值排序；候选池取成交活跃的前200只股票。
- 美股日榜按 Nasdaq 成交量排序，周榜按最近5个交易日累计成交量排序，并排除 ETF、权证、优先股等非普通股。
- 两个市场均展示日榜与周榜前20名；抓取失败时保留上一版市场数据并标记为过期，避免空榜覆盖。

`.github/workflows/update-hot-stocks.yml` 在交易日自动刷新，榜单是市场关注度代理，不代表投资建议。

美股市值前十估值数据位于 `src/data/us-megacaps.json`，运行 `npm run update:us-megacaps`
可以手动刷新。股票范围与市值来自 Nasdaq，当前和市场预期 Forward PE 来自 StockAnalysis，
长期 PE 中枢为 CompaniesMarketCap 最近5个可用年度正 PE 的中位数。财报结果、下一季度和年度 EPS
共识、预期区间及近4周分析师上修/下修来自 Nasdaq；未正式公布的下一次财报日期显示“待公司公布”，
不会自行推算日期或用估算值填充。

## KOL监控

在 `src/data/kols.yml` 中增加名称和主页 URL，即可加入监控：

```yaml
- name: KOL名称
  url: https://平台主页地址
  enabled: true
  # feedUrl: https://可选的RSS或Atom地址
  # tags: [美股, 宏观]
```

运行 `npm run update:kols` 可手动解析；GitHub Actions 每6小时自动执行一次。YouTube 和标准
RSS/Atom 支持内容列表同步，普通网页支持公开元数据解析。小红书、微信和B站可能限制自动抓取，
此时页面会明确显示降级状态；配置可访问的 `feedUrl` 后可恢复完整内容同步。

## 量化信号与模拟记录

量化信号模块的深层接口位于 `src/utils/quant-signals.ts`。页面只传入跨资产数据、美股巨头估值和
策略配置，模块统一返回全球资产排名、期权候选、证据强度、风险闸门和方法限制。

当前期权规则使用35倍 Forward PE 纪律线和20%偏离缓冲，并优先评估365–730 DTE、Delta 0.60–0.80
的一至两年 LEAPS：估值、纳指中期方向和 EPS 修正共同偏多时给出 Long Call 或看涨价差研究模板；
高估值叠加市场及 EPS 修正偏弱时只给出看跌价差研究模板。进入财报前14天时自动降级为事件风险等待，
35倍以上不代表允许卖出裸 Call。所有候选在实时期权链、隐含波动率和流动性接入前都标记为不可执行。

量化页面优先连接 `web3-quant-api` Cloudflare Worker：服务端从仓库读取最新版跨资产与美股巨头数据，
生成统一快照并存入 D1；工作日北京时间18:45和次日07:45自动刷新。模拟信号账本按浏览器生成的匿名
客户端 ID 保存在 D1，仅记录信号时点的标的价格和后续价格变化。云端不可达时，页面会明确显示降级状态，
继续使用随构建发布的数据与浏览器 `localStorage`，不会阻塞阅读。

Cloudflare 相关代码位于 `worker/`，配置位于 `wrangler.jsonc`。本地初始化与验证使用
`npm run cloudflare:db:local`、`npm run cloudflare:check` 和 `npm run cloudflare:dev`；远端部署使用
`npm run cloudflare:deploy`。生产 API 为 `https://web3-quant-api.binson0426.workers.dev`，前端可通过
`VITE_QUANT_API_BASE` 覆盖。当前服务不保存券商密钥、不连接券商且不能下单；接入真实券商前必须增加
认证、密钥托管、幂等订单、组合级仓位风控、独立模拟账户和逐笔人工确认。

## 全球市场快讯

运行 `npm run update:news` 可手动刷新 `src/data/market-news.json`。GitHub Actions 每15分钟聚合
GDELT、CNBC、华尔街日报、美联储、欧洲央行和美国证监会公开信息，自动去重、识别影响资产并分为紧急、高、中、低四级。
页面打开后每2分钟检查一次仓库中的最新版数据。定时任务可能因 GitHub Actions 排队而延迟，本模块不是
交易所级实时行情或完整新闻数据库。

英文标题通过可替换的翻译适配器生成中文译文，同时永久保留原文供核对。默认使用 MyMemory，已有译文会
按新闻 ID 缓存，只有新增标题需要调用翻译服务；可设置 `MYMEMORY_EMAIL` 提高公开 API 的使用配额。

## 跨资产市场驾驶舱

运行 `npm run update:cross-asset` 可刷新 `src/data/cross-asset.json`。当前使用 FRED 日度与月度序列
计算相对表现和最近60个共同观测日的相关性矩阵，GitHub Actions 在工作日自动更新。资金流字段当前
明确标记为价格动量代理；真实ETF申赎、CFTC持仓、市场广度、估值分位和链上指标将在获得稳定数据
适配器后接入，不使用估算数据冒充。

## 免责声明

本站内容仅供个人研究与资料整理，不构成任何投资建议。第三方链接的内容和可用性由对应网站负责。
