# 资源导航第 27 批一手来源核验

日期：2026-09-02

范围：为“API 模拟、API 网关、DNS 服务、容器镜像仓库、软件包仓库、证书管理”各筛选一个官方或主维护 GitHub 项目。候选已对 `src/data/webstack.yml` 全文件按 title 不区分大小写、URL 不区分大小写并忽略末尾斜杠检查，六项均未命中。

## 推荐项目

### 1. 开源应用 · API 模拟 — Microcks

- 主仓库：https://github.com/microcks/microcks
- 形态与能力：Kubernetes 原生的自托管 API 模拟与测试平台，可把 OpenAPI、AsyncAPI、gRPC protobuf、GraphQL schema、Postman collection 与 SoapUI project 转成可调用 Mock，并复用这些资产进行契约符合性和非回归测试；官方提供 Kubernetes、OpenShift、Docker Compose 与开发环境安装路径。[README](https://github.com/microcks/microcks#microcks---kubernetes-native-tool-for-api-mocking--testing) · [安装文档](https://microcks.io/documentation/guides/installation/)
- 许可证：[Apache-2.0](https://github.com/microcks/microcks/blob/master/LICENSE)。
- 维护信号：master 分支在 2026-09-01 仍有提交，1.15.0 于 2026-08-05 发布。[提交](https://github.com/microcks/microcks/commits/master/) · [1.15.0](https://github.com/microcks/microcks/releases/tag/1.15.0)
- 安全边界：导入的 API 资产、示例载荷和测试端点可能包含凭据或业务数据；不应导入生产密钥，也不应对未获授权的外部端点运行主动测试。部署时仍需限制管理面、Mock 端点与集成凭据的访问。
- 建议描述：`云原生 API 模拟与契约测试平台｜从 OpenAPI、AsyncAPI、gRPC、GraphQL、Postman 与 SoapUI 资产生成 Mock；避免导入生产密钥或测试未授权端点。`

### 2. 开源应用 · API 网关 — Envoy Gateway

- 主仓库：https://github.com/envoyproxy/gateway
- 形态与能力：管理 Envoy Proxy 的应用网关控制面，支持 Kubernetes 与 standalone 形态，并以 Kubernetes Gateway API 资源动态部署和配置 Envoy；官方文档覆盖 Helm、YAML 与 `egctl` 快速安装，以及流量、扩展、安全和可观测能力。[README](https://github.com/envoyproxy/gateway#envoy-gateway) · [官方文档](https://gateway.envoyproxy.io/docs/)
- 许可证：[Apache-2.0](https://github.com/envoyproxy/gateway/blob/main/LICENSE)。
- 维护信号：main 分支在 2026-09-01 仍有提交，v1.9.1 于 2026-08-28 发布。[提交](https://github.com/envoyproxy/gateway/commits/main/) · [v1.9.1](https://github.com/envoyproxy/gateway/releases/tag/v1.9.1)
- 网络安全边界：网关是公网流量与后端服务之间的信任边界；上线前需验证 TLS 终止、身份认证、授权、限流、管理面隔离与最小权限，不能把默认示例配置直接视作生产安全基线。
- 建议描述：`Envoy 应用网关控制面｜以 Kubernetes Gateway API 或独立模式配置路由、负载均衡、限流与安全策略；上线前需验证 TLS、鉴权和最小权限。`

### 3. 开源应用 · DNS 服务 — PowerDNS

- 主仓库：https://github.com/PowerDNS/pdns
- 形态与能力：仓库同时包含 PowerDNS Authoritative Server、PowerDNS Recursor 与 DNS 负载均衡器 dnsdist；三者可从源码构建，也分别提供 tar、Deb 与 RPM 软件包，适用于自托管 Linux DNS 基础设施。[README](https://github.com/PowerDNS/pdns#source-code--git) · [官方文档](https://doc.powerdns.com/)
- 许可证：仓库声明 [GPL-2.0，并带项目 NOTICE 所列例外](https://github.com/PowerDNS/pdns/blob/master/COPYING)。
- 维护信号：master 分支在 2026-09-01 仍有提交，官方 changelog 持续记录 Authoritative、Recursor 与 dnsdist 各自版本。[提交](https://github.com/PowerDNS/pdns/commits/master/) · [官方 Changelogs](https://doc.powerdns.com/)
- 网络安全边界：递归解析器不应无意暴露为开放递归服务；部署时需限制监听地址与允许网段、保护 API/控制端口、审计区域变更，并按场景配置 DNSSEC、缓存和速率限制。
- 建议描述：`权威、递归 DNS 与 dnsdist 套件｜通过 Linux 软件包或源码部署域名服务、递归解析和 DNS 负载均衡；避免开放递归并审计区域、DNSSEC 与访问控制。`

### 4. 开源应用 · 容器镜像仓库 — Spegel

- 主仓库：https://github.com/spegel-org/spegel
- 形态与能力：部署为 Kubernetes 集群内的无状态 OCI registry mirror，利用各节点已经拉取的镜像做点对点分发，减少外部 Registry 故障、限流和重复下载的影响；官方提供 Helm 安装。[README](https://github.com/spegel-org/spegel#spegel) · [部署文档](https://spegel.dev/docs/getting-started/)
- 定位限制：Spegel 是集群本地镜像与缓存层，不是中央制品真源；README 明示其 API 仍在演进、支持属于 best effort，并更偏个人或 homelab 场景，不能替代 Harbor 等受控主仓库。
- 许可证：[MIT](https://github.com/spegel-org/spegel/blob/main/LICENSE)。
- 维护信号：main 分支在 2026-09-01 仍有提交，v0.7.4 于 2026-07-15 发布。[提交](https://github.com/spegel-org/spegel/commits/main/) · [v0.7.4](https://github.com/spegel-org/spegel/releases/tag/v0.7.4)
- 供应链边界：缓存命中和点对点传输不证明镜像可信；仍应使用不可变 digest、验证签名和来源，并以准入策略控制可运行镜像。需要审计、强认证和制品治理时仍应保留正式 Registry。
- 建议描述：`Kubernetes 集群本地 OCI Registry 镜像｜利用节点已有镜像做点对点缓存，降低外部仓库故障、限流和拉取延迟；仍应固定摘要并校验签名与来源。`

### 5. 开源应用 · 软件包仓库 — Reposilite

- 主仓库：https://github.com/dzikoysk/reposilite
- 形态与能力：面向 JVM 生态 Maven 制品的轻量自托管仓库管理器，可作为独立 JAR、Docker 容器或 Kubernetes 实例运行；支持 releases、snapshots、private 仓库、远程镜像、访问令牌和本地或 S3 兼容存储。[项目说明](https://github.com/dzikoysk/reposilite/blob/main/reposilite-site/data/guides/introduction/about.md) · [安装形态](https://github.com/dzikoysk/reposilite/blob/main/reposilite-site/data/guides/installation/general.md) · [仓库能力](https://github.com/dzikoysk/reposilite/blob/main/reposilite-site/data/guides/features/repositories.md)
- 许可证：[Apache-2.0](https://github.com/dzikoysk/reposilite/blob/main/LICENSE)。
- 维护信号：main 分支在 2026-08-30 仍有提交，3.6.3 于 2026-08-30 发布。[提交](https://github.com/dzikoysk/reposilite/commits/main/) · [3.6.3](https://github.com/dzikoysk/reposilite/releases/tag/3.6.3)
- 供应链边界：软件包仓库是构建供应链入口；需启用 TLS、强访问令牌和最小路由权限，隔离管理账户，固定上游来源，并配合制品签名、校验、备份和审计。官方 Docker 文档也明确不建议使用浮动 `latest` 标签作为生产版本。[Docker 文档](https://github.com/dzikoysk/reposilite/blob/main/reposilite-site/data/guides/installation/docker.md) · [令牌权限](https://github.com/dzikoysk/reposilite/blob/main/reposilite-site/data/guides/authentication/tokens.md)
- 建议描述：`轻量自托管 Maven 制品仓库｜以独立 JAR、Docker 或 Kubernetes 部署 JVM 包托管与代理服务；需启用认证、TLS、权限和制品完整性策略。`

### 6. 开源应用 · 证书管理 — OpenXPKI

- 主仓库：https://github.com/openxpki/openxpki
- 形态与能力：基于 Perl 与 OpenSSL 的自托管 PKI/Trustcenter 平台，提供 Web UI、可版本化配置、多 CA、CA rollover，以及 SCEP、EST 和 ACME 集成；运行于多数类 Unix 平台，官方 README 指向 Debian 软件包与 Docker 镜像。[README](https://github.com/openxpki/openxpki#openxpki-trustcenter-software) · [Quickstart](https://openxpki.readthedocs.io/en/master/quickstart.html)
- 许可证：[Apache-2.0](https://github.com/openxpki/openxpki/blob/develop/LICENSE)。
- 维护信号：仓库未归档，develop 分支在 2026-08-11 仍有推送；项目说明稳定版与开发版并行，生产环境应选择偶数 minor 的稳定线而非奇数 minor 开发线。[提交](https://github.com/openxpki/openxpki/commits/develop/) · [README 的发布说明](https://github.com/openxpki/openxpki#release)
- 密钥安全边界：CA 私钥泄露会影响整条信任链；生产部署需将私钥隔离或使用 HSM，实施职责分离、审批、审计、离线且可恢复的备份，并在变更前验证吊销、续期和灾难恢复流程。
- 建议描述：`企业级 PKI 与证书生命周期平台｜在 Debian 或容器中管理申请、签发、续期、吊销、多个 CA 与 SCEP/EST/ACME；CA 私钥应隔离并配合 HSM、分权、审计和备份。`

## 结论

六项均为当前可访问、未归档且近期仍有维护活动的官方或主维护 GitHub 项目，并与目录现有 title/规范化 URL 不重复。录入时应保留 Microcks 的主动测试授权边界、Envoy Gateway 与 PowerDNS 的网络信任边界、Spegel 的“缓存镜像而非制品真源”定位，以及 Reposilite 和 OpenXPKI 的供应链与密钥保护要求。
