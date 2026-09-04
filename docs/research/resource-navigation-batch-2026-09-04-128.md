# 资源导航补充研究 · Batch 128

核验日期：2026-09-04。仅研究 3 项；未修改 YAML、安装软件、创建容器或进行远程操作。

## 去重与补缺

读目标分类并检索完整 `src/data/webstack.yml`：Stretchly/hovancik、xrdp/neutrinolabs、Distrobox/89luca89 无匹配。GanttProject、Remmina、PDF Arranger、Xournal++、GoldenDict-ng 等已收录，未重复加入。分别补办公休息节奏、Linux RDP 服务端、桌面紧密集成的发行版容器环境。

## 开源应用 · 学习办公

```yaml
- title: Stretchly
  logo: finance.png
  url: https://github.com/hovancik/stretchly
  description: Windows、macOS、Linux 休息提醒应用｜安排电脑学习与办公中的短休息和长休息；可按会议节奏调整，提醒不能替代个人健康判断或专业建议。
```

- [官方仓库](https://github.com/hovancik/stretchly)：BSD-2-Clause，Electron，官方多平台安装与便携包；与工时记录软件不同，重点为休息提醒而非员工监控。
- [发布页](https://github.com/hovancik/stretchly/releases)可读，有版本记录。系统要求随 Electron 变化，部分 Wayland/多屏与系统通知行为存在已知限制，不保证每个桌面环境效果一致。
- 可选应用排除会检查运行进程信息，需按本人使用范围配置；不声称零权限或零联网。软件提示不构成疗效或预防疾病保证，未安装、改系统通知或安排真实提醒。

## 开源应用 · 远程控制

```yaml
- title: xrdp
  logo: finance.png
  url: https://github.com/neutrinolabs/xrdp
  description: Apache-2.0 Linux 远程桌面服务端｜让 RDP 客户端访问获授权的图形会话，通常配合 xorgxrdp；限制网络入口与账户权限，核对 TLS 并按需关闭剪贴板和磁盘共享。
```

- [官方仓库](https://github.com/neutrinolabs/xrdp)：Apache-2.0，主要面向 GNU/Linux，接受多种 RDP 客户端，提供会话重连；与既有 FreeRDP 客户端/库互补。
- README 明确图形桌面通常需 xorgxrdp，音频重定向需要额外模块；发行版软件包或源码构建可用。TLS 默认启用不代表无需认证和网络加固。
- [发布页](https://github.com/neutrinolabs/xrdp/releases)可读；远程访问仅适用于设备所有者或明确获授权的管理员，须告知受影响用户。不提供隐蔽控制方法，未打开网络端口或建立连接。

## 开源应用 · 虚拟化

```yaml
- title: Distrobox
  logo: finance.png
  url: https://github.com/89luca89/distrobox
  description: Linux 发行版容器工作环境｜借助 Podman、Docker 等运行不同发行版应用并集成桌面；不是独立内核虚拟机或安全沙箱，只使用可信镜像并审查宿主目录共享。
```

- [官方仓库](https://github.com/89luca89/distrobox)：GPL-3.0 标识，通过容器运行发行版用户空间、集成 GUI/音频等。与 Incus 系统管理及 Lima 虚拟机不同，侧重本人桌面的发行版软件兼容。
- [正式文档](https://distrobox.it/)为稳定使用入口；GitHub 主分支文档只描述开发代码。依赖容器运行时，不是无需依赖的完整 VM。
- 官方明确隔离不是主要目标：宿主目录、设备等可与容器共享，不能用来放心运行不可信程序；rootful 模式风险更高。不把容器称为完整安全边界。
- [发布页](https://github.com/89luca89/distrobox/releases)可读，存在版本历史。镜像下载会联网，镜像/应用许可与运行时费用另核对；本次未运行任何容器。

## 边界

以上为第一方来源与发行记录核验，不是安装、安全审计或实际远程/虚拟化兼容性测试；风险提示为使用建议，不是默认安全保证。
