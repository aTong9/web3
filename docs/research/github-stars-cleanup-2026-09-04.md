# GitHub Star 阈值清理

依据用户要求，仅从资源目录移除 GitHub Star 严格小于 100 的条目；不取消用户账号 Star，不删除远端仓库。

- 查询日期：2026-09-04，使用已认证 GitHub GraphQL API。
- 查询目录链接：1771；成功核验 1767，未确认 4。
- 移除：96；恰好 100 或更多的条目保留。官方镜像亦按链接对应仓库计数，不以其他托管平台热度替代。
- 剩余资源：2848，其中 GitHub 链接 1675；345 个分类均非空。
- Star 为查询时快照，后续可能变化。

## 恢复依据

[完整审计快照](github-stars-audit-2026-09-04.json)保留每条原始分类、标题、网址、图标、描述、解析后的仓库名、查询时间及 Star 数。筛选 `stars !== null && stars < 100` 即为本次删除清单，可按 `category` 恢复原条目。

## 未确认，保留

- https://github.com/AdamBear/chat-gpt-prompts-from-aiprm-zh/blob/main/all_titles.txt
- https://github.com/trending （非仓库页面）
- https://github.com/NewsFlash/news_flash
- https://github.com/andreyasadchyka/Voice

已验证全部审计条目与目录保留/移除状态符合阈值、网址无重复及分类非空。没有安装工具或访问资源内容中的私人数据。
