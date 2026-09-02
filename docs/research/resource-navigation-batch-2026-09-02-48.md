# 资源导航第 48 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按标题及去除末尾 `/`、忽略大小写后的 URL 检查
`src/data/webstack.yml`，下列 6 项均未在全局目录中出现。

| 分类 | 建议条目 | 平台 / 形态 | 许可与近期维护 | 数据隐私或生产安全边界及推荐中文描述 |
| --- | --- | --- | --- | --- |
| 开源应用 · 开发数据 | [Lapce](https://github.com/lapce/lapce) | Rust 桌面代码编辑器；Windows、Linux、macOS 发行版 | [Apache-2.0](https://github.com/lapce/lapce/blob/master/LICENSE)；官方主仓于 2026-09-01 仍有提交。[README](https://github.com/lapce/lapce#readme) | `跨平台 Rust 代码编辑器｜内置 LSP、终端、远程开发和 WASI 插件；打开不可信仓库或插件前须审查权限，远程连接凭据按最小权限隔离。` |
| 开源应用 · 数据标注 | [AnyLabeling](https://github.com/vietanhdev/anylabeling) | Windows、Linux、macOS 桌面标注应用；可执行文件与 PyPI 安装 | [GPL-3.0](https://github.com/vietanhdev/anylabeling/blob/main/LICENSE)；主维护仓库于 2026-08-30 仍有提交。[README](https://github.com/vietanhdev/anylabeling#readme) | `Windows、Linux 与 macOS 桌面标注应用｜用 YOLO、SAM 等模型辅助图像、视频、OCR 与分割标注；敏感数据优先离线处理，并核对自动下载模型的来源、许可与数据授权。` |
| 开源应用 · 数据目录 | [Egeria](https://github.com/odpi/egeria) | Java 17 自托管开放元数据与治理平台；服务器、API、事件与连接器 | [Apache-2.0](https://github.com/odpi/egeria/blob/main/LICENSE)；官方主仓于 2026-09-01 仍有提交，并已发布 [V6.0](https://github.com/odpi/egeria/releases/tag/V6.0)。[README](https://github.com/odpi/egeria#readme) | `Java 自托管开放元数据与治理平台｜通过类型系统、API、事件和连接器交换目录、血缘及治理上下文；元数据不等同访问控制，生产环境仍须配置认证、TLS、最小权限和审计。` |
| 开源应用 · 数据质量 | [Elementary OSS](https://github.com/elementary-data/elementary) | Python/dbt 原生数据质量与可观测 CLI；自托管报告与告警 | [Apache-2.0](https://github.com/elementary-data/elementary/blob/master/LICENSE)；开源 CLI 与高级云服务边界由官方 README 说明，主仓于 2026-09-01 仍有提交。[README](https://github.com/elementary-data/elementary#readme) | `Apache-2.0 的 dbt 数据质量与可观测 CLI｜读取仓库元数据、构建产物和测试结果，生成报告及告警；连接生产数仓时使用只读最小权限账号，并评估报告和通知渠道中的敏感字段。` |
| 开源应用 · 数据库管理 | [Pgweb](https://github.com/sosedoff/pgweb) | Windows、macOS、Linux 单二进制或 Docker；PostgreSQL Web 管理器 | [MIT](https://github.com/sosedoff/pgweb/blob/main/LICENSE)；[v0.17.0](https://github.com/sosedoff/pgweb/releases/tag/v0.17.0) 支持 PostgreSQL 18，官方主仓于 2026-07-26 仍有提交。[README](https://github.com/sosedoff/pgweb#readme) | `PostgreSQL Web 管理器｜以 Windows、macOS、Linux 单文件或 Docker 运行，浏览对象、数据并执行 SQL；不要无认证暴露公网，使用 TLS、只读或最小权限账号并妥善保管连接串。` |
| 开源应用 · 数据库迁移 | [Skeema](https://github.com/skeema/skeema) | Linux、macOS 的 MySQL/MariaDB 声明式架构 CLI | 社区版采用 [Apache-2.0](https://github.com/skeema/skeema/blob/main/LICENSE)，部分高级能力属于商业版本；官方主仓于 2026-08-31 仍有提交。[README](https://github.com/skeema/skeema#readme) | `Linux 与 macOS 的 MySQL/MariaDB 声明式架构 CLI｜从实时数据库生成差异、检查规则并执行变更；生产执行前须审查 SQL、备份并在副本演练恢复，账号仅授予必要 DDL 权限。` |
