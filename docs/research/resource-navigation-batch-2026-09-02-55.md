# 资源导航第 55 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按标题及去除末尾 `/`、忽略大小写后的 URL 检查
`src/data/webstack.yml`，下列 6 项均未在全局目录中出现。

| 分类 | 建议条目 | 平台 / 形态 | 许可与近期维护 | 风险边界及推荐中文描述 |
| --- | --- | --- | --- | --- |
| 开源应用 · 文件管理器 | [Nemo](https://github.com/linuxmint/nemo) | Linux 桌面文件管理器；Linux Mint 主维护仓库说明它是 Cinnamon 官方文件管理器，支持 SSH、FTP、MTP、终端与可扩展 Actions。 | [GPL-2.0](https://github.com/linuxmint/nemo/blob/master/COPYING)；[主分支](https://github.com/linuxmint/nemo/commits/master/) 2026-04-22 仍有提交。 | 文件移动、删除、远程挂载以及“以 root 打开”都可能改变真实数据；批量操作前应核对来源和目标、保留备份，并避免无必要的 root 权限。推荐描述：**Cinnamon 官方 Linux 文件管理器｜支持 SSH、FTP、MTP、终端及 Actions 扩展；移动、删除或以 root 操作前需核对路径并保留备份。** |
| 开源应用 · 文件加密 | [securefs](https://github.com/netheril96/securefs) | Windows、macOS、Linux 与 BSD 的命令行加密文件系统；通过 FUSE / WinFsp 挂载目录，透明加解密并提供认证加密。 | [MIT](https://github.com/netheril96/securefs/blob/master/LICENSE.md)；[主分支](https://github.com/netheril96/securefs/commits/master/) 2025-11-09 仍有提交。 | 加密不是备份，密码或密钥文件丢失会影响访问；README 还提醒交换区、休眠文件可能落下明文或密钥，异常断电时 full 模式的目录结构可能损坏。推荐描述：**跨平台透明加密文件系统｜以 FUSE 或 WinFsp 挂载目录并自动认证加解密，适合本地或云同步；须另存密钥、保留独立备份并保护交换区。** |
| 开源应用 · 临时文件传输 | [qrcp](https://github.com/claudiodangelis/qrcp) | Windows、macOS、Linux 的 Go 命令行工具；在 Wi-Fi 接口临时启动 Web 服务，以二维码让手机浏览器发送或接收文件，完成后默认退出。 | [MIT](https://github.com/claudiodangelis/qrcp/blob/main/LICENSE)；[主分支](https://github.com/claudiodangelis/qrcp/commits/main/) 2026-03-11 仍有提交。 | 默认二维码为随机路径的 HTTP URL，并非用户身份验证；敏感文件应仅在可信网络传输、限制绑定接口并配置 TLS，不应把 `-i any` 暴露到不可信网络。推荐描述：**扫码即用的局域网临时传输 CLI｜在电脑启动一次性 Web 服务，让手机浏览器收发文件；敏感内容应限定可信接口并启用 TLS。** |
| 开源应用 · 图片查看 | [Oculante](https://github.com/woelper/oculante) | Windows、macOS、Linux、FreeBSD 与 NetBSD 的 Rust 图片查看器；提供发布包、Cargo 与 Flatpak 等安装方式，支持多格式、像素检查、比较及非破坏编辑栈。 | [MIT](https://github.com/woelper/oculante/blob/master/LICENSE)；[主分支](https://github.com/woelper/oculante/commits/master/) 2026-04-06 仍有提交。 | 查看器同时带文件管理、编辑、元文件保存和网络监听能力；编辑或管理重要图片前应使用副本并核对导出目标，监听模式只应开放在受控网络。推荐描述：**跨平台高性能图片查看与检查器｜支持多格式、像素与通道分析、图片比较和非破坏编辑；修改、导出或网络监听前须保护原图与访问边界。** |
| 开源应用 · 图片压缩 | [libjxl](https://github.com/libjxl/libjxl) | JPEG XL 官方参考实现与命令行工具；Linux 可安装 `libjxl-tools`，macOS 可用 Homebrew，Releases 提供 Windows 与 Debian / Ubuntu 包，`cjxl` 支持有损或无损编码。 | [BSD-3-Clause 与附加专利授权](https://github.com/libjxl/libjxl/blob/main/LICENSE)；[主分支](https://github.com/libjxl/libjxl/commits/main/) 2026-09-01 仍有提交。 | README 明确建议至少升级至 v0.12 以取得安全修复；有损参数会不可逆改变像素，且 JPEG XL 的应用兼容性须单独确认，应保留原图并抽样解码检查。推荐描述：**JPEG XL 参考编码器与压缩 CLI｜用 `cjxl` 对 PNG、JPEG 等进行有损或无损压缩，并可重建原始 JPEG；应使用 v0.12 以上、保留原图并验证目标兼容性。** |
| 开源应用 · 启动盘制作 | [livecd-tools](https://github.com/livecd-tools/livecd-tools) | Fedora / RHEL / CentOS 等 DNF 系 Linux 的命令行工具集；可生成可启动 Live ISO，并用 `livecd-iso-to-disk` 将镜像写入 USB、保留持久化层或装载多个镜像。 | [GPL-2.0](https://github.com/livecd-tools/livecd-tools/blob/main/COPYING)；[主分支](https://github.com/livecd-tools/livecd-tools/commits/main/) 2026-04-11 仍有提交。 | README 将默认写入流程描述为保留 USB 现有数据，但选错设备、分区或使用改变布局的选项仍可能造成数据损失；写入前须备份、核对未挂载设备路径和镜像校验值，生成镜像时应启用 RPM 签名验证。推荐描述：**面向 DNF 系 Linux 的 Live ISO 与启动盘 CLI｜生成可启动镜像并将其装入 USB，支持持久化与多镜像；执行前须备份并复核设备、镜像校验及软件包签名。** |

## 结论

六项分别补充 Cinnamon 原生文件管理、跨平台透明加密、二维码局域网临时传输、图片像素与通道检查、JPEG XL 编码压缩，以及 DNF 系 Live ISO / USB 制作。它们与各分类现有七项形成明确功能增量；纳入目录时应保留文件误操作、密钥与明文痕迹、HTTP 暴露、原图覆盖、有损编码和设备写入边界。
