# 资源导航第 75 批候选核验（2026-09-04）

补充游戏互动、浏览器内核、区块链节点，写入前各 7 项。全目录检索 `orx|orx-project|reth|Rust Ethereum|paradigmxyz|blitz|DioxusLabs` 未发现候选名称、别名或主仓 URL；MonoGame 已在游戏引擎分类，故排除。仅核验第一方 README、许可证与构建文档，未安装运行，不推测维护日期，也不构成安全审计。

| 分类 | 项目与第一方证据 | 核验与形态 | 建议中文描述 |
| --- | --- | --- | --- |
| 开源应用 · 游戏互动 | [Orx 主仓](https://github.com/orx/orx)、[README](https://github.com/orx/orx/blob/master/README.md)、[zlib LICENSE](https://github.com/orx/orx/blob/master/LICENSE) | 数据驱动 2D 引擎，可构建静态或动态库；README 列出 Windows、Linux、macOS、Web、Android、iOS，并提供 setup 脚本与编译说明。setup 会下载依赖、生成工程文件并注册版本控制 hook，不能当作无副作用步骤。 | 跨平台数据驱动 2D 游戏引擎｜源码构建库，支持桌面、Web 与移动端，提供动画、物理、音频和资源热加载；构建前审查会下载依赖并注册 Git hook 的 setup 脚本，发布素材需核对授权。 |
| 开源应用 · 浏览器内核 | [Blitz 主仓与 README](https://github.com/DioxusLabs/blitz)、[MIT LICENSE](https://github.com/DioxusLabs/blitz/blob/main/LICENSE-MIT)、[Apache LICENSE](https://github.com/DioxusLabs/blitz/blob/main/LICENSE-APACHE) | Rust 模块化 HTML/CSS 渲染引擎；README 提供 Cargo 运行浏览器、Markdown 查看器和应用示例，链接 Windows/macOS/Linux/Android 浏览器构建。项目明确 beta、有缺陷与缺失功能，非完整浏览器能力集合。主项目 Apache-2.0/MIT 双许可，个别组件另有 MPL-2.0 选项。 | Rust 模块化 HTML/CSS 渲染引擎｜可用 Cargo 构建浏览器与 Markdown 查看示例，提供多平台浏览器试用构建；仍处 beta，功能不完整，不应替代日常安全浏览器处理敏感账户。 |
| 开源应用 · 区块链节点 | [Reth 主仓与 README](https://github.com/paradigmxyz/reth)、[MIT LICENSE](https://github.com/paradigmxyz/reth/blob/main/LICENSE-MIT)、[源码构建](https://reth.rs/installation/source/) | Rust Ethereum 执行层客户端；README 明确由 Paradigm 推动、Apache/MIT 许可，与支持 Engine API 的共识客户端配合。构建文档列出 Linux、macOS、Windows、WSL2，通过 Cargo 构建 CLI，不支持 WSL1；README 警告内部存储编码不适合读取恶意数据。 | Rust 以太坊执行层客户端｜Linux、macOS 与 Windows 可从源码构建 CLI，用于节点开发、链状态同步和 RPC 调试；需配合共识客户端，优先测试网，限制 RPC 暴露并避免导入不可信内部数据库文件。 |

Reth 文档与主分支 README 的最低 Rust 版本数字不一致，本批不固化版本要求，构建时以所选发行版 Cargo.toml 为准。脚本审查、素材授权、敏感账户隔离、测试网与 RPC 防护是根据功能提出的建议，不是已验证安全保障。区块链条目仅用于开发与节点运维，不涉及收益承诺或投资推荐。目录写入及页面验收由主任务完成。
