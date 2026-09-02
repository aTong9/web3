# 资源导航第 41 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按去除末尾 `/`、忽略大小写检查
`src/data/webstack.yml`：Bagisto、KLayout、SignServer Community 已由共享工作树写入；Readest
已存在于“辅助阅读”，不得再次加入“电子书阅读”。`corectrl/corectrl` 与
`liteshort/liteshort` 均不是可解析的 GitHub 仓库，分别改用有明确许可证的 Universal x86
Tuning Utility 与 Url-Shorten-Worker。

| 分类 | 建议条目 | 形态 / 平台 | 相关性与许可 | 维护状态与边界 |
| --- | --- | --- | --- | --- |
| 开源应用 · 电商零售 | [Bagisto](https://github.com/bagisto/bagisto) | PHP / Laravel 自托管电商平台；Web 管理端与店面 | 官方 README 提供本地及 Docker 安装入口，面向商品、订单与多语言商店；[MIT](https://github.com/bagisto/bagisto/blob/2.4/LICENSE)。 | 官方主仓持续提交并发布版本；公网商店须自行配置支付、权限、TLS、备份和安全更新。[README](https://github.com/bagisto/bagisto#readme) · [Releases](https://github.com/bagisto/bagisto/releases) |
| 开源应用 · 电源管理 | [Universal x86 Tuning Utility](https://github.com/JamesCJ60/Universal-x86-Tuning-Utility) | Windows x86 桌面调校工具；MSI 安装 | 官方 README 说明可调整处理器、GPU、预设与自适应模式；[GPL-3.0](https://github.com/JamesCJ60/Universal-x86-Tuning-Utility/blob/master/LICENSE)。 | 主仓有 2026 年提交与发行包；项目仍标注 WIP，错误电压、功耗或温度设置可能造成不稳定，应先备份设置并小幅调整。[README](https://github.com/JamesCJ60/Universal-x86-Tuning-Utility#readme) · [Releases](https://github.com/JamesCJ60/Universal-x86-Tuning-Utility/releases) |
| 开源应用 · 电子签名 | [SignServer Community](https://github.com/Keyfactor/signserver-ce) | Java/JVM 服务；源码、容器与 Helm 部署 | 官方 README 将其定义为集中式代码、文档及制品签名服务；[LGPL-2.1](https://github.com/Keyfactor/signserver-ce/blob/main/LICENSE)。 | 官方仓库与发行页仍维护，但 README 明确 CE 仅用于学习、测试和原型，不面向生产签名；密钥保护、审计与合规不能由目录条目代替评估。[README](https://github.com/Keyfactor/signserver-ce#readme) · [Releases](https://github.com/Keyfactor/signserver-ce/releases) |
| 开源应用 · 电子书阅读 | [BookLore](https://github.com/booklore-app/booklore) | Docker 自托管 Web 图书馆与阅读器 | 官方 README 支持浏览器阅读 EPUB、PDF 和漫画，并提供批注、进度、多用户与设备同步；[AGPL-3.0](https://github.com/booklore-app/booklore/blob/develop/LICENSE)。 | 主仓持续维护并提供容器镜像；部署会保存书籍、账户与阅读数据，须配置鉴权、备份和访问权限，且不包含书源或 DRM 绕过。[README](https://github.com/booklore-app/booklore#readme) · [Releases](https://github.com/booklore-app/booklore/releases) |
| 开源应用 · 电子芯片 | [KLayout](https://github.com/KLayout/klayout) | Windows、macOS、Linux 桌面版与 Ruby/Python 脚本接口 | 官方主仓包含集成电路版图查看、编辑和自动化源码；[GPL-3.0](https://github.com/KLayout/klayout/blob/master/LICENSE)。 | 主仓持续提交并发布安装包；版图显示或规则检查不等同于制造可行性验证，流片前仍须使用代工厂规则和签核流程。[README](https://github.com/KLayout/klayout#readme) · [Releases](https://github.com/KLayout/klayout/releases) |
| 开源应用 · 短链接服务 | [Url-Shorten-Worker](https://github.com/xyTom/Url-Shorten-Worker) | Cloudflare Workers + KV 自托管短链接服务 | 官方 README 提供 KV 绑定、Worker 部署、API 与可选 CAPTCHA；[MIT](https://github.com/xyTom/Url-Shorten-Worker/blob/main/LICENSE)。 | 主仓有 2026 年功能提交；运行依赖 Cloudflare Workers/KV。公网部署须限制创建权限、启用 HTTPS/CAPTCHA，并防范钓鱼、恶意跳转和访问日志泄露。[README](https://github.com/xyTom/Url-Shorten-Worker#readme) · [Commits](https://github.com/xyTom/Url-Shorten-Worker/commits/main/) |

## 被替换的原候选

- `https://github.com/corectrl/corectrl` 无法解析为 GitHub 仓库；改用许可证明确、仍提供发行包的
  Universal x86 Tuning Utility。
- `https://github.com/liteshort/liteshort` 无法解析为 GitHub 仓库；改用 MIT 许可的
  Url-Shorten-Worker。
- Readest 的 URL 和标题已在全局目录中使用；电子书阅读分类改用未收录的 BookLore，避免重复。
