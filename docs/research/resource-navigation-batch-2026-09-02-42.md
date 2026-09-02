# 资源导航第 42 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按去除末尾 `/`、忽略大小写检查
`src/data/webstack.yml`，下列 6 项的标题和 URL 均未在全局目录中出现。原候选 k6 已收录，
负载测试改用未收录且许可证明确的 Fortio。

| 分类 | 建议条目 | 平台 / 形态 | 许可与维护证据 | 风险边界与推荐中文描述 |
| --- | --- | --- | --- | --- |
| 开源应用 · 服务器运维 | [Webmin](https://github.com/webmin/webmin) | Unix、Linux、BSD 自托管 Web 管理面板 | [BSD-3-Clause](https://github.com/webmin/webmin/blob/master/LICENCE)；[2.660](https://github.com/webmin/webmin/releases/tag/2.660) 发布于 2026-08-21，主仓于 2026-09-01 仍有提交。[README](https://github.com/webmin/webmin#readme) | `自托管 Unix/Linux Web 管理面板｜在浏览器配置用户、服务、存储、网络及常见服务器应用；管理端具备高权限，应限制公网暴露、启用强认证并在变更前备份。` |
| 开源应用 · 服务状态页 | [Kener](https://github.com/rajnandan1/kener) | Docker 或 Node.js 自托管状态页；Redis 数据存储 | [MIT](https://github.com/rajnandan1/kener/blob/main/LICENSE)；[v4.1.3](https://github.com/rajnandan1/kener/releases/tag/v4.1.3) 与主仓提交均更新于 2026-08-31。[README](https://github.com/rajnandan1/kener#readme) | `Docker/Node.js 自托管状态页｜发布服务状态与事故信息并提供监测视图；保护管理密钥，避免公开内部地址、拓扑或含敏感资料的事故详情。` |
| 开源应用 · 负载测试 | [Fortio](https://github.com/fortio/fortio) | 跨平台 Go CLI、开发库、服务器、Web UI 与 Docker 镜像 | [Apache-2.0](https://github.com/fortio/fortio/blob/master/LICENSE)；[v1.75.3](https://github.com/fortio/fortio/releases/tag/v1.75.3) 发布于 2026-08-29，主仓同期持续维护。[README](https://github.com/fortio/fortio#readme) | `跨平台 Go 压测 CLI、库与 Web 服务｜按目标 QPS 测试 HTTP/gRPC 并记录延迟分布；仅压测自有或明确授权目标，预设速率、时窗和停止阈值。` |
| 开源应用 · 功能开关 | [FeatBit](https://github.com/featbit/featbit) | Docker 自托管平台；Kubernetes/Helm 部署与多语言 SDK | 主体采用 [MIT](https://github.com/featbit/featbit/blob/main/LICENSE)，README 明确为开放核心、部分功能另受许可证限制；[5.4.8](https://github.com/featbit/featbit/releases/tag/5.4.8) 发布于 2026-08-31，主仓于 2026-08-27 仍有提交。[README](https://github.com/featbit/featbit#readme) | `Docker/Kubernetes 自托管功能开关平台｜支持定向、渐进发布、审计和多语言 SDK；属于开放核心，部分功能需许可证，生产环境须保护管理密钥并保留安全默认值与快速回滚。` |
| 开源应用 · 可观测性 | [Coroot](https://github.com/coroot/coroot) | Docker/Kubernetes 自托管 APM 与可观测平台；eBPF Agent | [Apache-2.0](https://github.com/coroot/coroot/blob/main/LICENSE)；[v1.25.0](https://github.com/coroot/coroot/releases/tag/v1.25.0) 与主仓提交均更新于 2026-08-27。[README](https://github.com/coroot/coroot#readme) | `Docker/Kubernetes 自托管可观测与 APM 平台｜借助 eBPF 汇集指标、日志、追踪与持续剖析；Agent 和遥测可能接触敏感运行数据，应最小授权、限制访问并设置脱敏与保留策略。` |
| 开源应用 · 日志查看 | [Log Viewer](https://github.com/opcodesio/log-viewer) | Composer 安装的 PHP 包；嵌入 Laravel 8–12 Web 应用 | [MIT](https://github.com/opcodesio/log-viewer/blob/main/LICENSE.md)；[v3.24.2](https://github.com/opcodesio/log-viewer/releases/tag/v3.24.2) 与主仓提交均更新于 2026-06-11。[README](https://github.com/opcodesio/log-viewer#readme) | `Laravel 8–12 可安装日志查看包｜在 Web 界面搜索、筛选并浏览应用日志；日志可能包含令牌和个人资料，应启用鉴权、限制访问并先行脱敏。` |

## 未采用

- [k6](https://github.com/grafana/k6) 已在全局目录中使用，不重复新增。
- HyperDX 的许可与开放核心边界比本批 Apache-2.0 的 Coroot 更复杂，因此优先收录 Coroot。
