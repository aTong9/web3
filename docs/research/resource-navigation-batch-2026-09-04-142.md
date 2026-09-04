# 资源导航第 142 批来源核验

核验日期：2026-09-04。磁盘分析、日志查看、文件比较各一项。

## 去重与互补

已阅读三个分类并对完整 `src/data/webstack.yml` 检索 Duc / zevv/duc、Stern / stern/stern / wercker/stern、dyff / homeport/dyff，均无命中。duf 已在系统文件分类收录，排除。Duc 补充持久索引后的快速查询，Stern 补充 Kubernetes 多 Pod 日志，dyff 补充 YAML/JSON 路径级差异。

## 开源应用 · 磁盘分析

```yaml
title: Duc
logo: finance.png
url: https://github.com/zevv/duc
description: 磁盘占用索引与可视化工具，将目录统计保存为数据库供快速查询｜Linux 命令行与图形界面，LGPL-3.0；索引不是实时状态，分享前须清理敏感路径
```

- [官方仓库](https://github.com/zevv/duc)标示 LGPL-3.0，描述目录大小数据库及图形查询；不是自动清理器。
- [官网](https://duc.zevv.nl/)列出 Debian/Ubuntu 包、源码构建与 CLI、ncurses、X/OpenGL、CGI 界面。平台描述保守采用 Linux，不将源码构建路径扩张为所有系统的现成安装包。
- 本地使用无云账户或许可费用。扫描生成的数据库包含路径与空间信息，不能认为没有原文件内容就无隐私风险；CGI 输出也需权限控制。
- 查询读取已有统计，目录改变后需刷新索引；权限不足或扫描时间差会影响结果。官网示例版本较早，部署前核验依赖和目标发布，未宣称高速性能必然适用于当前设备。

## 开源应用 · 日志查看

```yaml
title: Stern
logo: finance.png
url: https://github.com/stern/stern
description: Kubernetes 多 Pod 与容器日志追踪 CLI，支持筛选和来源着色｜Windows、macOS、Linux，Apache-2.0；仅连接获授权集群，保护 kubeconfig 与日志中的敏感数据
```

- [官方 README](https://raw.githubusercontent.com/stern/stern/master/README.md)说明同时追踪多个 Pod/容器及自动适应 Pod 增删；这是已停止的 wercker/stern 的维护分支，不另加旧仓库。
- README 提供发行二进制、Go 源码及 Linux/macOS/Windows 包管理安装路径。它是访问 Kubernetes 的客户端，不是云日志存储平台或自动日志归档服务。
- [当前许可证原文](https://raw.githubusercontent.com/stern/stern/master/LICENSE)为 Apache-2.0；同一地址早期网页缓存曾显示不同长度，因此再次打开正文确认，不凭记忆标为 MIT。
- 核心源码免费，集群与云流量成本另计。使用实际集群上下文及权限访问 API，应遵守最小权限，保护 kubeconfig、令牌和日志；过滤展示不等于源数据已脱敏。只有实际授权后才可读取集群，本轮没有连接集群。

## 开源应用 · 文件比较

```yaml
title: dyff
logo: finance.png
url: https://github.com/homeport/dyff
description: YAML 与 JSON 结构化差异 CLI，按文档路径归纳字段变化｜macOS、Linux、FreeBSD，MIT；差异输出可能暴露配置秘密，原地改写前须备份
```

- [官方 README](https://raw.githubusercontent.com/homeport/dyff/main/README.md)说明路径级变化、文件/标准输入/远程 URI 输入以及格式转换；[LICENSE](https://raw.githubusercontent.com/homeport/dyff/main/LICENSE)为 MIT。
- 官方给出 macOS/Linux 预构建与 FreeBSD 安装路径，以及 GitHub Releases；建议发行版本，源码主分支构建不等于稳定发布。未据 Go 可跨平台编译便承诺已验证其他系统。
- 本地比较无需账户和外部上传；指定远程 URI 才会访问相应服务，分享差异报告前应处理密码、连接串和令牌。
- 工具还有原地改写选项，不能将所有子命令都描述成只读。比较本身不证明配置正确或部署安全；不要将报告当成自动授权合并或部署。本轮未比较任何私人文件，也未写入配置。

## 边界

仅新增研究文档，未修改 YAML、安装、扫描目录、清理数据、读取日志、访问集群或比较私密资料。来源核验不是运行验收与安全审计。
