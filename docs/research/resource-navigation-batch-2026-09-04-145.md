# 资源导航第 145 批来源核验

核验日期：2026-09-04。文件管理器、压缩解压、终端模拟器各一项。

## 去重与互补

阅读三个分类并检索完整 `src/data/webstack.yml` 中 muCommander / mucommander.com、LZ4 / lz4/lz4、Tilix / gnunn1/tilix，均未收录。Alacritty、WezTerm、Ghostty 已在其他分类出现，排除。候选补充 Java 双栏跨平台文件管理、低延迟压缩算法及 Linux 可保存布局的平铺终端。

## 开源应用 · 文件管理器

```yaml
title: muCommander
logo: finance.png
url: https://github.com/mucommander/mucommander
description: Java 跨平台双栏文件管理器，可统一浏览本地、归档与远程位置｜Windows、macOS、Linux；GPL 开源，移动覆盖前核对路径，远程连接须保护凭据
```

- [官方仓库](https://github.com/mucommander/mucommander)与[README](https://raw.githubusercontent.com/mucommander/mucommander/master/README.md)确认 Java 双栏应用、Windows/macOS/Linux 等平台与打包路径；[官网](https://www.mucommander.com/)提供面向用户的入口。
- [LICENSE](https://raw.githubusercontent.com/mucommander/mucommander/master/LICENSE)明确主体 GPL，部分工具/API 为 LGPL，第三方模块另有 Apache/BSD 等条款；因此不宣称全仓库只有单一许可。
- 运行时与安装包依平台不同，源码构建需要 JDK/Gradle。README 的 nightly 版本不代表稳定发行，实际安装应选对应正式包并核验来源，不为安装而绕过系统安全检查。
- 核心源码免费，云存储账户与网络服务可能收费。文件操作可能覆盖或删除本地及远程资料；先确认两栏位置、备份与目标，使用受支持的安全传输并限制凭据权限。本轮不执行文件操作或连接远程存储。

## 开源应用 · 压缩解压

```yaml
title: LZ4
logo: finance.png
url: https://github.com/lz4/lz4
description: 面向快速处理的无损压缩 CLI 与 C 库，适合数据流和低延迟场景｜跨平台；库为 BSD-2-Clause、CLI 等为 GPL-2.0-or-later，压缩不等于加密或备份
```

- [官方 README](https://raw.githubusercontent.com/lz4/lz4/dev/README.md)说明速度与压缩率取舍，包含 CLI、C 库、字典及帧格式。与多格式归档 GUI 不同，主要提供 LZ4 算法与数据流压缩。
- [根目录许可](https://raw.githubusercontent.com/lz4/lz4/dev/LICENSE)明确 `lib` 为 BSD-2-Clause，其余默认 GPL-2.0-or-later，除另有声明；不能只引用 README 的库许可来覆盖命令行程序。
- 官方给出 Make、包管理与 Windows vcpkg 路径。性能受硬件与输入影响，未采用 README 的历史基准数字作承诺；第三方语言移植应独立核验，不能视为同一官方发行。
- 免费本地处理，无必需上传；解压应限制输出和内存并避免覆盖重要文件。使用字典时保留对应字典与原始数据；压缩并不能保密，重要资料仍需备份或另行加密。本轮未压缩解压文件。

## 开源应用 · 终端模拟器

```yaml
title: Tilix
logo: finance.png
url: https://github.com/gnunn1/tilix
description: Linux GTK 平铺终端，可拖放分栏并保存会话布局｜MPL-2.0；项目仅最低限度维护，同步输入会向多个会话发送命令，操作前须确认目标
```

- [官方 README](https://raw.githubusercontent.com/gnunn1/tilix/master/README.md)说明 GTK3/VTE Linux 应用，支持水平/垂直分栏、拖放、会话布局及同步输入；与偏重渲染性能的跨平台终端互补。
- [官方 LICENSE](https://raw.githubusercontent.com/gnunn1/tilix/master/LICENSE)为 MPL-2.0。核心不需订阅，但远程 SSH 或其他终端内服务并不因此免费。
- README 明示缺维护者、仅最低限度维护、新功能停止且 PR 审阅可能较慢，必须向用户保留该限制；部分功能要求特定 VTE 补丁，不承诺任何 Linux 桌面均完整可用。
- 同步输入会复制到其他会话，可能影响多个主机；粘贴命令、开启广播和执行破坏性操作前核验会话与范围。终端历史、回滚输出及截图可能含秘密，不应无审查分享。本轮未安装或执行终端会话操作。

## 边界

仅新增研究文档，不修改 YAML、不安装、不移动删除文件、不解压档案、不连接远程服务。来源核验不是运行验收或安全保证。
