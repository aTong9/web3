# 资源导航第 69 批候选核验（2026-09-04）

本批补充 IRC、XMPP、Matrix 客户端各一项。核验第一方 README、许可证和安装说明；未安装候选，不推测最近维护日期。写入前全局检索 `osa1`、`tiny`、`gomuks`、`tulir`、`igniterealtime`、`spark`：仅匹配 Tiny Habits 和 Apache Spark 数据质量描述，均不是本批聊天客户端。三个目标分类当前各 7 项。Psi 已收录，排除；Psi+ 不作为独立增量。

| 分类 | 条目与第一方证据 | 形态、许可与范围 | 建议中文描述 |
| --- | --- | --- | --- |
| 开源应用 · IRC 客户端 | [tiny 主仓与 README](https://github.com/osa1/tiny)、[MIT LICENSE](https://github.com/osa1/tiny/blob/master/LICENSE) | Rust 终端客户端；README 明确 Linux、macOS，Windows 可通过 WSL；支持 Releases 二进制及 Cargo 安装、多网络、提及汇总、自动重连、TLS、SASL。配置可以保存密码或运行外部命令获取密码，外部命令属于本机执行边界。 | Linux、macOS 与 Windows WSL 终端 IRC 客户端｜支持多网络、提及汇总、自动重连和 TLS/SASL；TLS 不等于端到端加密，须保护配置凭据并仅使用可信取密命令。 |
| 开源应用 · XMPP 客户端 | [Spark 主仓与 README](https://github.com/igniterealtime/Spark)、[Apache-2.0 LICENSE](https://github.com/igniterealtime/Spark/blob/master/LICENSE.txt)、[官方产品页](https://www.igniterealtime.org/projects/spark/) | Ignite Realtime 跨平台 Java 桌面客户端；README 提供 GitHub Releases 和源码构建入口，明确 Windows 含 JRE 安装包。群聊、分页会话、文件与截图分享、拼写检查，声明通过 OTR 支持端到端消息加密。不把该声明延伸为群聊、文件、所有默认会话都加密。目录保守突出 Windows 安装路径，不承诺每个平台都有当前安装包。 | Windows 等平台 Java XMPP 桌面客户端｜提供群聊、分页会话、文件分享及 OTR 消息加密，可下载含 JRE 安装包；须核验加密会话与对方身份，勿默认群聊和文件均端到端加密。 |
| 开源应用 · Matrix 客户端 | [gomuks 主仓](https://github.com/gomuks/gomuks)、[README](https://github.com/gomuks/gomuks/blob/main/README.md)、[AGPL-3.0 LICENSE](https://github.com/gomuks/gomuks/blob/main/LICENSE)、[安装](https://docs.mau.fi/gomuks/installation.html)、[FAQ](https://docs.mau.fi/gomuks/faq.html) | 旧 tulir/gomuks 地址重定向至 gomuks/gomuks，使用新主仓地址。当前主要成熟界面是 Web，并有内含后端的 Electron 桌面包装；安装页列 Linux、macOS ARM64、Windows 桌面包，也可 Docker 自托管。新终端界面实验性、需独立后端，不能沿用旧版“独立终端客户端”描述。后端持有全部加密密钥；基本认证不是 Matrix 登录；远程连接须 TLS 并保留认证。 | Linux、macOS ARM64 与 Windows Matrix 桌面/Web 客户端｜可安装桌面包或自托管后端，支持加密聊天；后端持有消息与密钥，远程部署须启用 TLS、认证并保护数据备份。 |

风险提示为依据功能边界提出的使用建议，不是安全审计结论；不登录、不上传凭据、不安装候选。目录写入、全局 URL 去重及页面验证由主任务另行执行。
