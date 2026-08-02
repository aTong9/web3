# 个人金融工作台

一个文字优先的个人金融研究入口，用来集中管理宏观、股票、加密资产、新闻与常用工具。

## 当前功能

- 按主题浏览 `src/data/webstack.yml` 中的全部网站资源
- 搜索站点名称、描述和域名
- 按分组筛选资源
- 使用浏览器本地存储收藏常用站点
- 比较中国市场的美股场内 ETF 与场外基金，可按规模和综合费率排序
- 跟踪美股与A股每日、每周热门股票 Top 20
- 每天自动更新场外基金的申购、定投状态和参考额度
- 监控A股行业与主题 ETF，按日、周、月、季度、今年以来和近一年涨幅排序
- 对美股基金与A股行业 ETF 展示年运作费、购买手续费、佣金假设、溢折价和首年成本估算
- 跨平台监控 KOL 公开内容并自动识别内容中的股票提及
- 聚合全球市场新闻与央行、监管机构公告，按市场影响和发布时间筛选
- 跨资产驾驶舱统一监控股票、债券、外汇、商品和加密资产，并计算60日相关性矩阵与传导链
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
