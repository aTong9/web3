# 资源导航补充研究 · Batch 121

核验日期：2026-09-04。仅研究 3 项；未修改目录、安装软件、创建账户、运行工作流或上传媒体。

## 去重与补缺

已检查目标分类现有项目，并在整个 `src/data/webstack.yml` 检索产品、仓库和别名：OwnTone / forked-daapd / mt-daapd / Firefly Media Server、Prefect、Liferea / lwindolf 均无匹配。OwnTone 补充网络音频接收设备桥接，Prefect 补充代码优先的 Python 编排，Liferea 补充 Linux GTK 桌面订阅阅读；不是已有项目的包装器。其他分类已有的 Audiobookshelf、Komga、Kavita、Newsboat、NewsFlash、NetNewsWire 等未重复加入。

## 开源应用 · 家庭媒体

```yaml
- title: OwnTone
  logo: finance.png
  url: https://github.com/owntone/owntone-server
  description: 开源家庭音频服务器｜运行于 Linux、BSD、macOS，将本地音乐等音源发送到 AirPlay、Chromecast 等设备；保护局域网控制入口，在线音源另受服务与版权限制。
```

- [官方仓库与 README](https://github.com/owntone/owntone-server)：确认平台、Web UI 控制、DAAP、本地文件和互联网音源，以及 AirPlay 1/2、Chromecast 等输出；原名 forked-daapd。服务器部署工具，不宣称 Windows 原生服务器或一键安装。
- [COPYING](https://github.com/owntone/owntone-server/blob/master/COPYING)：包含 GNU GPL v2 正文；未将许可证模板末尾的示例误当成项目特定的 later-version 授权。
- [官方发布页](https://github.com/owntone/owntone-server/releases)：可访问的版本发布入口；本次不承诺维护响应时效或所有设备兼容性。
- 边界：网络控制与第三方音源不是天然离线或私密；局域网访问限制为使用建议，不是已测试安全保证。

## 开源应用 · 自动化集成

```yaml
- title: Prefect
  logo: finance.png
  url: https://github.com/PrefectHQ/prefect
  description: Apache-2.0 开源 Python 工作流编排｜需 Python 3.10+，支持任务调度、重试与自托管监控；保护凭据和日志，重试前确认外部操作可安全重复。
```

- [官方仓库与 README](https://github.com/PrefectHQ/prefect)：确认 Apache-2.0、Python 3.10+、pip/uv 安装、代码优先 flow/task、调度、缓存与重试。
- 同一 README 区分自托管 Prefect server 与托管 Prefect Cloud；不将可选云服务描述为免费自托管功能，也不要求用户注册。
- [官方发布页](https://github.com/PrefectHQ/prefect/releases)：可访问的持续版本发布入口；安装应按所选版本重新核对 Python 及依赖要求。
- 边界：执行代码及集成外部系统涉及真实副作用；重试可能重复写入，应限制凭据权限并保护日志。未执行任何示例。

## 开源应用 · 邮件订阅

```yaml
- title: Liferea
  logo: finance.png
  url: https://github.com/lwindolf/liferea
  description: Linux GTK 开源订阅阅读器｜通过发行版或 Flatpak 安装，集中整理新闻源并使用内嵌浏览器阅读；访问外部内容会联网，谨慎打开未知链接并保护订阅记录。
```

- [官方仓库与 README](https://github.com/lwindolf/liferea)：确认桌面新闻源聚合、邮件客户端式界面、内嵌浏览器、Linux GTK/GNOME 依赖和发行版/Flatpak 安装途径；不是电子邮件收发服务。
- [COPYING](https://github.com/lwindolf/liferea/blob/master/COPYING)：包含 GNU GPL v2 正文；仓库另列 COPYING.LIB 与 LGPL-3.0 信号，故卡片仅称开源，不以单一许可证概括所有组成部分。
- [官方发布页](https://github.com/lwindolf/liferea/releases)：可访问的发布入口；本次未安装或测试发行版软件包。
- 边界：订阅抓取和浏览外链会联系源站；不声称零联网、零追踪或所有内容可离线阅读。

## 核验限制

证据来自第一方 GitHub 仓库、许可证及发布页；页面直接可读。未运行软件，未验证网络设备兼容性、全部插件、包签名或安全配置。卡片中的防护建议是风险提示，不是对项目已实现相应保证的断言。
