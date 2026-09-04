# 资源导航第 67 批候选核验（2026-09-04）

本批补充 Git、SSH 和压缩工具，仅核验第一方仓库、README 与许可证，不安装软件，不以星数或推测的更新日期作为收录依据。写入前对 `src/data/webstack.yml` 全局检索 `git.?up`、`gitup.co`、`trzsz`、`tssh`、`zstandard`、`zstd` 和 `facebook.github.io/zstd` 均无匹配，涵盖标题、仓库及官网别名。三个目标分类当前各 7 项。

| 分类 | 条目与第一方证据 | 形态、许可与范围 | 建议中文描述 |
| --- | --- | --- | --- |
| 开源应用 · Git 客户端 | [GitUp 主仓](https://github.com/git-up/GitUp)、[README](https://github.com/git-up/GitUp/blob/master/README.md)、[LICENSE](https://github.com/git-up/GitUp/blob/master/LICENSE) | macOS 图形客户端；README 指向官方 GitHub Releases，提供交互式提交图、提交拆分、撤销重做、仓库状态快照和差异搜索。GPL-3.0；Homebrew 包明确不由 GitUp 开发者维护，推荐主仓下载入口。 | macOS 图形化 Git 客户端｜交互编辑提交图、拆分提交、搜索差异并通过快照辅助撤销；改写历史前须备份，推送前核对分支与协作影响，快照不替代完整备份。 |
| 开源应用 · SSH 客户端 | [trzsz-ssh 主仓](https://github.com/trzsz/trzsz-ssh)、[英文 README](https://github.com/trzsz/trzsz-ssh/blob/main/README.en.md)、[LICENSE](https://github.com/trzsz/trzsz-ssh/blob/main/LICENSE) | 命令名 tssh；MIT；README 提供 Windows、macOS 和 Linux 安装方式，支持主机搜索、批量登录、trzsz 文件传输及自动交互。trzsz 传输需服务端对应组件，漫游模式另需 tsshd。README 建议优先公钥认证并限制配置文件权限；不把“兼容 OpenSSH 的目标”表述为全部功能已经完全兼容。 | Windows、macOS 与 Linux SSH 命令行客户端｜搜索主机、批量登录并集成 trzsz 文件传输；传输需服务端组件，优先密钥认证，核验主机指纹并保护保存的凭据与自动命令。 |
| 开源应用 · 压缩解压 | [Zstandard 主仓](https://github.com/facebook/zstd)、[README](https://github.com/facebook/zstd/blob/dev/README.md)、[BSD LICENSE](https://github.com/facebook/zstd/blob/dev/LICENSE) | Meta 第一方参考实现，含 C 库和可独立安装的 zstd CLI；BSD 或 GPLv2 双许可。README 提供 make install、CMake、macOS Universal2 和 Windows Visual Studio 构建说明。支持无损压缩、解压及字典训练；不是 ZIP 图形归档管理器。 | 跨平台无损压缩 CLI 与 C 库｜压缩、解压 Zstandard 文件并支持字典训练，适合日志和数据传输；字典压缩需保留对应字典，处理不可信输入时应限制内存和输出大小。 |

风险措辞为基于工具能力的使用建议，不代表安全审计结论。GitAhead 的 README 明确不再积极开发，故本批排除；git-branchless 是 alpha 工作流扩展，本批选择更直接对应图形 Git 客户端的 GitUp。没有声称运行过候选软件或验证其全部功能。
