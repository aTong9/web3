# 资源导航第 32 批一手来源核验

日期：2026-09-02  
范围：开源应用 · 日志查看、网络扫描、文件加密、压缩解压、系统救援、IT 资产管理

## 核验方法与结论

- 完整解析 `src/data/webstack.yml` 的两层嵌套结构：2 个 taxonomy、345 个分类、2486 个链接；本批六个目标分类各有 6 项。
- 仅采用项目 README、官方文档、许可证、GitHub Releases 与主分支 commits 等一手来源；当前 GitHub API 配额耗尽，维护状态改由浅克隆主分支并读取最新提交核验。
- 以大小写不敏感标题，以及 GitHub 主机名与路径小写、去尾斜杠后的 URL 做全站排重。以下 6 个标题和 URL 均未出现。
- 排除 Cryptomator、Rescuezilla 与 GLPI（全站已有同标题和 URL）、SystemRescue（主维护源码不在 GitHub）及 Redo Rescue（GitHub 主分支最近提交停留在 2023 年）。

## 推荐条目

### 1. 开源应用 · 日志查看 — Logria

- GitHub：https://github.com/ReagentX/Logria
- 形态与平台：可通过 Cargo 安装的终端日志聚合 CLI；读取文件或其他进程输出，支持实时筛选、正则高亮、解析、聚合和保存会话。官方文档列出 Windows、macOS 与 Linux 的配置目录。
- 许可证与维护：GPL-3.0-or-later；`develop` 分支在 2026-08-21 仍有提交，仓库未归档。
- 一手来源：[README](https://github.com/ReagentX/Logria/blob/develop/README.md)、[平台与安装文档](https://github.com/ReagentX/Logria/blob/develop/docs/README.md)、[LICENSE](https://github.com/ReagentX/Logria/blob/develop/LICENSE)、[Commits](https://github.com/ReagentX/Logria/commits/develop)
- 必要边界：日志可能包含令牌、个人资料和生产环境信息；文档说明工具会保存会话、解析器和输入历史，因此导入、共享或长期保存前应脱敏，并限制配置目录权限。
- 可录入描述：`Windows、macOS 与 Linux 终端日志聚合 CLI｜实时筛选、解析和聚合文件或进程输出；日志与已保存会话可能含令牌或个人资料，使用前脱敏并限制配置目录权限。`

### 2. 开源应用 · 网络扫描 — Angry IP Scanner

- GitHub：https://github.com/angryip/ipscan
- 形态与平台：Windows、macOS 与 Linux 桌面 IP/端口扫描器；Java/SWT 图形界面，可构建对应平台安装包。
- 许可证与维护：GPL-2.0；`master` 分支在 2026-08-31 仍有提交，仓库未归档并持续维护跨平台构建。
- 一手来源：[README](https://github.com/angryip/ipscan/blob/master/README.md)、[LICENSE](https://github.com/angryip/ipscan/blob/master/LICENSE)、[Releases](https://github.com/angryip/ipscan/releases)、[Commits](https://github.com/angryip/ipscan/commits/master)、[官网](https://angryip.org/)
- 必要边界：主动扫描会向目标主机和端口发包，可能触发告警或影响设备；只扫描自有或明确授权的网段，并先约定范围、速率和时间窗口。
- 可录入描述：`Windows、macOS 与 Linux 图形化 IP/端口扫描器｜快速发现网段主机并检查端口；仅扫描自有或明确授权网络，并事先限定范围、速率和时间窗口。`

### 3. 开源应用 · 文件加密 — rage

- GitHub：https://github.com/str4d/rage
- 形态与平台：Windows、macOS 与 Linux 文件加密 CLI；实现 age 格式，支持收件人密钥、SSH 公钥、口令、管道和硬件 PIV 插件。
- 许可证与维护：MIT OR Apache-2.0；`main` 分支在 2026-07-14 仍有提交，README 提供三平台预编译包及多种包管理器安装方式。
- 一手来源：[README](https://github.com/str4d/rage/blob/main/README.md)、[MIT 许可证](https://github.com/str4d/rage/blob/main/LICENSE-MIT)、[Apache-2.0 许可证](https://github.com/str4d/rage/blob/main/LICENSE-APACHE)、[Releases](https://github.com/str4d/rage/releases)、[Commits](https://github.com/str4d/rage/commits/main)
- 必要边界：解密依赖正确身份密钥或口令，项目不提供托管式找回机制；加密重要文件前应离线备份密钥、验证恢复流程，并避免把私钥与密文存放在同一位置。
- 可录入描述：`Windows、macOS 与 Linux age 文件加密 CLI｜用收件人密钥、SSH 公钥或口令保护文件和管道；加密前离线备份密钥并实测恢复，丢失身份密钥或口令可能无法解密。`

### 4. 开源应用 · 压缩解压 — Ouch

- GitHub：https://github.com/ouch-org/ouch
- 形态与平台：Windows、macOS 与 Linux 压缩/解压 CLI；统一提供 `compress`、`decompress` 和 `list`，支持 ZIP、TAR、7z、RAR（仅解压/列表）等多种格式。
- 许可证与维护：MIT；`main` 分支在 2026-08-31 仍有提交，README 提供 Homebrew、Scoop、Cargo 与 Linux 包安装方式。
- 一手来源：[README](https://github.com/ouch-org/ouch/blob/main/README.md)、[LICENSE](https://github.com/ouch-org/ouch/blob/main/LICENSE)、[Releases](https://github.com/ouch-org/ouch/releases)、[Commits](https://github.com/ouch-org/ouch/commits/main)
- 必要边界：不可信档案可能包含恶意文件、符号链接、异常路径或覆盖同名文件；先用 `list` 查看内容，再解压到隔离的新目录，核对路径和文件类型后再移入工作区。
- 可录入描述：`Windows、macOS 与 Linux 多格式压缩 CLI｜统一压缩、解压和查看 ZIP、TAR、7z 等档案；不可信档案先查看列表并解压到隔离目录，核对路径、链接和覆盖提示。`

### 5. 开源应用 · 系统救援 — ShredOS

- GitHub：https://github.com/PartialVolume/shredos.x86_64
- 形态与平台：面向 x86 PC、服务器及 Intel Mac 的可启动磁盘维护镜像；从 USB、光盘、Ventoy 或 PXE 启动 nwipe，执行硬盘、SSD 与 NVMe 擦除并生成报告。
- 许可证与维护：主体随 Buildroot 采用 GPL-2.0-or-later，各捆绑组件保留各自许可证；`master` 分支在 2026-08-27 仍有提交，并提供持续发布的可启动镜像。
- 一手来源：[README](https://github.com/PartialVolume/shredos.x86_64/blob/master/README.md)、[COPYING](https://github.com/PartialVolume/shredos.x86_64/blob/master/COPYING)、[Releases](https://github.com/PartialVolume/shredos.x86_64/releases)、[Commits](https://github.com/PartialVolume/shredos.x86_64/commits/master)
- 必要边界：README 明确警告擦除不可逆，写入启动介质本身也会覆盖目标盘；先备份并验证可恢复性，逐项核对设备路径、容量和序列号，禁止在未确认目标盘时启动擦除或无人值守 `autonuke`。
- 可录入描述：`x86 PC、服务器与 Intel Mac 可启动磁盘擦除系统｜通过 USB、光盘或 PXE 运行 nwipe 并生成报告；擦除和写入启动介质均不可逆，先备份并按容量、路径及序列号复核目标盘。`

### 6. 开源应用 · IT 资产管理 — ITFlow

- GitHub：https://github.com/itflow-org/itflow
- 形态与平台：面向小型 MSP 的 Ubuntu/Debian 自托管 Web 平台；集中管理客户资产、联系人、域名、文档、文件、密码、工单和账务。
- 许可证与维护：GPL-3.0；`master` 分支在 2026-09-01 仍有提交，仓库发布 `v26.09` 并提供官方安装与安全文档。
- 一手来源：[README](https://github.com/itflow-org/itflow/blob/master/README.md)、[LICENSE](https://github.com/itflow-org/itflow/blob/master/LICENSE)、[SECURITY](https://github.com/itflow-org/itflow/blob/master/SECURITY.md)、[安装文档](https://docs.itflow.org/installation)、[Releases](https://github.com/itflow-org/itflow/releases)、[Commits](https://github.com/itflow-org/itflow/commits/master)
- 必要边界：资产清单同时包含客户资料、密码、文件和财务信息；部署时应强制 HTTPS、最小权限与分角色访问，关闭默认/演示凭据，及时更新并对数据库和附件做加密备份及恢复演练。
- 可录入描述：`Ubuntu/Debian 自托管 MSP 资产与工单平台｜集中管理客户设备、文档、密码、域名和账务；部署时启用 HTTPS、最小权限与分角色访问，并加密备份数据库和附件。`

## 最终清单

| 分类 | 标题 | URL |
| --- | --- | --- |
| 日志查看 | Logria | https://github.com/ReagentX/Logria |
| 网络扫描 | Angry IP Scanner | https://github.com/angryip/ipscan |
| 文件加密 | rage | https://github.com/str4d/rage |
| 压缩解压 | Ouch | https://github.com/ouch-org/ouch |
| 系统救援 | ShredOS | https://github.com/PartialVolume/shredos.x86_64 |
| IT 资产管理 | ITFlow | https://github.com/itflow-org/itflow |
