# 资源导航补充研究 · Batch 123

核验日期：2026-09-04。仅研究 3 项，没有修改目录 YAML、安装软件、注册或连接账户。

## 全局去重及功能补缺

读取经营财务、教学学习、项目协作分类，并对完整 `src/data/webstack.yml` 检索 Ledger 标题及 ledger/ledger、ledger-cli，Veyon / iTALC，Etherpad / ether/etherpad，无匹配。Kimai、solidtime、HedgeDoc 已收录，排除。Ledger CLI 补纯文本记账；Veyon 补授权课堂计算机演示；Etherpad 补逐字协作及修订回看而非再加看板。Etherpad 旧 etherpad-lite 仓库已重定向至 ether/etherpad，使用后者。

## 开源应用 · 经营财务

```yaml
- title: Ledger CLI
  logo: finance.png
  url: https://github.com/ledger/ledger
  description: 本地命令行复式记账工具｜读取纯文本账本生成账户与交易报告，无需另设数据库；保护财务文件并备份，报表不能替代会计或税务复核。
```

- [官方仓库](https://github.com/ledger/ledger)：明确 UNIX 命令行、纯文本输入、报告输出且不维护独立数据库或状态；不是加密钱包品牌，也不提供银行账户操作。
- [安装文档](https://github.com/ledger/ledger/blob/main/INSTALL.md)及 README 提供源码构建和依赖说明；不承诺全平台一键图形安装。README 的容器链接由第三方发布，不能当成维护者官方镜像保证。
- [许可证](https://github.com/ledger/ledger/blob/main/LICENSE.md)包含三条 BSD 风格条件：保留声明、二进制附带条件、不得擅用作者名义背书；卡片不写未经 GitHub 自动识别确认的 SPDX 标识。
- [发布页](https://github.com/ledger/ledger/releases)可访问，有版本历史。保护本地账本和备份是使用建议，不是默认文件加密保证；没有连接银行或获取财务数据。

## 开源应用 · 教学学习

```yaml
- title: Veyon
  logo: finance.png
  url: https://github.com/veyon/veyon
  description: Windows 与 Linux 开源课堂管理工具｜在授权教学网络中演示教师屏幕并远程协助学生；须取得知情授权、限制访问权限，避免无关屏幕与个人信息采集。
```

- [官方仓库](https://github.com/veyon/veyon)：GPL-2.0 标识，教师屏幕广播、远程支持、材料分发等；属于课堂端点管理而非 LMS。没有执行其远程控制能力。
- [官方安装说明](https://docs.veyon.io/en/latest/admin/installation.html)：Windows/Linux 计算机，依赖互通 TCP/IP 网络；Windows 安装程序及 Linux 包/源码方式；性能取决于客户端数量和网络，不承诺任意规模流畅。
- [发布页](https://github.com/veyon/veyon/releases)可读，存在版本记录。开源核心不代表支持服务或所有附加产品都无费用；本轮仅推荐仓库对应核心。
- 屏幕数据可能涉及学生隐私；仅适用于事先授权且向参与者明示的教学场景。应配置身份验证、权限、最小采集范围，不进行隐蔽部署或监控。

## 开源应用 · 项目协作

```yaml
- title: Etherpad
  logo: finance.png
  url: https://github.com/ether/etherpad
  description: Apache-2.0 自托管协作文档工具｜通过 Node.js 或 Docker 部署，多人实时共编并回看修订历史；配置访问控制与备份，勿把敏感项目资料放入公共实例。
```

- [官方仓库](https://github.com/ether/etherpad)：确认 Apache-2.0、作者颜色、修订记录与时间滑块；Node.js 部署文档覆盖 Windows/macOS/Linux，也提供官方 Docker 镜像。当前 README 的 Node.js 最低版本为 24，实际安装按选定发行版要求复核，不写死卡片。
- [隐私说明](https://github.com/ether/etherpad/blob/master/PRIVACY.md)及 README：不能将自托管解读为零网络请求，README 明示有两项可选择关闭的外部请求；插件、部署日志与第三方实例还有各自的数据边界。不沿用营销措辞作零遥测保证。
- [发布页](https://github.com/ether/etherpad/releases)可读，有版本历史。公共实例由第三方运营，不是 Etherpad 基金会提供的私人工作区；自托管有基础设施和维护成本，AI 等插件可能涉及额外服务费用与数据传输。

## 核验限制

第一方页面可读，未安装运行或完成安全审计；发布记录仅是维护信号，不保证响应速度和未来维护。风险文案为使用建议，非默认配置安全、隐私或财务准确性保证。
