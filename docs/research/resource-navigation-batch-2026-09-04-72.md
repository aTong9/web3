# 资源导航第 72 批候选核验（2026-09-04）

本批补充 CRM 客户管理、OCR 文字识别、PDF 工具。写入前对完整 `src/data/webstack.yml` 检索 `corteza|rapidocr|rapidai|py-pdf|pypdf|pypdf2` 无匹配，三个目标分类各 7 项。仅核验第一方仓库、README、许可证与文档；未安装或执行软件，不推测维护日期，不代表安全审计或实际平台兼容性验收。

| 分类 | 条目与第一方证据 | 形态、许可与范围 | 建议中文描述 |
| --- | --- | --- | --- |
| 开源应用 · CRM 客户管理 | [Corteza 主仓与 README](https://github.com/cortezaproject/corteza)、[Apache-2.0 LICENSE](https://github.com/cortezaproject/corteza/blob/2024.9.x/LICENSE)、[官方容器部署示例](https://docs.cortezaproject.org/corteza-docs/2024.9/devops-guide/examples/deploy-offline/index.html) | 自托管低代码 Web 平台，README 明确支持构建 CRM、结构化业务应用、工作流与外部数据集成，提供 RBAC。官方示例包含 Docker 服务和数据库持久化；它是 CRM 构建平台，不应描述成无需配置即可使用的专用 CRM。 | 自托管低代码 CRM 与业务应用平台｜通过容器部署并在浏览器配置客户数据、业务流程和外部集成；需自行建模与配置，上线前落实角色权限、HTTPS、数据库备份和客户隐私保护。 |
| 开源应用 · OCR 文字识别 | [RapidOCR 主仓与 README](https://github.com/RapidAI/RapidOCR)、[Apache-2.0 LICENSE](https://github.com/RapidAI/RapidOCR/blob/main/LICENSE) | 当前主仓是 Python 组件，README 提供 pip 安装 rapidocr 和 onnxruntime，标明 Linux、Windows、macOS 与离线部署；默认中英文，其他语言取决于模型。代码 Apache-2.0，README 单独说明 OCR 模型版权归百度，外接模型仍需独立核验许可。与 PaddleOCR 有模型来源关系，但本项目提供独立 ONNX 等推理部署工具，并非同一个产品链接。 | Windows、macOS 与 Linux 本地 OCR Python 工具｜通过 pip 安装，利用 ONNX Runtime 等引擎识别图片文字，默认支持中英文；其他语言需匹配模型，处理敏感资料前确认本地推理与模型来源，关键识别结果须人工复核。 |
| 开源应用 · PDF 工具 | [pypdf 主仓与 README](https://github.com/py-pdf/pypdf)、[BSD-3-Clause LICENSE](https://github.com/py-pdf/pypdf/blob/main/LICENSE)、[官方文字提取边界](https://pypdf.readthedocs.io/en/stable/user/extract-text.html) | pip 安装的纯 Python 库，可拆分、合并、裁剪、变换 PDF 页面，读取文字和元数据；AES 需额外 crypto 依赖。文档明确不是 OCR，扫描图片无法直接提取文字，并提示较大内容流可能大量占用内存。PyPDF2 名称也已检索无重复；与已收录 pikepdf、PyMuPDF 是不同项目。 | 纯 Python PDF 处理库｜通过 pip 安装，拆分、合并、裁剪页面并提取文字与元数据；不提供扫描图片 OCR，批处理前备份原件，对不可信或大型文件限制内存与处理时间。 |

边界建议中的 HTTPS、备份、模型来源检查与资源限制是根据部署和处理方式提出的使用建议，不是已完成的安全验证。YetiForceCRM 旧仓已归档且迁移，本批未选用，也未对其新仓许可证作结论。目录写入、解析去重和页面验收由主任务执行。
