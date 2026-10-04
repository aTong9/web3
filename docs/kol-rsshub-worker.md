# 私有 RSSHub Worker

固定使用 [RSSHub 源码提交 `75dc8665`](https://github.com/DIYgod/RSSHub/commit/75dc86653f3c2bc5697b15ef9c290b4be85ec4eb)。源码和构建产物留在 `/tmp`，不纳入本仓库。`scripts/deploy-rsshub-worker.sh` 默认只执行 Wrangler dry-run；明确传入 `--deploy` 才会远程部署 `web3-rsshub`。脚本基于官方 `wrangler.toml`，设置 `workers_dev = false`、`preview_urls = false`，保留 Browser Run 绑定，并使用本仓库的入口模块将 RSSHub 的 `CACHE` 绑定接到 Workers Cache API。生成的配置在 RSSHub 临时目录中。

```bash
scripts/deploy-rsshub-worker.sh --dry-run
scripts/deploy-rsshub-worker.sh --deploy
```

已有同一提交的临时 checkout 时可设置 `RSSHUB_CHECKOUT=/tmp/rsshub-web3-check`，复用依赖和 `dist-worker` 构建产物。RSSHub 要求 Node `^22.22.2` 或 `^24.15.0`；本地用 Node 25.5.0 构建虽成功，但正式部署建议使用其支持的版本。

缓存仍按 RSSHub 原有的路由 5 分钟、内容 1 小时到期和命中续期规则工作。路由结果使用 Workers Cache API，同一机房的请求可复用；Cache API 可能提前淘汰。文章等内部内容缓存在 Worker 实例内存中，最多 500 条或 8 MiB，按先进先出淘汰；实例重启或请求落到其他实例时会重新抓取。这样每篇文章不再触发 Cache API 子请求。缓存不可用时会记录一次通用警告并尝试直接抓取，可能增加抓取时间。此 Worker 部署后不再绑定或使用 KV；旧 `web3-rsshub-cache` KV namespace 保留供回滚，未删除其中数据。KOL 内容的持久数据仍在 D1。

2026-10-04 已部署缓存优化版本 `1cd2fe0e-9fd3-4364-974c-ed9021d76c11`，线上 API 核对绑定仅含 Browser Run。经本地临时 Worker 的远端 Service Binding 验证：BlockBeats、HelloGitHub、BBC Telegram、Bloomberg 各返回 20 条，微博返回 10 条；五个路由均为 HTTP 200，连续第二次请求均返回 `RSSHub-Cache-Status: HIT`。Bloomberg 首次约 7.5 秒、再次约 120 毫秒；微博首次约 8.7 秒、再次约 125 毫秒。项目 291 项测试与 ESLint 通过。回滚版本为 `a49cf2f7-d758-42c3-afac-75e48863ef07`，回滚会恢复 KV 缓存依赖。

`web3-kols-api` 的 Service Binding 名为 `RSSHUB_FETCHER`，服务名为 `web3-rsshub`。仅将 `rsshub.app` 的原始路径与查询参数转发到 `env.RSSHUB_FETCHER.fetch(new Request('https://rsshub.internal' + path))`，返回值为 RSS/Atom XML。RSSHub 不设置公开路由或 `ACCESS_KEY`；主 Worker 只在服务端调用此绑定。若已有版本/预览地址曾启用，部署后还需在 Cloudflare 控制台核对域名与路由状态。

本地官方 Worker 验证（2026-09-29）：

| 路由 | 结果 | 依赖 |
| --- | --- | --- |
| `/sspai/index` | 200 XML | 无额外凭据、无需浏览器 |
| `/twitter/user/cz_binance` | 503 | 缺 `TWITTER_AUTH_TOKEN` 等 X 凭据；日志为 `Twitter API is not configured` |
| `/weibo/user/6225948555` | 200 XML，约 16 秒 | 无 Cookie 时用 Browser Run 获取访客 Cookie；也可设置 `WEIBO_COOKIES` |

本地 `worker-build` 与 Wrangler dry-run 均成功，上传包 46,928.66 KiB（gzip 10,117.20 KiB）。[Cloudflare 当前 Worker 限额](https://developers.cloudflare.com/workers/platform/limits/)是 Free/Paid 都 64 MiB；Free CPU 为每次请求 10 ms。[Browser Run Free 限额](https://developers.cloudflare.com/browser-run/limits/)是每天 10 分钟。X 凭据需要以 Wrangler Secret 写入 RSSHub Worker，不能写进仓库。

2026-09-29 已将私有 `web3-rsshub` 部署到 Cloudflare，版本 `a49cf2f7-d758-42c3-afac-75e48863ef07`。2026-09-30 使用 Wrangler 4.136.1 从仅监听 `127.0.0.1` 的临时 Worker，经 `remote: true` Service Binding 验证了远端响应：

| 原 RSSHub 路由 | 远端 HTTP | XML 条数 |
| --- | ---: | ---: |
| `/sspai/index` | 200 | 10 |
| `/theblockbeats/newsflash/0` | 200 | 20 |
| `/hellogithub/home` | 200 | 20 |
| `/weibo/user/6225948555` | 200 | 10 |
| `/telegram/channel/bbczhongwen_rss` | 200 | 20 |
| `/twitter/user/cz_binance` | 503 | 0 |

这些结果证明所列路由在当时可从私有服务调用；仍未核实账户套餐、长期配额与定时同步入库。X 路由因缺凭据不可用。另有[少数派官方 Feed](https://sspai.com/feed)直接返回 200 XML、10 条，可用于替代少数派 RSSHub 路由。HelloGitHub 的 `/rss` 是月刊，与当前“精选开源项目”路由不同，不能等同替换。

部署后在临时 RSSHub checkout 运行 `npx --yes pnpm@10.34.5 exec wrangler secret put TWITTER_AUTH_TOKEN --config wrangler.web3.toml`，从交互式输入提供凭据；微博若使用个人 Cookie，同样用 `WEIBO_COOKIES` Secret。不要在命令行参数、日志或版本控制中放入其值。
