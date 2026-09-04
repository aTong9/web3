# 资源导航第146批研究记录

日期：2026-09-04。范围：数据目录、数据质量、数据库迁移各一项。仅研究，不连接数据库、不执行迁移或安装。

## 去重与选择

已检查当前 `src/data/webstack.yml` 分类内容，并对全文件搜索产品名、仓库组织与 URL 别名。Intake、cuallee、pressly/goose 均无已有产品记录；现有 `goose` 指向 Block 的 AI 工具，并非本项数据库迁移工具，因此使用「Goose 数据库迁移」消歧。

选择用途：Intake 补充轻量代码级目录访问；cuallee 补充跨引擎业务事件流程校验；Goose 补充 SQL 与 Go 函数组合及嵌入式迁移，不增加同一产品的包装入口。

## 开源应用 · 数据目录

```yaml
title: Intake
logo: finance.png
url: https://github.com/intake/intake
description: Python 轻量数据目录工具，以声明式描述组织、发现并加载数据集｜BSD-2-Clause；需匹配读取插件，远程数据源须核验权限和凭据范围
```

- [官方仓库与 README](https://github.com/intake/intake)：描述数据、组织目录、检索、读取转换和输出，并支持第三方远程存储与计算；不是集中式权限治理服务器。
- 仓库 License 标识为 BSD-2-Clause。官方安装说明提供 conda、pip；具体数据驱动与插件有自己的额外依赖，平台可用性应按 Python 环境及插件确认。
- 软件开源不等于外部数据、存储和计算免费；使用远程后端可能产生服务费用。
- 使用边界：目录内容与插件应来自可信来源；共享目录不能替代数据授权，不应嵌入共享凭据。联网读取由所配置后端决定，不能承诺所有操作离线。

## 开源应用 · 数据质量

```yaml
title: cuallee
logo: finance.png
url: https://github.com/canimus/cuallee
description: Python 多引擎数据质量检查库，校验完整性、日期连续性与业务事件流程｜Apache-2.0；后端兼容需按版本核对，通过规则不代表数据真实
```

- [官方仓库](https://github.com/canimus/cuallee)：Apache-2.0，Python 库，通过 pip 安装；README 给出 pandas、PySpark 等后端支持矩阵。
- [官方业务流程校验说明](https://github.com/canimus/cuallee#workflows-process-mining)：按时间检验事件之间的允许关系，适合补充生命周期数据检查。支持矩阵不代表所有后端、版本和检查规则完全等价。
- 官方示例还涵盖非空、唯一值、日期与阈值规则；不采用仓库宣传中的速度排名作为目录承诺。
- 无需把数据上传至项目方托管服务才能使用 Python 库；实际数据处理位置由选用引擎决定，云仓库查询可能收费，扫描大数据会消耗计算资源。检查报告也可能暴露字段和业务信息，应受访问控制；规则通过不保证事实正确或法规合规。

## 开源应用 · 数据库迁移

```yaml
title: Goose 数据库迁移
logo: finance.png
url: https://github.com/pressly/goose
description: Go 数据库迁移 CLI 与库，支持增量 SQL、Go 函数及嵌入迁移文件｜MIT；需匹配数据库驱动，变更前备份并演练，回退脚本不等于恢复保障
```

- [官方 README](https://github.com/pressly/goose)：提供 CLI 和 Go 库，支持多数据库、Go 函数迁移及嵌入文件；Go 函数方案需要自定义构建，不能理解为下载通用 CLI 即执行任意 Go 文件。
- [官方许可证](https://github.com/pressly/goose/blob/main/LICENSE)：MIT。
- [安装入口](https://pressly.github.io/goose/installation/)及 README 提供 Go 工具链安装和 macOS Homebrew 入口；实际构建、数据库驱动及目标平台须匹配，不宣称所有驱动无限跨平台。
- 开源工具本体不是数据库托管服务；数据库、云资源和运维费用另计。SQL/Go 迁移会改变数据库，必须审查来源、权限、备份和演练；事务支持受数据库与语句限制，回退脚本不是数据恢复保证。连接凭据与 `.env` 不应进入公共目录或日志。

## 交付边界

仅编写本研究记录；未改 YAML、未创建账号、未安装软件、未读取业务数据或连接数据库。来源为项目官方仓库及其官方文档；未将静态源码阅读等同实际运行验证。
