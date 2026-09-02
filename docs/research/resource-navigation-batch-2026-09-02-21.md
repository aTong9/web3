# 资源导航第 21 批主仓库核验（2026-09-02）

## 范围与去重

- 目标分类：CRM 客户管理、表单调查、科学模拟、网络存储、语音处理、视频监控。
- 读取 `src/data/webstack.yml` 全量条目后，对标题执行去首尾空格、忽略大小写比较；对 URL 执行主机名与路径忽略大小写、移除片段和末尾 `/` 的规范化比较。查询参数保留，因为目录中同一站点的不同参数可对应不同资源。
- 下列六个标题和规范化 URL 均未收录；所列仓库均为项目主维护仓库，非 fork、非归档。

## 推荐项目

### 1. 开源应用 · CRM 客户管理 — Frappe CRM

- **目录标题 / URL：** `Frappe CRM` — https://github.com/frappe/crm
- **形态与适配：** 可自托管的 Web CRM。主仓库 README 将其定义为面向现代销售团队的开源 CRM，列出线索、交易、联系人、活动、邮件、通话等能力，并提供生产环境 Self Hosting 步骤，因此与 CRM 分类直接匹配。
- **平台 / 安装：** 基于 Frappe Framework；README 给出 Bench 初始化、站点创建、应用安装与生产部署命令。
- **许可证：** 仓库根目录 `LICENSE` 为 AGPL-3.0。
- **维护信号：** 主仓库未归档；2026-08-26 发布 `v1.82.0`，2026-09-01 仍有主分支提交。
- **来源：** [README](https://github.com/frappe/crm/blob/develop/README.md)、[LICENSE](https://github.com/frappe/crm/blob/develop/LICENSE)、[v1.82.0](https://github.com/frappe/crm/releases/tag/v1.82.0)、[近期提交](https://github.com/frappe/crm/commit/1bb0900d71e17de1051d97abcf8edc219d9affb1)
- **建议描述：** `自托管销售 CRM｜管理线索、客户、交易、活动和沟通记录，并支持可配置视图与业务集成。`

### 2. 开源应用 · 表单调查 — OpnForm

- **目录标题 / URL：** `OpnForm` — https://github.com/OpnForm/OpnForm
- **形态与适配：** 可自托管的 Web 表单构建器。README 明确列出无代码表单、无限提交、表单逻辑、自定义与分析，并链接云端和自托管方案比较。
- **平台 / 安装：** Web 应用；项目文档提供 Docker 自托管路径，README 同时链接官方托管服务。
- **许可证：** 根 `LICENSE` 说明除 Enterprise 目录及第三方组件外内容采用 AGPLv3，使用时需逐项遵守仓库所列分区许可。
- **维护信号：** 主仓库未归档；2026-08-20 发布 `v2.4.0`，2026-09-01 仍有主分支提交。
- **来源：** [README](https://github.com/OpnForm/OpnForm/blob/main/README.md)、[自托管文档](https://docs.opnform.com/deployment/self-hosting)、[LICENSE](https://github.com/OpnForm/OpnForm/blob/main/LICENSE)、[v2.4.0](https://github.com/OpnForm/OpnForm/releases/tag/v2.4.0)、[近期提交](https://github.com/OpnForm/OpnForm/commit/41a7c54ce249297dc86408e36c847e856e5e3e4c)
- **建议描述：** `自托管无代码表单平台｜创建带逻辑跳转和自定义样式的表单，收集提交并查看分析。`

### 3. 开源应用 · 科学模拟 — HOOMD-blue

- **目录标题 / URL：** `HOOMD-blue` — https://github.com/glotzerlab/hoomd-blue
- **形态与适配：** Python 粒子模拟开发库。README 明确说明可在 CPU/GPU 上执行硬粒子 Monte Carlo 与分子动力学模拟，适合科学模拟分类。
- **平台 / 安装：** Python 包，支持 CPU 与 GPU；仓库提供二进制安装指南、Python API 和可运行示例。
- **许可证：** BSD-3-Clause。
- **维护信号：** 主仓库未归档；2026-08-11 发布 `v7.1.2`，2026-08-31 仍有 `trunk` 提交。
- **边界：** 目录描述只说明计算能力，不宣称模型、参数或结果已经过任一具体研究领域验证；实际研究需自行验证输入、收敛性与结果适用性。
- **来源：** [README](https://github.com/glotzerlab/hoomd-blue/blob/trunk/README.md)、[安装指南](https://github.com/glotzerlab/hoomd-blue/blob/trunk/INSTALLING.rst)、[LICENSE](https://github.com/glotzerlab/hoomd-blue/blob/trunk/LICENSE)、[v7.1.2](https://github.com/glotzerlab/hoomd-blue/releases/tag/v7.1.2)、[近期提交](https://github.com/glotzerlab/hoomd-blue/commit/f5e33ca9b71ebaf519b2e6321153371455e606da)
- **建议描述：** `CPU/GPU 粒子模拟 Python 包｜运行分子动力学和硬粒子 Monte Carlo；研究结论仍需按具体模型独立验证。`

### 4. 开源应用 · 网络存储 — JuiceFS

- **目录标题 / URL：** `JuiceFS` — https://github.com/juicedata/juicefs
- **形态与适配：** 可部署的分布式 POSIX 文件系统。README 说明其以对象存储保存数据、以 Redis/MySQL/SQLite/TiKV 等保存元数据，并提供 POSIX、Hadoop、Kubernetes 和 S3 网关接口。
- **平台 / 安装：** CLI/客户端；支持 Linux、macOS、Windows，以及 Docker/Podman 和 Kubernetes 持久卷场景。
- **许可证：** Apache-2.0。
- **维护信号：** 主仓库未归档；2026-07-30 发布 `v1.4.1`，2026-09-01 仍有主分支提交。
- **来源：** [README](https://github.com/juicedata/juicefs/blob/main/README.md)、[安装文档](https://juicefs.com/docs/community/installation)、[LICENSE](https://github.com/juicedata/juicefs/blob/main/LICENSE)、[v1.4.1](https://github.com/juicedata/juicefs/releases/tag/v1.4.1)、[近期提交](https://github.com/juicedata/juicefs/commit/a23344e5c5aa4edcbbeadc38a5dadad3f73887fc)
- **建议描述：** `分布式 POSIX 文件系统｜把对象存储接入 Linux、容器和 Kubernetes，并用独立元数据引擎协调文件访问。`

### 5. 开源应用 · 语音处理 — SpeechBrain

- **目录标题 / URL：** `SpeechBrain` — https://github.com/speechbrain/speechbrain
- **形态与适配：** 可安装的 PyTorch 语音开发工具箱。README 覆盖语音识别、说话人识别、语音增强、分离、语言建模和对话，并提供训练配方及预训练模型推理接口。
- **平台 / 安装：** Python/PyTorch 库；可从 PyPI 安装，也可从主仓库源码安装，适用于本地训练与推理工作流。
- **许可证：** Apache-2.0。
- **维护信号：** 主仓库未归档；2026-08-27 发布 `v1.1.1`，同日仍有开发分支提交。
- **来源：** [README](https://github.com/speechbrain/speechbrain/blob/develop/README.md)、[安装文档](https://speechbrain.readthedocs.io/en/latest/installation.html)、[LICENSE](https://github.com/speechbrain/speechbrain/blob/develop/LICENSE)、[v1.1.1](https://github.com/speechbrain/speechbrain/releases/tag/v1.1.1)、[近期提交](https://github.com/speechbrain/speechbrain/commit/89ead74d163463d30c62329a09cfdb4c54f5abc1)
- **建议描述：** `PyTorch 语音处理工具箱｜训练和运行语音识别、说话人识别、增强、分离及合成模型。`

### 6. 开源应用 · 视频监控 — Viseron

- **目录标题 / URL：** `Viseron` — https://github.com/roflcoopter/viseron
- **形态与适配：** 本地自托管 NVR 与计算机视觉平台。README 明确说明其为 local-only 软件，支持目标、运动和人脸检测，并以 Docker 容器启动、通过内置 Web 界面配置。
- **平台 / 安装：** Docker 自托管 Web 应用，连接受支持的网络摄像头后执行录像与本地分析。
- **许可证：** MIT。
- **维护信号：** 主仓库未归档，2026-09-01 仍有 `dev` 分支提交。
- **隐私与合规边界：** 仅应连接自己有权管理的摄像头，并在合法授权范围内录像或识别人脸；部署前需遵守所在地关于告知、同意、公共区域拍摄、录音、生物识别、保存期限与访问控制的法律和政策。
- **来源：** [README](https://github.com/roflcoopter/viseron/blob/dev/README.md)、[文档](https://viseron.netlify.app/docs/documentation/installation)、[LICENSE](https://github.com/roflcoopter/viseron/blob/dev/LICENSE)、[提交记录](https://github.com/roflcoopter/viseron/commits/dev/)
- **建议描述：** `Docker 自托管本地 NVR｜录像并执行目标、运动和人脸检测；仅限合法授权摄像头并遵守隐私及当地法规。`

## 结论

六项均满足“主维护 GitHub 项目 + 可安装、自托管、CLI 或开发库”的目录准入条件，且与当前全文件标题和规范化 URL 均无冲突。写入目录时建议采用上方标题、URL 和边界化描述。
