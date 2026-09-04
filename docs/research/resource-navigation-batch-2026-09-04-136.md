# 资源导航补充研究 · Batch 136

日期：2026-09-04。语言翻译、族谱家史、博物档案各 1 项。仅研究，不安装或上传资料。

## 去重与用途

已读取三类全部现有条目，全 `src/data/webstack.yml` 搜索 OmegaT / omegat-org、ged4py / andy-z、Mirador / ProjectMirador，无匹配。分别补充人工翻译记忆工作流、GEDCOM 程序化读取、馆藏图像并排查看，不重复现有机器翻译引擎、族谱编辑器与 IIIF 服务端。

## 开源应用 · 语言翻译

```yaml
title: OmegaT
logo: finance.png
url: https://github.com/omegat-org/omegat
description: Windows、macOS、Linux 计算机辅助翻译应用｜以翻译记忆、术语表与模糊匹配辅助人工翻译；需 Java 环境或内置运行时版本，启用机器翻译或团队同步前核对文本去向与服务费用
```

- [官方仓库](https://github.com/omegat-org/omegat)：GPL-3.0-or-later，提供翻译记忆、术语表、关键字搜索与更新项目复用；不是保证准确的全自动翻译服务。
- README 列 Linux、Mac、Windows 包与 Java 运行时条件；优先按正式发行说明选择匹配的含 JRE 包，不把开发分支版本要求写死在卡片。
- [GitHub 发布入口](https://github.com/omegat-org/omegat/releases)未给出本次可确认的完整正式安装包列表；不声称本地安装或升级已验证。开源客户端不等于第三方翻译 API 免费。
- 翻译记忆本身也可能包含敏感原文。可选机器翻译、远端项目与插件数据流须独立确认，不能将桌面应用描述为所有功能永不联网；翻译输出仍需人工校对。

## 开源应用 · 族谱家史

```yaml
title: ged4py
logo: finance.png
url: https://github.com/andy-z/ged4py
description: Python GEDCOM 解析库｜程序化读取 GEDCOM 5.5.1 与常见编码，适合家史资料提取和自定义检查；非图形家谱编辑器，不承诺 GEDCOM 7 兼容，处理在世人员资料须获授权并保护输出
```

- [官方仓库](https://github.com/andy-z/ged4py)：MIT，Python 库，明示 GEDCOM 5.5.1 与 UTF-8、ASCII、ANSEL；以读取解析为核心，不据此承诺无损编辑/回写或全版本 GEDCOM 支持。
- [官方文档](https://ged4py.readthedocs.io)由 README 链接。平台表述限定 Python 包，不伪装成桌面安装程序；具体 Python 兼容性应按所选包版本验证。
- [发布入口](https://github.com/andy-z/ged4py/releases)检索缓存较旧，不能作为最近活跃维护证据；仓库可读但本次没有安装或实际解析测试。
- 免费库不需要云账户。出生日期、住址、关系、照片和家史推断可能涉及在世人员，需授权、最小化、加密备份及输出脱敏；解析成功不证明亲缘事实真实。

## 开源应用 · 博物档案

```yaml
title: Mirador
logo: finance.png
url: https://github.com/ProjectMirador/mirador
description: 浏览器 IIIF 图像查看组件｜并排比较馆藏图像、缩放旋转并显示注释，可嵌入展览网站；需配置图像与清单来源，查看能力不授予下载再用权，生产部署应固定版本并核对访问权限
```

- [官方仓库](https://github.com/ProjectMirador/mirador)：Apache-2.0，JavaScript 浏览器组件；npm/yarn 或页面嵌入，开发需 Node。补充观看与比较层，不替代 Cantaloupe 图像服务端或馆藏管理数据库。
- [官方发布记录](https://github.com/ProjectMirador/mirador/releases)：有版本变化可核查。README 提示使用浮动 CDN 版本可能产生大版本破坏性变化，应固定并测试兼容版本。
- 软件开源不代表 CDN、托管、图像服务或馆藏素材免费。远端清单和图片会被浏览器请求，权限、跨域与服务可用性影响显示；不将可查看等同可公开转载。
- 不上传真实馆藏、不访问私有库、不修改注释；原件、注释作者信息与受限藏品元数据须按馆方政策保护。

## 边界

仅写此研究记录，未修改 YAML、注册账户、安装工具或处理真实家史/翻译资料；公开来源核验不构成运行、安全或兼容性验证。
