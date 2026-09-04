# 资源导航第 112 批核验

核验日期：2026-09-04。范围：联邦社交、多链浏览器与钱包事件支持，各补一个第一方入口。

## Friendica — Social Contact

- [官方仓库](https://github.com/friendica/friendica) README 可读取：联邦社交平台，支持与 Mastodon、Diaspora 等服务通信，允许选择现有服务器或自行部署；仓库标明 AGPL-3.0。
- 属于自托管 Web 应用而非免维护桌面软件；参与社交通常需要在所选服务器建立账户，节点规则和维护质量由运营者决定。源码入口公开可读。
- 项目站 friendi.ca 本次抓取超时，采用维护者仓库作为目录入口；未注册、安装或测试跨站互动。

```yaml
title: Friendica
logo: finance.png
url: https://github.com/friendica/friendica
description: AGPL 开源联邦社交平台｜可加入现有服务器或自托管，与 Mastodon 等社区互动；使用需账户，自建需维护服务器并核对节点规则。
```

## Blockscout — 加密生态 · 多链浏览器

- [官方首页](https://www.blockscout.com/)提供 EVM 多链地址、交易、代币及区块查询，公开页面可以读取，普通探索不要求个人资料；高级服务和合约交互不纳入本批验证。
- [官方仓库](https://github.com/blockscout/blockscout)提供自部署文档入口，但当前 README 和 [LICENSE](https://github.com/blockscout/blockscout/blob/master/LICENSE)标注自定义 Blockscout Software Licence，不将其概括为 MIT、GPL 或无限制商业复用。
- 收录作为浏览查询网站，不承诺覆盖所有区块链、数据实时完整或合约安全；未连接钱包、调用合约或检验实际查询结果。

```yaml
title: Blockscout
logo: finance.png
url: https://www.blockscout.com/
description: EVM 多链区块浏览与检索｜公开查询地址、交易、代币及区块；覆盖范围以站点为准，浏览器展示不代表合约或资产安全。
```

## SEAL 911 — 加密生态 · 钱包安全

- [Security Alliance 官方项目页](https://securityalliance.org/our-work/seal-911)介绍免费的全天候加密安全事件联系渠道；与现有风险检测扩展不同，补充事件发生后的支持入口。
- [官方仓库说明](https://github.com/security-alliance/seal-911)明确使用 Telegram 联系，依赖志愿者可用容量，长时间链上追踪可能超出支持能力；单独专业机构服务不属于 SEAL 911 免费服务。
- 仅目录信息，非即时响应、资产追回或安全保证；用户应从官方入口核验联系人，切勿泄露助记词。本批未打开机器人、发送消息、披露数据或请求救援。

```yaml
title: SEAL 911
logo: finance.png
url: https://securityalliance.org/our-work/seal-911
description: Security Alliance 免费加密安全事件支持入口｜经官方 Telegram 联系志愿者，响应受容量限制；勿泄露助记词或私钥，不保证资产追回。
```

## 去重与范围

全量检索 src/data/webstack.yml 的 Friendica/friendi、Blockscout/block scout、Security Alliance/security-alliance、SEAL 911/seal911 等名称、域名和别名，无已有条目。Ethereum 安全指南候选与已有 ethereum.org 品牌入口相邻，本批改选独立 SEAL 支持资源。

仅新增本研究记录，未修改 YAML；未安装、注册、签名、转账或提交外部表单。运行时目录与构建验证由主任务在落盘后进行。
