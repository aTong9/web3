# 资源导航补充研究 · Batch 124

核验日期：2026-09-04。仅研究 3 项；没有修改 YAML、安装软件、连接服务器或操作文件服务。

## 去重与功能取舍

读取服务器运维、数据库引擎、下载传输分类，并在完整 `src/data/webstack.yml` 检索 Healthchecks / healthchecks.io、CouchDB、Dufs / sigoden/dufs，均无匹配。Dozzle、Magic Wormhole、Croc、Gokapi 已存在，未重复收录。SFTPGo 的 Web UI 有额外专有许可条件，本轮不选。三项分别补定时任务漏报、JSON 文档复制、轻量临时目录传输，不是已有项目包装器。

## 开源应用 · 服务器运维

```yaml
- title: Healthchecks
  logo: finance.png
  url: https://github.com/healthchecks/healthchecks
  description: Python/Django 自托管任务监控｜接收 cron 与后台任务心跳，超时未收到时发送告警；保护心跳地址和通知凭据，避免在请求正文中传入敏感日志。
```

- [官方仓库](https://github.com/healthchecks/healthchecks)：BSD-3-Clause；HTTP/邮件 ping、超时告警、仪表盘、API、通知集成。区别于主机资源图表和普通网站探活。
- [自托管文档](https://healthchecks.io/docs/self_hosted/)与 README 提供 Python/Django、数据库及容器部署资料；当前主分支依赖变化不写死卡片，按所选发行版核对。
- [发布页](https://github.com/healthchecks/healthchecks/releases)可读，含版本历史。托管 Healthchecks.io 是独立服务，其套餐不等于开源部署无限免费；自托管仍有运维和外部通知成本。
- 告警只能反映约定心跳情况，不能证明任务输出正确。心跳 URL、正文与通知令牌应当作敏感运维数据，避免泄露或被伪造。

## 开源应用 · 数据库引擎

```yaml
- title: Apache CouchDB
  logo: finance.png
  url: https://github.com/apache/couchdb
  description: Apache-2.0 自托管文档数据库｜通过 HTTP/JSON 存取文档并支持多节点复制，适合需要同步的数据应用；配置认证与 TLS，验证冲突处理并保留独立备份。
```

- [官方仓库](https://github.com/apache/couchdb)：Apache-2.0 标识，Unix/macOS/Ubuntu 与 Windows 安装指南入口；不是浏览器嵌入式数据库。
- [官方技术概览](https://docs.couchdb.org/en/stable/intro/overview.html)：文档数据库与复制设计；同步和复制并不消除应用层冲突处理，也不是独立灾难恢复备份。
- [官方发行说明](https://docs.couchdb.org/en/stable/whatsnew/index.html)可读，作为版本维护证据。生产服务须配置数据库权限、认证、TLS 与备份；没有采用 README 开发集群的弱口令/宽松设置。
- 开源软件许可不包含托管基础设施或商业支持费用；未导入数据、运行数据库或验证具体工作负载。

## 开源应用 · 下载传输

```yaml
- title: Dufs
  logo: finance.png
  url: https://github.com/sigoden/dufs
  description: Windows、macOS、Linux 轻量文件服务器｜通过浏览器或 WebDAV 传输指定目录，支持续传和权限配置；仅共享必要目录，启用认证与 HTTPS，谨慎授予写入删除权限。
```

- [官方仓库](https://github.com/sigoden/dufs)：MIT/Apache-2.0 许可文件，提供桌面平台二进制、Cargo、Homebrew 与容器安装路径；支持上传、部分下载/续传、WebDAV、HTTPS 和访问控制。
- 与 File Browser 有部分文件浏览重叠，但重点为命令行启动指定目录及 WebDAV/curl 传输，非另加完整云盘或下载队列界面。
- README 默认示例为当前目录只读；全操作选项会允许上传、编辑和删除。卡片明确最小共享范围，不将示例全权限启动方式当生产默认建议，也不承诺默认认证/HTTPS。
- [官方发布页](https://github.com/sigoden/dufs/releases)可读，v0.46.0 记录包含权限、符号链接、范围请求等修复；使用前核对发行版，版本不写死卡片。
- 服务会暴露选择的文件；只读不意味着保密。防火墙、身份验证、TLS、备份及日志保护由部署者配置。未开启监听、传输文件或访问云账户。

## 核验边界

第一方文档与仓库可读，发布记录仅表明存在维护产物；未做运行、安全或性能测试。隐私、安全与备份说明是使用建议，不是软件默认设置或保证。
