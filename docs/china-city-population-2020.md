# 2020 年城市人口排名数据方法

- 数据时点：第七次全国人口普查，2020 年 11 月 1 日零时。这里采用 [City Population 的中国行政区划表](https://www.citypopulation.de/en/china/admin/) 中 2020 年人口列；该站标注来源为中国国家统计局。2026 年 11 月 3 日转录，经 [公开汇编表](https://spark1.cn/china-cities)提取后逐条与 City Population 原表核对，337 行人口数字均一致。
- 覆盖：4 个直辖市 + 333 个地级行政区（地级市、自治州、地区、盟），共 337 行、31 个省级行政区。原汇编额外收录的省直辖县级市济源市已剔除，避免与地级单位混排。其他县级市、港澳台未纳入。
- 口径：按 City Population 行政区划表归集的七普人口，并非城区人口。部分省份有省直辖县级单位，地级行之和不能当作全省总人口。该表的行政区划归集值与地方普查公报的现管辖或纳入口径可能不同；例如[深圳市公报](https://www.sz.gov.cn/zfgb/2021/gb1199/content/post_8806392.html)为 17,560,061 人，本表为 17,494,398 人；[保定市公报](https://www.baoding.gov.cn/content-173-312950.html)现管辖为 9,242,610 人，本表为 11,544,036 人。页面不混用两套口径。
- [国家统计局第七次全国人口普查公报（第三号）](https://www.stats.gov.cn/xxgk/sjfb/zxfb2020/202105/t20210511_1817198.html)提供普查日期、常住人口定义及省级参考值；它本身不提供这 337 行城市清单。City Population 是二次汇编，不是国家统计局官方接口。

## 城市住宅套数模型估算

- 榜单新增两列均为**模型估算**，不是城市住宅存量统计。337 个城市均按同一全国参数计算，不改变原有人口、排名和行政区划归集值。
- [国家统计局七普公报（第二号）](https://www.stats.gov.cn/sj/zxfb/202302/t20230203_1901082.html)给出 2020 年 11 月 1 日大陆普查人口 1,411,778,724 人、家庭户 494,157,423 户、家庭户人口 1,292,809,300 人。公报的 2.62 人/户是舍入值，模型采用原始总数。参数单独存于 `src/data/china-city-housing-assumption-2020.json`。
- 公式：`估算住宅套数 = 本表城市常住人口 × 494157423 / 1411778724 × 假设套/家庭户`；`估算人口住宅比 = 本表城市常住人口 / 估算住宅套数`。默认 1.08 套/家庭户沿用[本站全国住宅情景模型](china-demography-methodology.md)的假设，并非官方统计，可在页面调整。套数按万套保留 2 位展示，比值按人/套保留 2 位，计算使用未舍入值。
- 家庭户不是住宅套数；该公式是以全国平均户数密度和人为套户比构造的代理估算。统一全国系数使各城市比值基本相同，**不能衡量城市住房供给差异或空置情况**。城市人口是二次汇编的行政区划归集值，全国参数是国家统计局公报总量；各地家庭结构、集体户占比和行政归集口径不同，会造成模型误差。
- 调研未找到覆盖榜单 337 行、与人口年份和辖区一致的官方城市住宅存量套数。地方公报中的家庭户数、商品房销售套数、租赁成交套次和住宅面积都不能直接作为存量住宅套数。例如[深圳七普公报](https://www.sz.gov.cn/zfgb/2021/gb1199/content/post_8806392.html)有家庭户数，但本榜单的深圳人口与该公报不一致；[上海市总体规划](https://www.shanghai.gov.cn/newshanghai/xxgkfj/2035002.pdf)的约 1100 万套指规划基期城镇住房，也不能与 2020 年全市常住人口直接相除。

## GDP、二手房价与住宅租金

- 静态数据存于 `src/data/china-city-indicators.json`，人口及住宅估算仍按原表和原公式。GDP 是 **2025 年全市域现价地区生产总值，单位亿元**；主要转录自[鸥维数据公开的城市 GDP 汇编](https://www.oweidata.com/rank/gdp/city)，该站称其来源为各级统计部门及政府公开数据，属于二次汇编，并非逐城官方原表。已对照[深圳](https://www.sz.gov.cn/cn/xxgk/zfxxgj/tjsj/tjgb/content/post_12805133.html)及[广州](https://tjj.gz.gov.cn/stats_newtjyw/tbzdgz/content/post_10677617.html)官方 2025 数值；四个直辖市未列入该汇编，另据[上海](https://tjj.sh.gov.cn/tjgb/20260330/e0772941e8e041eaaad2df850b44ef98.html)、[北京](https://tjj.beijing.gov.cn/tjsj_31433/tjgb_31445/ndgb_31446/202603/t20260326_4566469.html)、[重庆](https://www.cq.gov.cn/zwgk/zfxxgkzl/fdzdgknr/tjxx/tjgb/202603/t20260326_15568523.html)及[天津](https://www.tj.gov.cn/sq/tjgb/202603/t20260327_7271193.html)统计公报补入。GDP 覆盖 **325/337** 行，缺失维持“—”；不同地区后续统计修订可能使汇编数字与最新公报不同。
- 房价为[中指研究院 2026 年 10 月百城二手住宅价格指数](https://www.cih-index.com/data/index/esfHouse.html)的**市辖区固定样本挂牌均价，元/㎡**，并非成交价；其 100 个样本城市中 4 个县级市不在本榜单，故覆盖 **96/337** 行。租金为[同机构 2026 年 10 月 50 城住宅租赁价格指数](https://www.cih-index.com/data/index/rentIndex.html)的**普通住宅市辖区挂牌样本平均租金，元/㎡/月**，覆盖 **50/337** 行。重庆的房价、租金仅对应主城区样本，不代表全直辖市。源站公开城市表逐行对应本榜单名称，未使用全国系数推算城市价格。
- 三类指标年份、取样范围和人口表行政区划口径不同，不能把 GDP、样本房价或租金与 2020 年全行政区人口直接相除，推断城市人均收入、实际成交房价或全域住房成本。页面点击数值可打开对应来源；无数据的城市显示“—”。

## 城镇收入、租金比、挂牌毛租金收益率与近五年人口变化

- 收入为 **2025 年城镇居民人均可支配收入，元/人/年**，不是工资、中位数，也不是全体城乡居民均值。302 个地级行政区取自[鸥维数据公开汇编](https://www.oweidata.com/rank/czshouru/city)的 2025 年有效行；源站标示 323 地级市，七页中能提取 307 条数值，其中 5 条为本榜未收的省直管县级市。其余[北京](https://tjj.beijing.gov.cn/tjsj_31433/tjgb_31445/ndgb_31446/202603/t20260326_4566469.html)、[上海](https://tjj.sh.gov.cn/tjgb/20260330/e0772941e8e041eaaad2df850b44ef98.html)、[天津](https://www.tj.gov.cn/sq/tjgb/202603/t20260327_7271193.html)、[重庆](https://www.cq.gov.cn/zwgk/zfxxgkzl/fdzdgknr/tjxx/tjgb/202603/t20260326_15568523.html)据官方公报补入，总覆盖 **306/337**。未核实的行不推算；数据存于 `src/data/china-city-living-indicators.json`。
- **参考租金收入比** = 2026 年 10 月挂牌月租金（元/㎡/月）× 假设每人租住 30㎡ × 12 ÷ 2025 年城镇居民人均可支配收入，显示为百分比。固定 30㎡ 是便于跨城比较的情景，并非户均实际租房面积；不应把整套房租金直接与一人的收入相除。收入与租金不同年，且收入是全市城镇居民调查、租金是市辖区挂牌样本，因此只是参考比值。仅两个输入都有正数时计算。
- **挂牌样本毛租金收益率** = 2026 年 10 月挂牌月租金 × 12 ÷ 同月二手住宅挂牌均价 × 100%。两个指数虽同月，但样本不同，非同一套房实收租金和成交价；未扣除空置、税费、维修等，不代表净投资回报。仅两个输入都有正数时计算。
- **近五年人口变化**单独按地方官方同辖区 **2020 与 2025 年末常住人口**计算 `(2025 年末－2020 年末) ÷ 2020 年末`，不使用本榜 City Population 的 2020 年 11 月 1 日行政归集人口。2026 年 11 月 3 日复核，覆盖 **16/337** 行，余下 **321/337** 行显示“—”。数据文件中的 `populationSources` 为各城 `[2020, 2025]` 来源。地方年末数据可能以七普或人口抽样调查结果推算，不等于普查时点值。
- 原有六城的两期年末人口（万人）：[北京 2189.0](https://wjw.beijing.gov.cn/xwzx_20031/wnxw/202110/P020211014339342238728.pdf) → [2180.0](https://tjj.beijing.gov.cn/tjsj_31433/tjgb_31445/ndgb_31446/202603/t20260326_4566469.html)、[上海 2488.36](https://tjj.sh.gov.cn/tjnj/2021tjnj/C02/C0201B.htm) → [2485.41](https://tjj.sh.gov.cn/tjgb/20260330/e0772941e8e041eaaad2df850b44ef98.html)、[天津 1386.6](https://stats.tj.gov.cn/nianjian/2021nj/zk/html/gb01.pdf) → [1363.0](https://www.tj.gov.cn/sq/tjgb/202603/t20260327_7271193.html)、[重庆 3208.93](https://tjj.cq.gov.cn/cslm/tjsjzl/202505/P020250506394667367695.pdf) → [3187.26](https://www.cq.gov.cn/zwgk/zfxxgkzl/fdzdgknr/tjxx/tjgb/202603/t20260326_15568523.html)、[广州 1874.03](https://tjj.gz.gov.cn/attachment/7/7951/7951817/10252464.pdf) → [1910.1](https://tjj.gz.gov.cn/stats_newtjyw/tjsj/tjgb/qtgb/content/post_10802670.html)、[深圳 1763.38](https://www.szps.gov.cn/attachment/0/58/58596/909069.pdf) → [1824.85](https://www.sz.gov.cn/cn/xxgk/zfxxgj/tjsj/tjgb/content/post_12805133.html)。上海原填 2487.09、重庆原填 3205.42 均是七普时点人口，本次依官方年鉴回溯的年末值修正。
- 新增八个江苏城市的 2020 年末值均来自[《江苏统计年鉴 2021》表 19-2](https://tj.jiangsu.gov.cn/2021/nj19/nj1902.htm)“年末常住人口”；它与[江苏七普 2020 年 11 月 1 日表](https://tj.jiangsu.gov.cn/art/2021/5/18/art_85767_10520836.html)逐城不同（例如南京 931.97 万对 931.4685 万、苏州 1274.96 万对 1274.8262 万），并非将普查时点值改名使用。各城 2025 年末值逐项见下表，单位万人。

| 城市 | 2020 年末 | 2025 年末及官方来源 |
| --- | ---: | --- |
| 南京 | 931.97 | [963.85](https://wjw.nanjing.gov.cn/njswshjhsywyh/202607/t20260727_5883557.html) |
| 无锡 | 746.40 | [753.74](https://www.wuxi.gov.cn/doc/2026/05/09/4772440.shtml) |
| 常州 | 527.96 | [541.54](https://tjj.changzhou.gov.cn/content/suitable/show?catid=24519&id=29035) |
| 苏州 | 1274.96 | [1304.77](https://tjj.suzhou.gov.cn/sztjj/tjgb/202604/3dc4b574cabd4e86b36ec5d3280e927c.shtml) |
| 连云港 | 460.10 | [456.20](https://www.lyg.gov.cn/zglygzfmhwz/tjgb/content/f88b71e0-2ae3-420e-b655-380779e6c3cd.htm) |
| 淮安 | 455.92 | [449.34](https://tjj.huaian.gov.cn/tjgb/content/17775648/1778659427789n1us7Pf5.html) |
| 盐城 | 671.06 | [661.10](https://tjj.yancheng.gov.cn/art/2026/6/24/art_1773_4433668.html) |
| 泰州 | 451.68 | [445.10](https://tjj.taizhou.gov.cn/xxgk/fdzdgknr/tjxx/tjgb/art/2026/art_2be9ac8eac814cd784c0ece81a1ee73b.html) |

- [武汉 2021 年统计公报](https://tjj.wuhan.gov.cn/tjfw/tjgb/202204/t20220402_1949877.shtml)称当年末 1364.89 万、比上年末增 120.12 万，故反推 2020 年末 **1244.77 万**；[2025 年公报](https://tjj.wuhan.gov.cn/tjfw/tjgb/202604/t20260408_2750693.shtml)为 **1386.19 万**。[杭州人口发展规划](https://drc.hangzhou.gov.cn/module/download/downfile.jsp?classid=0&filename=ff7b11121add4c048785d1cbe6a00df0.pdf)的 2020 实际值为 **1196.5 万**，[2025 年统计公报](https://hzdaily.hangzhou.com.cn/hzrb/2026/04/30/article_detail_1_20260430A065.html)为 **1270.0 万**。南通 2025 年公报未直接列年末常住人口，未用人均 GDP 反推值补入；西安西咸、长春公主岭、济南莱芜、成都简阳等可能存在辖区归集变化的城市待单独核实。
