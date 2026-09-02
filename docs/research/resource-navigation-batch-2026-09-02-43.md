# 资源导航第 43 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按标题及去除末尾 `/`、忽略大小写后的 URL 检查
`src/data/webstack.yml`，下列 6 项均未在全局目录中出现。

| 分类 | 建议条目 | 平台 / 形态 | 许可与近期维护 | 使用与安全边界及推荐中文描述 |
| --- | --- | --- | --- | --- |
| 开源应用 · 工程仿真 | [Feel++](https://github.com/feelpp/feelpp) | C++ 有限元、谱元、DG/HDG 多物理场库与并行计算框架；Linux/HPC 源码及容器部署 | [LGPL-3.0](https://github.com/feelpp/feelpp/blob/develop/LICENSE)；主维护分支于 2026-08-23 仍有提交。[README](https://github.com/feelpp/feelpp#readme) | `Linux/HPC 多物理场数值仿真框架｜使用有限元、谱元及并行降阶模型求解工程问题；工程结论须检查网格收敛、材料参数，并以试验或规范独立复核。` |
| 开源应用 · 工程求解 | [SUNDIALS](https://github.com/LLNL/sundials) | C 数值库，提供 C++、Fortran 等接口；Linux、macOS、Windows 与 HPC | [BSD-3-Clause](https://github.com/LLNL/sundials/blob/main/LICENSE)；LLNL 主仓于 2026-06-25 仍有提交，并持续发布版本。[README](https://github.com/LLNL/sundials#readme) | `跨平台工程数值求解器套件｜嵌入程序求解常微分、微分代数、非线性方程及灵敏度问题；结果依赖模型、容差和刚性判断，关键工程须独立校核。` |
| 开源应用 · 科学模拟 | [Quantum ESPRESSO](https://github.com/QEF/q-e) | Fortran/C 命令行套件；Linux/Unix、MPI、CPU/GPU 与 HPC | [GPL-2.0](https://github.com/QEF/q-e/blob/develop/License)；QEF 官方仓库于 2026-07-09 仍有提交。[README](https://github.com/QEF/q-e#readme) | `Linux/HPC 第一性原理科学模拟套件｜计算电子结构、能带、晶格与材料响应；结果受赝势、泛函、截断能和收敛参数影响，材料结论须结合基准及实验验证。` |
| 开源应用 · 科研工程 | [OpenFAST](https://github.com/OpenFAST/openfast) | 风机与风场耦合仿真 CLI、库及发行版；Windows、Linux、macOS、HPC | [Apache-2.0](https://github.com/OpenFAST/openfast/blob/main/LICENSE)；官方主仓于 2026-03-12 仍有提交，并提供持续发行。[README](https://github.com/OpenFAST/openfast#readme) | `跨平台风能科研仿真工具｜分析风力机及多机风场的气动、结构与控制耦合；模型输出不等同设计认证，载荷、控制器和场址假设须按标准与试验复核。` |
| 开源应用 · 化学材料 | [FireWorks](https://github.com/materialsproject/fireworks) | Python 库与命令行工作流管理器；MongoDB 后端，Linux、macOS、HPC | 采用 [BSD 三条款式许可](https://github.com/materialsproject/fireworks/blob/main/LICENSE)；Materials Project 主仓于 2026-08-28 仍有提交。[README](https://github.com/materialsproject/fireworks#readme) | `材料计算工作流管理工具｜在工作站或集群保存、执行、恢复并追踪计算科研任务；它负责调度而不验证科学正确性，生产集群须最小化凭据权限并备份任务数据库。` |
| 开源应用 · 机器人 | [Pinocchio](https://github.com/stack-of-tasks/pinocchio) | C++ 刚体动力学库与 Python 绑定；Linux、macOS、Windows，Conda 或源码安装 | [BSD-2-Clause](https://github.com/stack-of-tasks/pinocchio/blob/devel/LICENSE)；CNRS/INRIA 主仓于 2026-09-01 仍有提交。[README](https://github.com/stack-of-tasks/pinocchio#readme) | `跨平台机器人动力学 C++/Python 库｜计算运动学、刚体动力学、接触与可微物理；算法部署到实机前须验证关节和力矩限制、碰撞保护及硬件急停。` |
