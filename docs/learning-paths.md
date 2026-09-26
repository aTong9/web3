# 专题学习路线

入口 `/learning-paths`；资源导航页面顶部和侧栏均有链接。四条路线共 12 步：

| 路线                 | 完成成果                                 | 关联模块        |
| -------------------- | ---------------------------------------- | --------------- |
| 从收支到 FIRE 目标   | 收支表、风险记录与三情景假设             | 个人资产与 FIRE |
| 宏观数据与事件阅读   | 含定义、发布时间、历史版本的观察笔记     | 事件日历        |
| 从原始财报到研究笔记 | 有原文来源、失效条件、复查日期的公司观点 | 我的研究台      |
| 完成一支短视频作品   | 可播放的导出作品与实际投入记录           | 增收实践账本    |

每步包含阅读入口、具体练习和成果笔记。勾选完成或点击「保存笔记」时保存该步；切换路线不会清除未保存笔记。离开页面时提示未保存草稿。

## 来源与编辑边界

路线及练习由本项目整理；资料链接均复用现有 `webstack.yml` 条目，不复制外部课程，也不把完成勾选称为认证或能力评估。2026-09-26 核对主要来源：

- [Consumer.gov](https://consumer.gov/)：预算、信用、债务等基础教育。
- [Investor.gov](https://www.investor.gov/) 与[退休入口](https://www.investor.gov/employment-retirement)：风险、费用、投资目标和退休教育；美国账户规则不自动适用于其他地区。
- [FRED](https://fred.stlouisfed.org/)、[ALFRED](https://alfred.stlouisfed.org/)、[BEA Open Data](https://www.bea.gov/open-data)：指标查询、历史版本与原始统计口径。
- [SEC EDGAR](https://www.sec.gov/edgar/search/)、[财报结构化数据](https://www.sec.gov/data-research/sec-markets-data/financial-statement-data-sets)、[SEC API](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)：原始申报与结构化资料。结构化数据不替代完整申报，自动访问须遵守官方政策。
- [OBS](https://github.com/obsproject/obs-studio)、[Resolve](https://www.blackmagicdesign.com/products/davinciresolve)、[Audacity](https://www.audacityteam.org/)、[FFmpeg](https://github.com/FFmpeg/FFmpeg)：采集、剪辑、声音与媒体检查工具。路线不承诺收入，不判断用户素材授权。

不填虚构的课程时长、通过率或预期收益。阅读和实践进度由用户自行确认；外站内容、版本和访问条件以原站为准。

## 存储与备份

- 键：`market-desk-learning-progress-v1`；包含 version、entries，每条为 stepId、completed、note、updatedAt。
- 进度仅在当前浏览器本地保存；导出仅包含已保存记录。恢复前验证完整备份，并确认替换全部记录及草稿；无效导入保留原记录。
- 未知历史步骤仍保存在备份中，避免路线调整后丢失记录。稳定步骤 ID 不应复用为另一项练习。
- 共用 `useLocalRecord`，写入成功后才更新已保存状态；额度不足保留草稿，损坏存储不覆盖，检测到跨标签旧数据时停止写入。
- 本地存储比较不是数据库事务；极端同时写入仍有竞争窗口。需要跨设备协作时再改用服务端版本控制。

验证：`node --test tests/learning-progress.test.mjs` 校验稳定 ID、目录引用与备份边界。浏览器验证了完成勾选、笔记、刷新恢复、备份导出/坏导入/取消/确认替换、存储失败、跨标签冲突、损坏原数据保护和手机布局。
