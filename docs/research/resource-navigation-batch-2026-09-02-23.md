# 资源导航第 23 批一手来源核验

日期：2026-09-02

范围：为“电子签名、网络操作系统、OCR 文字识别、图表绘制、启动盘制作、工时追踪”各筛选一个主维护 GitHub 项目。候选已对 `src/data/webstack.yml` 全文件按小写、去首尾空白、去 URL 末尾斜杠进行 title/URL 去重，六项均未命中。已排除目录中已有的 Tesseract、draw.io Desktop、Ventoy 与 Kimai。

## 推荐项目

### 1. 开源应用 · 电子签名 — pyHanko

- 主仓库：https://github.com/MatthiasValvekens/pyHanko
- 形态与能力：可通过 pip 安装的 Python 库与 CLI，用于 PDF 数字签名、签名验证、PAdES/LTV 和 PKCS#11 工作流。[README](https://github.com/MatthiasValvekens/pyHanko#readme)
- 许可证：[MIT](https://github.com/MatthiasValvekens/pyHanko/blob/master/LICENSE)。
- 维护信号：仓库在 2026-09-01 有联合发布提交；变更记录包含 0.36.2（2026-07-27）。[提交](https://github.com/MatthiasValvekens/pyHanko/commit/00362ec2772b2d39e5d9ba2c0287efb4077421d8) · [变更记录](https://github.com/MatthiasValvekens/pyHanko/blob/master/docs/changelog.rst)
- 边界：README 将项目标为 beta / not production-ready；目录只应描述技术能力，不能宣称签名在任何司法辖区当然具有法律效力，正式使用前应测试并核对证书、流程与当地要求。
- 建议描述：`Python PDF 数字签名库与 CLI｜创建及验证 PAdES 签名并接入 PKCS#11；项目仍处 beta，正式流程需先测试与核对要求。`

### 2. 开源应用 · 网络操作系统 — FBOSS

- 主仓库：https://github.com/facebook/fboss
- 形态与能力：面向网络交换机的 Linux 用户态软件栈，核心 agent 控制硬件转发 ASIC，并以 Thrift 管理路由。[README](https://github.com/facebook/fboss#readme)
- 许可证：[BSD](https://github.com/facebook/fboss/blob/main/LICENSE)。
- 维护信号：主仓库在 2026-09-01 仍有提交。[提交](https://github.com/facebook/fboss/commit/ae0b6ae0db1d84f2a1b1f8a72a2d65e3f4b712fb)
- 边界：README 明示它不是开箱即用的网络管理员产品，因此应称为“交换机控制软件栈”，不描述为完整通用 NOS 发行版。
- 建议描述：`Linux 交换机控制软件栈｜用用户态 agent 管理转发 ASIC、路由与交换状态，适合构建定制网络平台而非开箱即用 NOS。`

### 3. 开源应用 · OCR 文字识别 — Surya

- 主仓库：https://github.com/datalab-to/surya
- 形态与能力：本地 Python OCR 与文档分析工具包，覆盖多语言 OCR、版面、阅读顺序和表格识别，可通过 pip 安装。[README](https://github.com/datalab-to/surya#readme)
- 许可证：代码为 [Apache-2.0](https://github.com/datalab-to/surya/blob/master/LICENSE)；README 另行说明模型权重采用 modified OpenRAIL-M，并带有商业使用门槛。
- 维护信号：主仓库在 2026-08-21 有提交，2026 年仍发布 0.22.x 版本。[提交](https://github.com/datalab-to/surya/commit/514b0bf4c58e59d70edd75571c323e6d118762dd) · [版本线索](https://github.com/datalab-to/surya/issues/544)
- 边界：不得由“代码开源”推断模型权重可无条件商用，使用前需分别检查代码与模型许可证。
- 建议描述：`本地 Python OCR 与文档分析工具包｜识别多语言文字、版面、阅读顺序和表格；代码与模型权重许可需分别核对。`

### 4. 开源应用 · 图表绘制 — Kroki

- 主仓库：https://github.com/yuzutech/kroki
- 形态与能力：可自托管的统一图表渲染 API，通过 Docker/Compose 部署，将多种文本图表语法输出为 SVG、PNG 或 PDF。[README](https://github.com/yuzutech/kroki#readme)
- 许可证：[MIT](https://github.com/yuzutech/kroki/blob/main/LICENSE)。
- 维护信号：主仓库在 2026-08-22 有提交，v0.30.1 于 2026-03-02 发布。[提交](https://github.com/yuzutech/kroki/commit/6392089abd49bddc4de10e0d24098b1197fc3134) · [Releases](https://github.com/yuzutech/kroki/releases)
- 建议描述：`可自托管图表渲染 API｜统一接收 Mermaid、PlantUML、D2 等文本语法并输出 SVG、PNG 或 PDF。`

### 5. 开源应用 · 启动盘制作 — Popsicle

- 主仓库：https://github.com/pop-os/popsicle
- 形态与能力：Linux USB 镜像写入工具，使用 Rust 开发，提供 GTK 图形界面与 CLI，可并行写入多个设备。[README](https://github.com/pop-os/popsicle#readme)
- 许可证：[MIT](https://github.com/pop-os/popsicle/blob/master/LICENSE)。
- 维护信号：主仓库在 2026-09-01 仍有 CLI 修复提交。[提交](https://github.com/pop-os/popsicle/commit/924f78ce132fe994a62e31c91a1a4bc1bcb0cf2f)
- 安全边界：写入镜像会覆盖目标介质数据，必须核对设备并先备份。
- 建议描述：`Linux USB 镜像写入工具｜提供 GTK 与 CLI，可并行写入多个设备；操作会覆盖目标介质，写入前务必核对并备份。`

### 6. 开源应用 · 工时追踪 — Timewarrior

- 主仓库：https://github.com/GothenburgBitFactory/timewarrior
- 形态与能力：Linux/macOS 命令行工时追踪器，提供秒表、日历回填、标签与报表，可通过发行版包、Homebrew 或源码安装。[README](https://github.com/GothenburgBitFactory/timewarrior#readme)
- 许可证：[MIT](https://github.com/GothenburgBitFactory/timewarrior/blob/develop/LICENSE)。
- 维护信号：v1.10.0 于 2026-08-02 发布，主仓库在 2026-08-29 仍有提交。[Release](https://github.com/GothenburgBitFactory/timewarrior/releases/tag/v1.10.0) · [提交](https://github.com/GothenburgBitFactory/timewarrior/commit/b2e36c346671753798549b44e3b9cc895c909d4b)
- 建议描述：`Linux/macOS 命令行工时追踪器｜用秒表、日历回填和标签记录工作，并生成周期统计与可扩展报表。`

## 结论

六项均满足“主维护 GitHub 项目 + 可安装、自托管、CLI 或开发库”的收录边界，且与当前目录 title/URL 不重复。录入时需保留 pyHanko 的 beta 边界、Surya 的双重许可证边界、FBOSS 的产品形态限制，以及 Popsicle 的目标介质覆盖警告。
