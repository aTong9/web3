# 资源导航第 15 批：开发与系统工具核验

核验日期：2026-09-02

## 范围与去重

本批为以下六个现有分类各补充一个可安装、自托管或命令行项目：包管理、编译工具链、操作系统、测试自动化、代码搜索、代码托管。

核验前先读取 `src/data/webstack.yml` 全量条目，并将标题转为小写、URL 转为小写且移除末尾 `/` 后比对。下列六个标题与规范化 URL 均未收录。现有目标分类条目如下：

- 包管理：Homebrew、Nix、Chocolatey、Scoop、WinGet、Mamba
- 编译工具链：LLVM、GCC、Rust、Zig、Crystal、Nim
- 操作系统：Linux Kernel、FreeBSD、SerenityOS、Redox OS、Haiku、ReactOS
- 测试自动化：Playwright、Selenium、Cypress、Appium、k6、Robot Framework
- 代码搜索：Sourcebot、Zoekt、Livegrep、Hound、OpenGrok、Google Code Search
- 代码托管：Gitea、GitLab CE、OneDev、Gogs、GitBucket、Gerrit Code Review

## 推荐条目

### 1. 包管理：Spack

- 主仓库：https://github.com/spack/spack
- 形态与平台：面向科研与 HPC 软件栈的命令行、源码包管理器；仓库主题及 README 标明 Linux、macOS、Windows、多编译器与多配置支持。
- 许可证：`Apache-2.0 OR MIT`。
- 维护信号：项目仍有面向 2026-11 的 v1.3.0 里程碑；`CHANGELOG.md` 记录 v1.2.0 于 2026-06-21 发布。
- 一手来源：[主仓库 README 与许可证](https://github.com/spack/spack)、[项目里程碑](https://github.com/spack/spack/milestones)、[CHANGELOG](https://github.com/spack/spack/blob/develop/CHANGELOG.md)

建议描述：`跨平台源码包管理器｜为科研与 HPC 软件解析多版本、多编译器和多配置依赖，并构建可复现环境。`

### 2. 编译工具链：mold

- 主仓库：https://github.com/rui314/mold
- 形态与平台：Unix 命令行链接器，可替换现有链接器；README 提供 GitHub Release 预编译 Linux 二进制及源码构建方式。
- 许可证：MIT。
- 维护信号：README 的基准数据更新至 2026-08-28；仓库持续发布版本。
- 一手来源：[主仓库 README](https://github.com/rui314/mold)、[LICENSE](https://github.com/rui314/mold/blob/main/LICENSE)、[Releases](https://github.com/rui314/mold/releases)

建议描述：`Unix 高性能链接器｜作为 GCC、Clang 与 Rust 工具链的兼容替代，加速大型原生程序链接阶段。`

### 3. 操作系统：Bottlerocket

- 主仓库：https://github.com/bottlerocket-os/bottlerocket
- 形态与平台：面向容器主机的 Linux 操作系统；README 提供 Amazon EKS、ECS、VMware 与裸机安装入口，构建文档支持选择架构与变体生成镜像。
- 许可证：项目自有代码采用 Apache-2.0 或 MIT 双许可证；系统内第三方软件包保留各自许可证。
- 维护信号：官方 GitHub 组织页显示主仓库于 2026-08-25 更新。
- 一手来源：[主仓库 README](https://github.com/bottlerocket-os/bottlerocket)、[构建文档](https://github.com/bottlerocket-os/bottlerocket/blob/develop/BUILDING.md)、[官方组织项目索引](https://github.com/bottlerocket-os)

建议描述：`容器主机 Linux 操作系统｜以最小只读系统、原子更新和主机 API 运行 Kubernetes、ECS 等容器工作负载。`

### 4. 测试自动化：pytest

- 主仓库：https://github.com/pytest-dev/pytest
- 形态与平台：Python 命令行与库测试框架，可从 PyPI 安装；支持小型单元测试和复杂功能测试。
- 许可证：MIT。
- 维护信号：GitHub Releases 记录 9.0.3 于 2026-04-07 发布。
- 一手来源：[主仓库 README 与许可证](https://github.com/pytest-dev/pytest)、[Releases](https://github.com/pytest-dev/pytest/releases)

建议描述：`Python 测试框架｜通过自动发现、夹具、参数化与插件运行单元、集成和复杂功能测试。`

### 5. 代码搜索：Mozsearch

- 主仓库：https://github.com/mozsearch/mozsearch
- 形态与平台：Searchfox 的代码索引后端；README 提供 Docker、Podman 或 Ubuntu 虚拟机中的本地部署与开发流程。
- 许可证：MPL-2.0（仓库许可证）。
- 维护信号：仓库 README 与自动化基础设施仍以当前 Searchfox 部署为目标，主仓库持续接收变更。
- 一手来源：[主仓库 README](https://github.com/mozsearch/mozsearch)、[LICENSE](https://github.com/mozsearch/mozsearch/blob/master/LICENSE)

建议描述：`可部署代码索引与搜索后端｜使用 Docker 或 Ubuntu 构建 Searchfox 实例并索引大型源码树。`

### 6. 代码托管：Soft Serve

- 主仓库：https://github.com/charmbracelet/soft-serve
- 形态与平台：可自托管的单二进制 Git 服务，提供 SSH、HTTP、Git 协议、Git LFS、私有仓库和访问控制；提供多平台安装包。
- 许可证：MIT。
- 维护信号：项目在 2026-08 仍发布 v0.12 系列版本。
- 一手来源：[主仓库 README](https://github.com/charmbracelet/soft-serve)、[LICENSE](https://github.com/charmbracelet/soft-serve/blob/main/LICENSE)、[Releases](https://github.com/charmbracelet/soft-serve/releases)

建议描述：`自托管单二进制 Git 服务｜通过 SSH、HTTP 与 Git 协议管理仓库、LFS、访问权限和终端界面。`

## 淘汰项

- `illumos/illumos-gate`：GitHub 页面明确标注为官方仓库的只读镜像，不符合主维护 GitHub 仓库要求。
- `genodelabs/genode`：仓库于 2026-05-20 归档并迁往 Codeberg，不再在 GitHub 更新。
- `getgauge/gauge`：README 明确提示核心团队只能业余维护且响应会显著变慢，维护信号不适合作为本批首选。
