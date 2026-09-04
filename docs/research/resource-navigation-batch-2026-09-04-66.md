# 资源导航第 66 批候选核验（2026-09-04）

本批补充阅读工具；只核验第一方仓库与文档，不安装候选软件，不以星数或推测的维护日期作为收录依据。全局搜索 `src/data/webstack.yml` 的产品名、仓库名和官网别名：Atril、Newsboat / Newsbeuter、audioserve / zderadicka 均未出现。Librera Reader 已在电子书阅读分类出现，因此排除，避免同产品跨类重复收录。

| 分类 | 条目与第一方证据 | 形态、许可与范围 | 建议中文描述 |
| --- | --- | --- | --- |
| 开源应用 · PDF 阅读 | [Atril 主仓](https://github.com/mate-desktop/atril)、[README](https://github.com/mate-desktop/atril/blob/master/README.md)、[COPYING](https://github.com/mate-desktop/atril/blob/master/COPYING) | MATE 官方组织维护的 Linux 桌面文档查看器；README 提供源码编译步骤，PDF 后端使用 Poppler，可选其他文档后端。支持多页浏览、打印及文档允许的搜索、复制、目录导航。GPL-2.0；是 Evince 的独立分支，不是同产品另一个下载入口。 | Linux MATE 桌面文档阅读器｜浏览和打印 PDF、PostScript、DjVu 等文档，支持文本搜索、复制与目录导航；不同格式需对应后端，打开不可信文件前应更新解析组件。 |
| 开源应用 · RSS 阅读 | [Newsboat 主仓](https://github.com/newsboat/newsboat)、[README](https://github.com/newsboat/newsboat/blob/master/README.md)、[LICENSE](https://github.com/newsboat/newsboat/blob/master/LICENSE) | 终端 RSS/Atom 阅读器；README 明确提供发行版包、Snap 与源码编译安装方式，支持正文渲染、过滤、聚合、宏及在线服务接入。MIT。建议描述限定 Linux，不推断所有平台支持。 | Linux 终端 RSS/Atom 阅读器｜在文本界面阅读正文、过滤与聚合订阅，并可接入在线 RSS 服务；须保护私有订阅与账户凭据，仅启用可信书签脚本和外部命令。 |
| 开源应用 · 有声书 | [audioserve 主仓](https://github.com/izderadicka/audioserve)、[README](https://github.com/izderadicka/audioserve/blob/master/README.md) 的 Installation、Security、Web client、License 段 | Linux 自托管服务，提供 Docker 和 Linux 静态构建；浏览器 PWA 是推荐客户端，旧 Android 原生客户端不再维护。按目录组织有声书，支持章节与设备组播放进度共享。README 声明 MIT；仓库 `/LICENSE` 路径未找到，因此不提供不存在的独立许可文件链接。没有独立用户权限模型，共享密钥授权整个媒体库。 | Linux 自托管有声书服务器｜通过 Docker 部署并以浏览器 PWA 播放目录书库、章节与共享进度；采用共享密钥而非独立用户权限，须启用 HTTPS、只读挂载书库并限制访问。 |

风险提示中的更新解析组件、保护凭据及最小权限是基于工具能力作出的使用建议，不代表已完成安全审计。audioserve 的共享密钥和整库访问边界由 README 直接说明；生产环境不得照搬其无认证演示命令。以上候选均不是内容授权或版权许可来源。
