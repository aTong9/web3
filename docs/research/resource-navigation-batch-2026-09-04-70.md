# 资源导航第 70 批候选核验（2026-09-04）

本批为 API 调试、性能测试、邮件测试各补充一项。读取第一方 README 与许可证；未安装候选，不推测最近维护日期。写入前全局检索 `curlie`、`stressapptest`、`Stressful Application`、`greenmail`、`icegreen`，无匹配；三个目标分类当前各 7 项。Curlie 是独立的 curl 前端，不是已收录 HTTPie 的别名。

| 分类 | 条目与第一方证据 | 形态、许可与范围 | 建议中文描述 |
| --- | --- | --- | --- |
| 开源应用 · API 调试 | [Curlie 主仓及 README](https://github.com/rs/curlie)、[MIT LICENSE](https://github.com/rs/curlie/blob/master/LICENSE) | curl 命令行前端，支持 curl 选项、请求头与 JSON 输入、格式化输出及流式数据；README 列 macOS、Linux、Windows 安装路径，可使用 Homebrew、Scoop、Go 或二进制包。`--curl` 会显示实际命令，不能视为凭据脱敏功能。 | macOS、Linux 与 Windows HTTP 调试 CLI｜作为 curl 前端提供易读请求语法、JSON 格式化和流式输出；仅访问获授权接口，避免令牌进入命令历史、日志或共享输出。 |
| 开源应用 · 性能测试 | [stressapptest 主仓及 README](https://github.com/stressapptest/stressapptest)、[Apache-2.0 COPYING](https://github.com/stressapptest/stressapptest/blob/master/COPYING) | Linux 用户态内存与 I/O 压力测试 CLI，README 提供发行版包与源码编译；通过处理器和 I/O 随机流量测试硬件稳定性。不是全面硬件诊断或标准性能排名工具；上游明确警告会导致应用无响应，边缘故障机器可能过热或发生磁盘损坏。 | Linux 内存与 I/O 压力测试 CLI｜可通过发行版包或源码安装，以高负载检查硬件稳定性；仅在获授权的隔离机器运行，先备份并监控温度，可能造成卡顿、过热或数据损坏。 |
| 开源应用 · 邮件测试 | [GreenMail 主仓](https://github.com/greenmail-mail-test/greenmail)、[README](https://github.com/greenmail-mail-test/greenmail/blob/master/README.md)、[Apache-2.0 license.txt](https://github.com/greenmail-mail-test/greenmail/blob/master/license.txt) | Java 测试库及独立容器化模拟邮件服务器；支持 SMTP、IMAP、POP3，可嵌入测试发送、接收和验证邮件。README 提供 Maven 坐标及 Docker 入口，源码构建要求 JDK 11+；不承诺每个平台原生桌面安装包。与真实生产邮件服务器不同。 | Java 邮件测试库与独立 Docker 服务｜模拟 SMTP、IMAP、POP3，验证应用收发邮件并集成自动化测试；仅部署于隔离测试环境，使用虚构账号与邮件，勿暴露公网或录入生产凭据。 |

凭据保护、授权和隔离建议依据工具功能边界提出，不是安全审计结论。未执行压力测试、不登录、不上传数据；目录写入及页面验收由主任务执行。
