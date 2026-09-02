# 资源导航第 50 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按标题及去除末尾 `/`、忽略大小写后的 URL 检查
`src/data/webstack.yml`，下列 6 项均未在全局目录中出现。

| 分类 | 建议条目 | 平台 / 形态 | 许可与近期维护 | 合法授权、凭据或部署安全边界及推荐中文描述 |
| --- | --- | --- | --- | --- |
| 开源应用 · 网络安全 | [Falco](https://github.com/falcosecurity/falco) | Linux / 云原生运行时安全代理；主仓 README 明确覆盖系统调用、容器与 Kubernetes 行为检测。 | [Apache-2.0](https://github.com/falcosecurity/falco/blob/master/LICENSE)；2026-06-11 发布 v0.44.1，主分支 2026-08-29 仍有提交。 | 仅部署在本人或明确授权的主机；启用内核可见性前评估高权限、敏感日志与性能影响。推荐描述：**Linux 运行时安全代理｜监控系统调用、容器与 Kubernetes 行为并按规则告警；仅部署在本人或明确授权的主机，启用内核可见性前评估权限、日志敏感性与性能影响。** |
| 开源应用 · 身份认证 | [Logto](https://github.com/logto-io/logto) | 可自托管身份基础设施；支持 Docker Compose、OIDC、OAuth 2.1、SAML、SSO、RBAC 与多租户。 | [MPL-2.0](https://github.com/logto-io/logto/blob/master/LICENSE)；2026-08-31 发布 v1.43.0，主分支同日仍有提交。 | 生产环境需强制 TLS、严格限制回调地址和权限范围，并轮换客户端密钥与恢复凭据。推荐描述：**自托管身份认证平台｜通过 Docker 部署 OIDC、OAuth 2.1、SAML、SSO 与 RBAC；生产环境需强制 TLS、严格配置回调地址和最小权限，并妥善轮换客户端密钥与恢复凭据。** |
| 开源应用 · 密码管理 | [KeePassDX](https://github.com/Kunzisoft/KeePassDX) | Android 本地 KeePass / KDBX 密码库客户端；支持自动填充、TOTP 与通行密钥。 | [GPL-3.0](https://github.com/Kunzisoft/KeePassDX/blob/master/LICENSE)；2026-08-31 发布 4.5.2。 | 使用独立强主密码并保留离线备份；密钥文件不应与主密码存放在同一位置。推荐描述：**Android 本地密码管理器｜编辑 KeePass 加密保险库并支持自动填充、TOTP 与通行密钥；应使用独立强主密码、保留离线备份，且不要把密钥文件与主密码放在同一位置。** |
| 开源应用 · DNS 服务 | [Unbound](https://github.com/NLnetLabs/unbound) | 验证型递归缓存 DNS 解析器守护进程；支持 DNSSEC 验证、缓存与访问控制。 | [BSD-3-Clause](https://github.com/NLnetLabs/unbound/blob/master/LICENSE)；2026-08-04 发布 release-1.26.0，主分支 2026-09-01 仍有提交。 | 公网部署必须限制递归客户端、及时更新并防止配置成开放解析器。推荐描述：**验证型递归缓存 DNS 解析器｜作为本地或自托管守护进程提供 DNSSEC 验证、缓存和访问控制；公网部署须限制递归客户端、及时更新并避免成为开放解析器。** |
| 开源应用 · 证书管理 | [OpenBao](https://github.com/openbao/openbao) | 自托管密钥、证书与动态凭据服务；PKI 引擎支持签发、续期、吊销和租约管理。 | [MPL-2.0](https://github.com/openbao/openbao/blob/main/LICENSE)；2026-08-18 发布 v2.6.2，主分支 2026-09-01 仍有提交。 | 生产部署需隔离根密钥与解封材料，启用 TLS、审计、最小权限及灾难恢复。推荐描述：**自托管密钥与证书管理服务｜通过 PKI 引擎签发、续期和吊销证书，并管理动态凭据；生产部署需隔离根密钥与解封材料、启用 TLS 和审计，并落实最小权限与灾难恢复。** |
| 开源应用 · 数字取证 | [Hayabusa](https://github.com/Yamato-Security/hayabusa) | 跨平台命令行 Windows EVTX 分析工具；可基于 Sigma 规则生成 CSV、JSON 或 JSONL 时间线。 | [AGPL-3.0](https://github.com/Yamato-Security/hayabusa/blob/main/LICENSE.txt)；2026-08-03 发布 v4.0.0，主分支 2026-08-28 仍有提交。 | 仅分析合法取得的数据；保留原始日志与哈希，并遵循授权、隐私及证据保全流程。推荐描述：**命令行 Windows 事件日志取证工具｜基于 Sigma 规则生成 CSV、JSON 或 JSONL 时间线并辅助威胁狩猎；仅分析合法取得的数据，保留原始日志与哈希并遵循授权、隐私和证据保全要求。** |

## 结论

六项均与目标分类直接相关，许可证文件明确，且在 2026 年有发布或主分支维护记录。它们分别覆盖运行时防护、身份基础设施、本地密码库、递归 DNS、PKI / 动态凭据和 Windows 日志取证，形态互不重叠，可作为各分类的下一条增补候选。
