# 资源导航补充研究 · Batch 135

日期：2026-09-04。CAD 建模、无障碍辅助、物联网平台各 1 项；仅研究，未安装或操作硬件。

## 去重

已阅读三类现有条目并全文件搜索 `src/data/webstack.yml`：ezdxf / mozman、Asterics AAC / AsTeRICS-Grid / asterics、eclipse-ditto 均未收录。NVDA 在其他分类已存在，排除。已收录的 Ditto（sabrogden 剪贴板）与 Dittofeed 不是 Eclipse Ditto。AsTeRICS-Grid 官方 URL 跳转到 Asterics-AAC，使用新地址并记录旧名。

## 开源应用 · CAD 建模

```yaml
title: ezdxf
logo: finance.png
url: https://github.com/mozman/ezdxf
description: Windows、macOS、Linux 的 Python DXF 工具库｜脚本创建、检查和修改图纸，补充 CAD 文件自动处理；非完整建模内核，保留原件并验证输出，DWG 处理需额外转换工具
```

- [官方 README](https://github.com/mozman/ezdxf)：MIT，面向开发者，Python 包及 CLI，核心支持 DXF 读写，Windows/Linux/macOS 有二进制 wheel；插件有额外依赖。
- README 明确 DWG 通过 ODA File Converter 适配器，不应称为原生无需依赖 DWG 编辑器。不同 DXF 版本支持范围有差别，未知实体/渲染不能一概保证完整可编辑。
- [发布入口](https://github.com/mozman/ezdxf/releases)本次未看到可确认的发布列表，安装依据 README 的 PyPI/官方文档入口，不声称已验证 GitHub 安装包。
- 库不要求付费账户，外部转换器独立许可；输出须检查尺寸、单位、字体与实体，不能直接认定制造安全或工程正确。图纸可能含商业机密，避免未经授权上传。

## 开源应用 · 无障碍辅助

```yaml
title: Asterics AAC
logo: finance.png
url: https://github.com/asterics/Asterics-AAC
description: 浏览器/PWA 辅助沟通板｜原名 AsTeRICS Grid，以图格、文字与语音支持触控、键盘等输入，可离线使用；语音依设备而异，可选云同步和外部服务须另核对隐私与素材许可
```

- [官方仓库](https://github.com/asterics/Asterics-AAC)：AGPL-3.0 源码，浏览器运行、支持 PC/手机/平板与离线模式，提供多种辅助输入和沟通板；不是 NVDA/Orca 屏幕阅读器的替代。
- 同页说明可选端到端加密云同步、设备相关语音，在线媒体/符号查询是外部服务；不能把全部功能宣称离线。复杂眼动等输入可需 AsTeRICS Framework 或硬件，卡片不承诺无设备即用。
- 项目称免费，但仓库所列第三方语音和 Prima 字体含非商业限制，图符等亦有独立许可；AGPL 不覆盖所有素材商用权。分享个人沟通板前审查照片、姓名和内容。
- [官方发布记录](https://github.com/asterics/Asterics-AAC/releases)可核查。仅推荐基础沟通用途，不执行智能家居动作，也不把个体适用性或治疗效果作为承诺。

## 开源应用 · 物联网平台

```yaml
title: Eclipse Ditto
logo: finance.png
url: https://github.com/eclipse-ditto/ditto
description: Docker 自托管 IoT 数字孪生框架｜管理设备的虚拟状态、访问策略与连接集成；需数据库和运行资源，示例配置不等于生产安全，实际设备接入与控制必须单独授权验证
```

- [官方仓库](https://github.com/eclipse-ditto/ditto)：EPL-2.0，提供数字孪生状态与策略服务，补充现有消息代理/网关功能；支持 Docker Compose，本地运行依赖 Docker、数据库等组件，不是手机端 App。
- README 示例组合含 MongoDB、服务及基础认证反向代理；演示配置不应直接公开部署。采用稳定版本，限制 API 与设备权限、配置 TLS、身份认证和备份，不使用默认演示凭据。
- [官方发布记录](https://github.com/eclipse-ditto/ditto/releases)可核查。框架开源不代表托管、数据库、设备或外部消息服务免费，依赖许可证亦须单独确认。
- 虚拟状态不保证实时对应物理状态；任何控制路径需独立安全评估。本次只研究软件，不建立连接或执行设备动作。

## 边界

未改 YAML、下载运行、接入账户或上传资料；文档核验不替代实际兼容性、工程或安全审查。
