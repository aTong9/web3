# Reddit 监控

页面：`/reddit-monitor`，入口位于「市场监控」。运行 `npm run update:reddit` 更新静态快照；浏览器不轮询，不调用 D1。

## 数据与范围

- 美股、加密货币：使用 [ApeWisdom API](https://apewisdom.io/api/) 的股票/币圈社区聚合榜，按近 24 小时提及次数取前 20 个。股票榜过滤名称明确标注 ETF、ETN、Fund、Trust 的项目；范围取决于上游覆盖，不代表全 Reddit。讨论链接为实时 Reddit 搜索。
- 每类最多 20 个，缺少数据时不补齐。采集失败保留上次成功快照并标记过期；从未成功则显示不可用。提及变化不是价格涨跌，热度不是看涨信号。

## 自动更新

提交并推送后，默认分支的 `Update Reddit monitor` 工作流计划每天北京时间 09:00 执行，也可在 Actions 手动触发；GitHub 调度可能延迟。工作流提交快照后由现有部署工作流发布。

校验：`node --test tests/reddit-monitor.test.mjs`。
