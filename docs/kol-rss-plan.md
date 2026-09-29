# KOL 订阅与动态同步

更新：2026-09-30。订阅名单以用户选定的 Folo OPML 导出为准；导出文件只是一次快照，Folo 里后续增删订阅仍需重新导入。

## 当前实现

- 独立 `web3-kols-api` Cloudflare Worker 每小时第 15 分钟检查已启用的 Feed。它与现有交易 Worker、定时任务及待迁移的交易表隔离。
- 两张 D1 表按 `owner_user_id` 保存订阅和动态。读取 `/api/kols` 使用现有登录会话，并且只返回该用户的订阅。未登录请求返回 401。
- 逐源抓取有 35 秒超时、最多 3 路并发；空结果和失败保留已有内容与原成功时间。连续失败间隔逐步增加，最多 6 小时。相同内容按订阅、条目 ID 和链接去重。
- 页面每 5 分钟及回到窗口时读取 API；登录、退出会立即刷新或清空会话内内容。生产构建不包含本地订阅快照。开发模式可显示标注清楚的本地快照。
- 单独的 `worker/kols-schema.sql` 建空表；`scripts/seed-kols-d1.mjs` 只在明确用户 ID 后生成私有种子 SQL，不把订阅和内容写进 Worker 包。

## 已验证与待完成

- 用户确认四组共 20 个订阅及其账号所有权；已向该账号的 D1 表导入 20 个订阅和 94 条已有内容。随后用临时本地 Wrangler 会话，通过远端 D1 与私有 RSSHub Service Binding 触发一次真实定时同步：HTTP 200，远端只读复核为 9 个本次成功、1 个保留旧内容、10 个失败，共 122 条内容。该会话已关闭，生产 cron 配置没有修改。
- 本地开发快照已从该账号的 D1 **只读导出**并更新为同一份 20 订阅、122 条内容；未登录的开发预览会明确标为非实时快照。开发环境本地配置了独立 KOL API 与现有登录 API 的公共地址；配置文件被 Git 忽略。登录后的页面 API 读取仍需浏览器验收，前端改动尚未发布。
- 独立 `web3-kols-api` 已部署，未带令牌的 `/api/kols` 返回 401。私有 RSSHub Worker 的远端 Service Binding 已实测可读 BlockBeats、HelloGithub、微博、BBC Telegram 等原订阅路由；少数派改用官方直连 Feed。X 路由返回 503，原因是缺少 X 平台凭据；其他失败源保留各自实际错误，不推断为可用。
- KOL 数据校验、TypeScript 类型检查和局部 lint 已通过。下一步是登录后验证私有页面读取，再按实际失败源逐项处理凭据、限流或路由问题。

## 发布前隐私与迁移边界

`src/data/kols.yml` 和 `src/data/kol-monitor.json` 当前包含选定订阅和内容，是本地种子来源。**它们是已跟踪文件，不能随公开 Git 提交推送。** 虽然私有 D1 已导入，发布前仍须把这些私人数据移出公开仓库跟踪；仅加 `.gitignore` 不会隐藏已跟踪文件。旧 GitHub KOL 定时工作流暂时保留，待新链路完整验收后再停用。

RSSHub 实例不能自动解决需登录的平台。X 需要有效的平台凭据；小红书等来源需逐源核实权限和抓取条件。页面的手动“检查”只重新读取 D1，不会立即触发后台抓取。

## 参考

- [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Cloudflare D1 Worker API](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- [RSSHub 官方 Workers 配置](https://github.com/DIYgod/RSSHub/blob/master/wrangler.toml)
- [Folo OPML 导入导出实现](https://github.com/RSSNext/Folo/blob/dev/apps/cli/src/commands/opml.ts)
