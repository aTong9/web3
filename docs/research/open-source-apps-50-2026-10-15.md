# 新增 50 个高 Star 开源应用：来源与安全核验

核对日期：2026-10-15（Asia/Shanghai）。本批恰好新增 50 个应用/CLI 工具；此前本日新增的 8 项不计入这 50 项。

## 选择标准与结论边界

- 每项 GitHub Star 至少 5,000，未归档、未禁用，2026 年有仓库推送，具备明确开源许可和官方发布记录。Star 快照为本次 GitHub API 读取值，会变化；推送和高 Star 都不是安全认证。
- 与整个现有目录按项目名、URL 及已知旧组织名检查重复；只增加目录内容，未安装或执行这些项目。
- 通过已认证 GitHub GraphQL 核对仓库元数据，通过 REST 读取 README 和项目公开安全公告；临时 EOF 请求已重试，最终 50 项 README 与公告接口均成功读取。未读取或保存访问令牌。
- 这里只核验公开项目资料和已披露风险；没有下载二进制、病毒扫描、签名/公证验证、完整依赖审计、动态沙箱检测或可复现构建。**不能保证绝对无病毒或无未知漏洞**；空公告列表也不能证明没有漏洞。
- 目录入口统一为官方 GitHub 仓库；从仓库进入正式发布页或其认可渠道。避免第三方整合包、破解包，以及要求关闭系统安全检查的安装方式。
- 现有桌面应用覆盖较全，本批主要补充终端工具、开发环境、文本数据、系统监控与供应链核验。新增 6 个分类，其他沿用原分类。没有把低 Star 项目充数，也没有声称这些工具都适合无需技术经验的用户。

## 50 项清单

Star 最低 5,512、最高 95,527；排序中位数为 17,336.5（中间两项平均）。许可证列为仓库识别的主要许可证，不替代第三方依赖与多重许可声明；OpenShot 的 GPL-3.0-or-later 已从官方 README 及 COPYING 人工确认，未使用 API 的 NOASSERTION 作为许可结论。

| 序号 | 项目与官方源码 | Star 快照 | 主要许可 | 分类 | 官方发布版本 | 公开公告数 |
| --- | --- | ---: | --- | --- | --- | ---: |
| 1 | [nvm](https://github.com/nvm-sh/nvm) | 95,527 | MIT | 开发环境 | [v0.40.8](https://github.com/nvm-sh/nvm/releases/tag/v0.40.8) | 4 |
| 2 | [uv](https://github.com/astral-sh/uv) | 90,789 | Apache-2.0 | 开发环境 | [0.13.1](https://github.com/astral-sh/uv/releases/tag/0.13.1) | 7 |
| 3 | [xh](https://github.com/ducaale/xh) | 8,132 | MIT | API 调试 | [v0.26.2](https://github.com/ducaale/xh/releases/tag/v0.26.2) | 0 |
| 4 | [ripgrep](https://github.com/BurntSushi/ripgrep) | 69,111 | Unlicense | 文本与结构化数据 | [15.2.0](https://github.com/BurntSushi/ripgrep/releases/tag/15.2.0) | 0 |
| 5 | [bat](https://github.com/sharkdp/bat) | 60,779 | Apache-2.0 | 文本与结构化数据 | [v0.26.1](https://github.com/sharkdp/bat/releases/tag/v0.26.1) | 0 |
| 6 | [Lazydocker](https://github.com/jesseduffield/lazydocker) | 53,128 | MIT | 容器诊断 | [v0.25.2](https://github.com/jesseduffield/lazydocker/releases/tag/v0.25.2) | 0 |
| 7 | [Ruff](https://github.com/astral-sh/ruff) | 50,099 | MIT | 代码质量 | [0.17.0](https://github.com/astral-sh/ruff/releases/tag/0.17.0) | 0 |
| 8 | [GitHub CLI](https://github.com/cli/cli) | 46,652 | MIT | Git 客户端 | [v2.102.0](https://github.com/cli/cli/releases/tag/v2.102.0) | 17 |
| 9 | [Helix](https://github.com/helix-editor/helix) | 46,591 | MPL-2.0 | 开发数据 | [25.07.1](https://github.com/helix-editor/helix/releases/tag/25.07.1) | 0 |
| 10 | [pyenv](https://github.com/pyenv/pyenv) | 45,140 | MIT | 开发环境 | [v2.8.10](https://github.com/pyenv/pyenv/releases/tag/v2.8.10) | 1 |
| 11 | [fd](https://github.com/sharkdp/fd) | 44,747 | Apache-2.0 | 系统文件 | [v10.5.0](https://github.com/sharkdp/fd/releases/tag/v10.5.0) | 0 |
| 12 | [Nushell](https://github.com/nushell/nushell) | 40,660 | MIT | 终端效率 | [0.116.1](https://github.com/nushell/nushell/releases/tag/0.116.1) | 0 |
| 13 | [ShellCheck](https://github.com/koalaman/shellcheck) | 40,172 | GPL-3.0 | 代码质量 | [v0.11.0](https://github.com/koalaman/shellcheck/releases/tag/v0.11.0) | 0 |
| 14 | [just](https://github.com/casey/just) | 36,281 | CC0-1.0 | 开发环境 | [1.59.0](https://github.com/casey/just/releases/tag/1.59.0) | 0 |
| 15 | [btop](https://github.com/aristocratos/btop) | 34,991 | Apache-2.0 | 系统监控 | [v1.4.7](https://github.com/aristocratos/btop/releases/tag/v1.4.7) | 0 |
| 16 | [K9s](https://github.com/derailed/k9s) | 34,814 | Apache-2.0 | 容器诊断 | [v0.51.0](https://github.com/derailed/k9s/releases/tag/v0.51.0) | 0 |
| 17 | [Gitleaks](https://github.com/gitleaks/gitleaks) | 29,944 | MIT | 凭据与供应链 | [v8.30.1](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1) | 0 |
| 18 | [TruffleHog](https://github.com/trufflesecurity/trufflehog) | 28,520 | AGPL-3.0 | 凭据与供应链 | [v3.99.2](https://github.com/trufflesecurity/trufflehog/releases/tag/v3.99.2) | 2 |
| 19 | [Glow](https://github.com/charmbracelet/glow) | 27,696 | MIT | 文本与结构化数据 | [v3.0.0](https://github.com/charmbracelet/glow/releases/tag/v3.0.0) | 0 |
| 20 | [fnm](https://github.com/Schniz/fnm) | 27,104 | GPL-3.0 | 开发环境 | [v1.39.0](https://github.com/Schniz/fnm/releases/tag/v1.39.0) | 0 |
| 21 | [Fastfetch](https://github.com/fastfetch-cli/fastfetch) | 25,024 | MIT | 系统监控 | [2.70.0](https://github.com/fastfetch-cli/fastfetch/releases/tag/2.70.0) | 1 |
| 22 | [Gum](https://github.com/charmbracelet/gum) | 24,509 | MIT | 终端效率 | [v2.0.2](https://github.com/charmbracelet/gum/releases/tag/v2.0.2) | 0 |
| 23 | [eza](https://github.com/eza-community/eza) | 23,565 | EUPL-1.2 | 系统文件 | [v0.23.5](https://github.com/eza-community/eza/releases/tag/v0.23.5) | 1 |
| 24 | [rust-analyzer](https://github.com/rust-lang/rust-analyzer) | 16,906 | Apache-2.0 | 开发数据 | [2026-10-12](https://github.com/rust-lang/rust-analyzer/releases/tag/2026-10-12) | 0 |
| 25 | [VHS](https://github.com/charmbracelet/vhs) | 21,120 | MIT | 终端效率 | [v0.12.1](https://github.com/charmbracelet/vhs/releases/tag/v0.12.1) | 0 |
| 26 | [diff-so-fancy](https://github.com/so-fancy/diff-so-fancy) | 18,106 | MIT | 文件比较 | [v1.4.14](https://github.com/so-fancy/diff-so-fancy/releases/tag/v1.4.14) | 0 |
| 27 | [navi](https://github.com/denisidoro/navi) | 17,767 | Apache-2.0 | 终端效率 | [v2.24.0](https://github.com/denisidoro/navi/releases/tag/v2.24.0) | 0 |
| 28 | [yq 结构化数据处理](https://github.com/mikefarah/yq) | 16,103 | MIT | 文本与结构化数据 | [v4.54.1](https://github.com/mikefarah/yq/releases/tag/v4.54.1) | 0 |
| 29 | [pre-commit](https://github.com/pre-commit/pre-commit) | 15,636 | MIT | 代码质量 | [v4.7.0](https://github.com/pre-commit/pre-commit/releases/tag/v4.7.0) | 0 |
| 30 | [direnv](https://github.com/direnv/direnv) | 15,503 | MIT | 开发环境 | [v2.38.2](https://github.com/direnv/direnv/releases/tag/v2.38.2) | 0 |
| 31 | [bottom](https://github.com/ClementTsang/bottom) | 14,101 | MIT | 系统监控 | [0.14.9](https://github.com/ClementTsang/bottom/releases/tag/0.14.9) | 0 |
| 32 | [cheat](https://github.com/cheat/cheat) | 13,481 | MIT | 终端效率 | [5.1.0](https://github.com/cheat/cheat/releases/tag/5.1.0) | 0 |
| 33 | [Grype](https://github.com/anchore/grype) | 13,028 | Apache-2.0 | 凭据与供应链 | [v0.120.1](https://github.com/anchore/grype/releases/tag/v0.120.1) | 1 |
| 34 | [OSV-Scanner](https://github.com/google/osv-scanner) | 11,186 | Apache-2.0 | 凭据与供应链 | [v2.7.0](https://github.com/google/osv-scanner/releases/tag/v2.7.0) | 0 |
| 35 | [hexyl](https://github.com/sharkdp/hexyl) | 10,292 | Apache-2.0 | 文本与结构化数据 | [v0.17.0](https://github.com/sharkdp/hexyl/releases/tag/v0.17.0) | 0 |
| 36 | [Syft](https://github.com/anchore/syft) | 9,683 | Apache-2.0 | 凭据与供应链 | [v1.54.1](https://github.com/anchore/syft/releases/tag/v1.54.1) | 3 |
| 37 | [shfmt](https://github.com/mvdan/sh) | 9,130 | BSD-3-Clause | 代码质量 | [v3.14.1](https://github.com/mvdan/sh/releases/tag/v3.14.1) | 0 |
| 38 | [Checkov](https://github.com/bridgecrewio/checkov) | 9,071 | Apache-2.0 | 代码质量 | [3.3.29](https://github.com/bridgecrewio/checkov/releases/tag/3.3.29) | 0 |
| 39 | [scc](https://github.com/boyter/scc) | 8,819 | MIT | 代码质量 | [v4.1.0](https://github.com/boyter/scc/releases/tag/v4.1.0) | 0 |
| 40 | [prek](https://github.com/j178/prek) | 8,612 | MIT | 代码质量 | [v0.5.5](https://github.com/j178/prek/releases/tag/v0.5.5) | 0 |
| 41 | [OpenShot](https://github.com/OpenShot/openshot-qt) | 6,631 | GPL-3.0-or-later | 音视频 | [v4.0.1](https://github.com/OpenShot/openshot-qt/releases/tag/v4.0.1) | 0 |
| 42 | [peco](https://github.com/peco/peco) | 7,915 | MIT | 终端效率 | [v0.6.0](https://github.com/peco/peco/releases/tag/v0.6.0) | 0 |
| 43 | [miniserve](https://github.com/svenstaro/miniserve) | 7,906 | MIT | 下载传输 | [v0.35.0](https://github.com/svenstaro/miniserve/releases/tag/v0.35.0) | 0 |
| 44 | [sd 文本替换](https://github.com/chmln/sd) | 7,389 | MIT | 文本与结构化数据 | [v1.1.0](https://github.com/chmln/sd/releases/tag/v1.1.0) | 0 |
| 45 | [skim](https://github.com/skim-rs/skim) | 6,995 | MIT | 终端效率 | [v5.7.4](https://github.com/skim-rs/skim/releases/tag/v5.7.4) | 1 |
| 46 | [tealdeer](https://github.com/tealdeer-rs/tealdeer) | 6,592 | Apache-2.0 | 终端效率 | [v1.9.0](https://github.com/tealdeer-rs/tealdeer/releases/tag/v1.9.0) | 0 |
| 47 | [Cosign](https://github.com/sigstore/cosign) | 6,368 | Apache-2.0 | 凭据与供应链 | [v3.1.3](https://github.com/sigstore/cosign/releases/tag/v3.1.3) | 10 |
| 48 | [procs](https://github.com/dalance/procs) | 6,193 | MIT | 系统监控 | [v0.14.12](https://github.com/dalance/procs/releases/tag/v0.14.12) | 0 |
| 49 | [Jira CLI](https://github.com/ankitpokhrel/jira-cli) | 6,033 | MIT | 项目协作 | [v1.7.0](https://github.com/ankitpokhrel/jira-cli/releases/tag/v1.7.0) | 0 |
| 50 | [jless](https://github.com/PaulJuliusMartinez/jless) | 5,512 | MIT | 文本与结构化数据 | [v0.9.0](https://github.com/PaulJuliusMartinez/jless/releases/tag/v0.9.0) | 0 |

## 已披露问题与收录边界

以下结论基于公开公告的影响范围、修复字段及本次正式发布版本对照，不代表完整漏洞或恶意软件审计。目录对存在历史公告的项目明确提示使用官方最新修复版。

### nvm

本次 v0.40.8；最新路径解析公告修复字段为 0.40.8，其他公告列出的修复为 0.40.4–0.40.6。应审查 .nvmrc 与镜像源。

- [GHSA-4ghp-wxpw-rhpg](https://github.com/nvm-sh/nvm/security/advisories/GHSA-4ghp-wxpw-rhpg)（low）：Malicious Node.js mirror response can overwrite shell startup files via LTS alias path traversal
- [GHSA-8grh-q73j-ffrc](https://github.com/nvm-sh/nvm/security/advisories/GHSA-8grh-q73j-ffrc)（medium）：Path traversal in nvm alias resolution — malicious .nvmrc reads arbitrary files when a developer runs `nvm use`
- [GHSA-3c52-35h2-gfmm](https://github.com/nvm-sh/nvm/security/advisories/GHSA-3c52-35h2-gfmm)（high）：nvm executes commands from a malicious mirror's version strings (eval in nvm_download, awk in nvm_get_checksum)
- [GHSA-4fc5-r4vr-8rp7](https://github.com/nvm-sh/nvm/security/advisories/GHSA-4fc5-r4vr-8rp7)（medium）：Arbitrary Command Injection in nvm_download() via eval and Unsanitized Environment Variables
### uv

本次 0.13.1；公开影响范围最高涉及 <0.12.18，当前版本不在所列范围。部分旧公告未填修复字段，因此保留原始记录，不将空字段解释为已修复。依赖与构建脚本仍需独立审查。

- [GHSA-2cv4-cqwr-gwf7](https://github.com/astral-sh/uv/security/advisories/GHSA-2cv4-cqwr-gwf7)（medium）：Path traversal on Windows through wheel extraction
- [GHSA-4gg8-gxpx-9rph](https://github.com/astral-sh/uv/security/advisories/GHSA-4gg8-gxpx-9rph)（medium）：Arbitrary file write through entry point names
- [GHSA-pjjw-68hj-v9mw](https://github.com/astral-sh/uv/security/advisories/GHSA-pjjw-68hj-v9mw)（low）：Abitrary file deletion through RECORD entries
- [GHSA-pqhf-p39g-3x64](https://github.com/astral-sh/uv/security/advisories/GHSA-pqhf-p39g-3x64)（medium）：ZIP payload obfuscation through parsing differentials
- [GHSA-w476-p2h3-79g9](https://github.com/astral-sh/uv/security/advisories/GHSA-w476-p2h3-79g9)（low）：Differential in tar extraction with PAX headers
- [GHSA-7j9j-68r2-f35q](https://github.com/astral-sh/uv/security/advisories/GHSA-7j9j-68r2-f35q)（low）：Path traversal in tar extraction
- [GHSA-8qf3-x8v5-2pj8](https://github.com/astral-sh/uv/security/advisories/GHSA-8qf3-x8v5-2pj8)（medium）：ZIP payload obfuscation through parsing differentials
### GitHub CLI

本次 v2.102.0；多条最新公告涉及 <=v2.101.0，修复为 v2.102.0，其他历史修复更早。使用凭据与制品核验功能时必须保持最新。

- [GHSA-4mq3-hpgx-9cx8](https://github.com/cli/cli/security/advisories/GHSA-4mq3-hpgx-9cx8)（low）：`gh attestation verify` compares `--source-ref` case-insensitively
- [GHSA-wjmr-j3rp-mh2g](https://github.com/cli/cli/security/advisories/GHSA-wjmr-j3rp-mh2g)（low）：`gh attestation verify` treats `--signer-workflow` as a prefix
- [GHSA-39wj-f2f4-978v](https://github.com/cli/cli/security/advisories/GHSA-39wj-f2f4-978v)（medium）：GitHub CLI filesystem operations can write outside intended destinations through symlinks
- [GHSA-qcwj-mr2r-2cx7](https://github.com/cli/cli/security/advisories/GHSA-qcwj-mr2r-2cx7)（low）：Argument injection in `gh skill search` can redirect skill installation
- [GHSA-vfhh-p7hm-pxfh](https://github.com/cli/cli/security/advisories/GHSA-vfhh-p7hm-pxfh)（low）：`gh codespace ports forward` exposes forwarded services on all network interfaces by default
- [GHSA-4fjg-2h4q-fwg3](https://github.com/cli/cli/security/advisories/GHSA-4fjg-2h4q-fwg3)（low）：Unescaped variable components in request URLs could allow path traversal in GitHub CLI
- [GHSA-3m3g-3wcr-px46](https://github.com/cli/cli/security/advisories/GHSA-3m3g-3wcr-px46)（medium）：Terminal escape sequence injection in multiple `gh` commands
- [GHSA-cg6r-mpgc-h9mm](https://github.com/cli/cli/security/advisories/GHSA-cg6r-mpgc-h9mm)（low）：Partial token disclosure in `gh auth status` output
- [GHSA-mm27-mwq9-fr5g](https://github.com/cli/cli/security/advisories/GHSA-mm27-mwq9-fr5g)（low）：Attestation verification bypass via unescaped regex metacharacters in SAN matching
- [GHSA-8cg3-r6g9-fpg2](https://github.com/cli/cli/security/advisories/GHSA-8cg3-r6g9-fpg2)（medium）：Connecting to a malicious Codespace via `gh codespace jupyter` could allow command execution on the user's computer
- [GHSA-8xvp-7hj6-mcj9](https://github.com/cli/cli/security/advisories/GHSA-8xvp-7hj6-mcj9)（high）：Incorrect authorization header in API requests to TUF repository mirrors via `gh attestation`, `gh release verify`, and `gh release verify-asset` commands
- [GHSA-crc3-h8v6-qh57](https://github.com/cli/cli/security/advisories/GHSA-crc3-h8v6-qh57)（low）：GitHub Actions log output in `gh run view` allows terminal escape sequence injection
- [GHSA-fgw4-v983-mgp8](https://github.com/cli/cli/security/advisories/GHSA-fgw4-v983-mgp8)（medium）：`gh attestation verify` returns incorrect exit code during verification when predicate types mismatch
- [GHSA-2m9h-r57g-45pj](https://github.com/cli/cli/security/advisories/GHSA-2m9h-r57g-45pj)（low）：Downloading malicious GitHub Actions workflow artifact results in path traversal vulnerability
- [GHSA-p2h2-3vg9-4p87](https://github.com/cli/cli/security/advisories/GHSA-p2h2-3vg9-4p87)（high）：Connecting to a malicious Codespaces via GH CLI could allow command execution on the user's computer
- [GHSA-jwcm-9g39-pmcw](https://github.com/cli/cli/security/advisories/GHSA-jwcm-9g39-pmcw)（medium）：Recursive repository cloning can leak authentication tokens to non-GitHub submodule hosts
- [GHSA-fqfh-778m-2v32](https://github.com/cli/cli/security/advisories/GHSA-fqfh-778m-2v32)（medium）：GitHub CLI can execute a git binary from the current directory
### pyenv

本次 v2.8.10；公告影响 <=2.7.3，修复 2.8.0。解释器版本和项目版本文件仍需核对。

- [GHSA-g478-f579-9vp9](https://github.com/pyenv/pyenv/security/advisories/GHSA-g478-f579-9vp9)（low）：Glob/wildcard metacharacters bypass is_version_safe(), causing silent version/interpreter substitution via unquoted expansion (CVE-2022-35861 residual)
### TruffleHog

本次 v3.99.2；公告分别列出 3.98.0 和 v3.81.9 修复。在线凭据验证具有联网与授权边界。

- [GHSA-fg8w-m62h-jvvw](https://github.com/trufflesecurity/trufflehog/security/advisories/GHSA-fg8w-m62h-jvvw)（medium）：Workflow command injection via filenames in --github-actions output
- [GHSA-3r74-v83p-f4f4](https://github.com/trufflesecurity/trufflehog/security/advisories/GHSA-3r74-v83p-f4f4)（low）：Blind SSRF in some Detectors
### Fastfetch

本次 2.70.0；公告记录 2.56.1 类型混淆问题，修复 2.60.0。

- [GHSA-fr2v-2wgv-c994](https://github.com/fastfetch-cli/fastfetch/security/advisories/GHSA-fr2v-2wgv-c994)（low）：CPU tempSensor Type Confusion
### eza

本次 v0.23.5；历史高危公告影响 <0.18.2，当前版本不在该范围；修复字段未填写，不能据此推断所有分发包已修复。

- [GHSA-3qx3-6hxr-j2ch](https://github.com/eza-community/eza/security/advisories/GHSA-3qx3-6hxr-j2ch)（high）： Potential Heap Overflow Vulnerability for AArch64
### Grype

本次 v0.120.1；凭据输出公告影响 <0.104.1，修复 0.104.1。扫描结果应限制访问，漏洞检测不是杀毒检测。

- [GHSA-6gxw-85q2-q646](https://github.com/anchore/grype/security/advisories/GHSA-6gxw-85q2-q646)（high）：Credential disclosure vulnerability in Grype JSON output
### Syft

本次 v1.54.1；公开修复字段为 v1.52.0、v1.42.3 和 v0.70.0。SBOM 可能泄露内部信息。

- [GHSA-mw2c-m758-9v5q](https://github.com/anchore/syft/security/advisories/GHSA-mw2c-m758-9v5q)（medium）：Memory exhaustion and large allocations when parsing binary inputs
- [GHSA-rjcw-vg7j-m9rc](https://github.com/anchore/syft/security/advisories/GHSA-rjcw-vg7j-m9rc)（medium）：Syft improper temporary file cleanup
- [GHSA-jp7v-3587-2956](https://github.com/anchore/syft/security/advisories/GHSA-jp7v-3587-2956)（medium）：Credential disclosure in syft when SYFT_ATTEST_PASSWORD environment variable set
### skim

本次 v5.7.4；公告涉及 pull_request_target 工作流。已用 GitHub compare 核对修复提交 bf63404ad51985b00ed304690ba9d477860a5a75 到该发布标签为 ahead，ahead_by=146、behind_by=0，即发布包含该提交；未验证构建产物与源码对应。

- [GHSA-9g93-rxr5-xhqw](https://github.com/skim-rs/skim/security/advisories/GHSA-9g93-rxr5-xhqw)（high）：Arbitrary code execution via pull_request_target fork checkout in pr.yml
### Cosign

本次 v3.1.3；最新高危公告在 v3 分支影响 <=3.1.2，修复 v3.1.3；历史公告修复版本更早。验证时仍需固定可信身份与签发者。

- [GHSA-fx35-mq7g-6g98](https://github.com/sigstore/cosign/security/advisories/GHSA-fx35-mq7g-6g98)（high）：Verification bypass via public key in legacy bundle
- [GHSA-w6c6-c85g-mmv6](https://github.com/sigstore/cosign/security/advisories/GHSA-w6c6-c85g-mmv6)（medium）：verify-blob-attestation reports false positive when payload parsing fails
- [GHSA-wfqv-66vq-46rm](https://github.com/sigstore/cosign/security/advisories/GHSA-wfqv-66vq-46rm)（low）：Signatures considered valid with certificates that outlive expired CA certificates
- [GHSA-whqx-f9j3-ch6m](https://github.com/sigstore/cosign/security/advisories/GHSA-whqx-f9j3-ch6m)（medium）：Verification accepts any valid Rekor entry under certain conditions
- [GHSA-88jx-383q-w4qc](https://github.com/sigstore/cosign/security/advisories/GHSA-88jx-383q-w4qc)（medium）：Malicious attachments can cause system-wide denial of service
- [GHSA-95pr-fxf5-86gv](https://github.com/sigstore/cosign/security/advisories/GHSA-95pr-fxf5-86gv)（medium）：Malicious artifacts can cause machine-wide DoS
- [GHSA-vfp6-jrw2-99g9](https://github.com/sigstore/cosign/security/advisories/GHSA-vfp6-jrw2-99g9)（low）：Possible endless data attack from attacker-controlled registry
- [GHSA-8gw7-4j42-w388](https://github.com/sigstore/cosign/security/advisories/GHSA-8gw7-4j42-w388)（medium）：Vulnerabilities with blob verification
- [GHSA-vjxv-45g9-9296](https://github.com/sigstore/cosign/security/advisories/GHSA-vjxv-45g9-9296)（medium）：`cosign verify-attestation  --type` can report a false positive if any attestation exists
- [GHSA-ccxc-vr6p-4858](https://github.com/sigstore/cosign/security/advisories/GHSA-ccxc-vr6p-4858)（low）：Cosign can be manipulated to falsely claim an entry exists in the Rekor transparency log

## 暂缓与排除

- SOPS：GHSA-jgf3-f6rg-8x3h 为 high，公开记录影响范围 `*` 且没有修复版本；本批排除。该公告涉及解密外来配置时的 Vault/OpenBao 令牌泄露，不能只看高 Star。
- act：存在工作流相关公告未列修复版本，另有已修复应用漏洞；本批暂缓，并非判定当前发行版恶意。
- htop：近期多条公告修复字段为 n/a/none，需进一步核对修复提交与正式版本，本批暂缓。
- neofetch、mods：仓库已归档；dog 等长期没有近期推送的候选未入选。
- licenseInfo 为 NOASSERTION 的候选没有直接当作开源许可成立；除 OpenShot 额外核实外，优先采用许可明确的替代项目。

## 可复核证据与验证

[机器可读快照](./open-source-apps-50-2026-10-15.snapshot.json)保存每项官方仓库、Star、维护时间、许可、正式发布、README 地址，以及完整公开公告的影响范围和修复字段。快照只含公开数据，无访问凭据。

导航结构测试只检查字段、分类/URL 唯一性、HTTP(S) 协议、搜索收藏解析及虚拟目录加载一致性；TypeScript、ESLint 与构建检查只证明本站目录可加载，不能证明第三方程序无病毒。验收另比较本批前后的目录，确认恰好新增 50 个 URL、没有删除或改写已有资源。

### 本批实际验收结果

- 目录从 2,514 项变为 2,564 项：恰好新增 50 项，批次前全部 2,514 项的分类、标题、URL、图标和描述均逐项深比较一致。
- 清单与机器快照的 50 个 URL 集合完全相同；每项满足 Star >=5,000、未归档、未禁用、2026 年推送、有正式发布及成功读取公开安全公告。
- `node --test tests/resource-navigation.test.mjs`：4 项通过。
- `npm run build`：类型检查及生产构建通过，仍有部分 chunk 超过 500 kB 的体积提示。
- `npm run lint:check` 与 `git diff --check`：通过。
- 仅本地目录更新；未提交、未推送、未部署。没有进行第三方软件的病毒检测或安装运行验证。
