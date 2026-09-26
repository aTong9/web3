# 站内统一提醒

路径：`/reminders`。复用研究工作台、已核验宏观日历和美股公司快照，无新依赖、后台任务或系统推送；页面打开期间每分钟重算，监听其他标签页的浏览器存储变化。

## 来源与范围

- 研究笔记：仅 `active` 且有有效 `reviewDate` 的笔记，包含逾期。复查日按北京时间解释，不修改原笔记状态。
- 宏观：复用 `macroCalendarEvents`，官方核对日期、覆盖终点沿用 `macro-calendar.ts`。来源与既有核验记录见 [event-calendar.md](event-calendar.md)，本模块没有重新抓取来源，也不包含实际发布值。
- 财报：复用 `buildEarningsCalendar(us-megacaps.stocks, updatedAt)`，仅预计/计划事件，排除已报告记录。默认仅自选公司，用户可勾选非自选财报。预计日期来自聚合来源，不是公司官方确认；未知日期不生成提醒。
- 提供来源、搜索、未来 7/30/90 天（含今天，另保留逾期）、自选关联与处理状态筛选。宏观与美股自选的关联规则沿用日历口径，并非价格预测。
- 在源目录中仍标为计划的过期事件继续显示“计划时间已过，发布待核验”，直到用户处理或来源明确报告/移除，不因时间经过自动完成。
- 时间明确的事件按美国东部时间转换为精确 instant，夏令时交给现有日历工具；展示为北京时间。仅日期事件保留源日期，以纽约日历日判断到期，不补午夜发布时间。笔记和稍后提醒日期按北京日判断。

## 处理状态与来源版本

本地键：`market-desk-reminders-v1`，结构为 `{ version: 1, states: ReminderState[] }`。

稳定来源 ID 为 `note:<原始笔记id>` 或 `calendar:<原始事件id>`。日历原始 ID 包含发生日期；目前来源缺少稳定报告期/财季标识，不能简单剥离日期，否则不同 GDP 估计或不同财季会相互覆盖。日历 ID 改期产生新提醒；同 ID 改时间也会通过 revision 重新提醒。

- 笔记 revision：`updatedAt + reviewDate + status`。
- 事件 revision：日期、时间、计划状态、确定性、标题、来源链接及关联资产。`checkedAt` 不纳入 revision，避免常规刷新核对日期反复唤醒已处理事件。
- 仅 ID 与 revision 均匹配时应用旧状态。旧状态保留在备份中但不会压住新版本提醒；已停用/已报告/移除的源不会由旧状态复活。
- `done` 表示个人已处理，不是发布确认；`pending` 恢复未处理；`snoozed` 保存明确日期，默认北京次日，最早必须晚于北京今天。到了该日自动回到待处理，不改源日期。

## 保存与备份

一般操作复用 `useLocalRecord` 的校验、写入后更新视图和旧值比对，写入失败保留上次数据。处理动作会先重读研究来源，避免给旧笔记版本误记处理状态。损坏状态会隐藏处理列表与计数，提供原始备份导出和有效备份恢复。

导出包含浏览器中的提醒状态原文，不含笔记、关注列表、日历全文；笔记与自选须在研究台单独备份。导入严格校验版本、唯一 ID、状态类型、有效日期、UTC 更新时间及大小（5 MB），预览条数并明确确认整份替换；确认前后的 localStorage 原文必须相同。确认恢复也可替换损坏提醒状态，不覆盖任何研究工作台数据。`localStorage` 同步比对可发现旧标签页写入，不能提供跨进程数据库级事务。

全部私人内容包含在 `.ph-no-capture` 中。没有添加分析埋点、远程保存或提醒通知接口。

## 复用 API

- `buildReminders({ workspace, events, state, now? })`：合并来源并应用匹配状态。
- `filterReminders(items, filter, now?)`：筛选待办、已处理、稍后、来源、范围与自选。
- `setReminderState(store, item, status, snoozedUntil?, now?)`：返回经过校验的新状态，不写来源。
- `parseReminderStore(raw)`、`emptyReminderStore()`、`reminderStorageKey`：备份和存储协议。
- `countPendingReminders(items, watchedIds, now?)`：默认范围（未来 30 天及逾期、宏观全部/自选财报）计数，不随页面临时筛选变化。
- `useReminderCenter()`：响应式 `items/pendingCount/watchedIds/now`、存储与来源错误、`reload/act/replaceBackup`。`pendingCount` 在损坏状态下为 `null`。

本轮没有在全局导航静态使用 composable 计数，避免提前加载公司快照；提醒页按路由加载。未来顶部 badge 若接入，须保持按需加载及当前来源状态语义。

## 验证

`node --test tests/reminders.test.mjs` 覆盖：来源过滤、未知财报日期、独立发生事件不碰撞、改期/revision、核对日期独立、过期计划保留、精确时刻和 DST、仅日期事件、北京稍后日期切换、搜索/范围/自选、无效备份与旧标签冲突/写入失败。

浏览器验收脚本和截图在 `/tmp/web3-qa/`，结果由任务验收补充；不纳入项目产物。
