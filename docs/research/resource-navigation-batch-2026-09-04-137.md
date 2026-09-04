# 资源导航补充研究 · Batch 137

日期：2026-09-04。农业园艺、能源电网、数学计算各 1 项；限定数据建模，不安装、不操作设备或施用农药。

## 去重与互补性

已读取三类全部条目，并在完整 `src/data/webstack.yml` 搜索 PCSE / ajwdewit、pvlib / pvlib-python、mpmath；无匹配。分别补充作物过程模拟、光伏性能模型和任意精度数值运算，区别于农场台账、整体电网模型及符号代数工具。

## 开源应用 · 农业园艺

```yaml
title: PCSE
logo: finance.png
url: https://github.com/ajwdewit/pcse
description: Python 作物模拟环境｜组合气象、土壤和作物参数研究生长与产量情景；需本地校准和田间验证，模型结果不保证实际收成，也不直接用于病害诊断或农药决策
```

- [官方仓库](https://github.com/ajwdewit/pcse)：纯 Python 模块化作物模型环境，输入输出与模型分离，可读参数和天气数据；非硬件控制平台。
- [官方 LICENSE](https://github.com/ajwdewit/pcse/blob/master/LICENSE)：EUPL-1.1 或后续获批准版本，不能误标 MIT/BSD。[官方入门文档](https://pcse.readthedocs.io/en/stable/quickstart.html)为安装与使用入口。
- 平台定位 Python 环境，不承诺独立 GUI 或全机型安装包。开源代码不等于气象数据、田间数据或外部服务免费；输入质量与地区校准决定适用性，保护地块位置和生产资料。

## 开源应用 · 能源电网

```yaml
title: pvlib python
logo: finance.png
url: https://github.com/pvlib/pvlib-python
description: Python 光伏性能分析工具箱｜用模型研究光伏系统表现与相关气象输入，支持 pip/conda 安装；估算不等于实际发电保证，需复核组件参数、时间单位与实测数据，不替代电气安全设计
```

- [官方仓库与许可](https://github.com/pvlib/pvlib-python)：BSD-3-Clause，提供光伏性能模拟函数和类，可经 pip 或 conda 使用。不是实时并网控制器，也不是完整工程认证流程。
- README 链接[官方文档](https://pvlib-python.readthedocs.io/)；本次尝试旧 installation.html 子路径为 404，因此安装说明依据仓库已读内容，不冒称子页已核验。
- Python 科学计算工具，无需指定商业云账户；外部辐照/气象服务可能有账户、限额和独立许可。具体平台支持取决于所选 Python 与依赖版本，未安装验证。不要上传未经授权的电站位置与生产数据。

## 开源应用 · 数学计算

```yaml
title: mpmath
logo: finance.png
url: https://github.com/mpmath/mpmath
description: Python 任意精度数值计算库｜处理高精度实数、复数与特殊函数，适合研究和结果交叉检查；需合理设置精度，更多位数不等于数学证明或消除输入与算法误差
```

- [官方仓库](https://github.com/mpmath/mpmath)：BSD-3-Clause，任意精度浮点计算库；与 SymPy 的符号运算不同，可作为数值工作流独立使用。README 记录版本历史及 CHANGES 入口，不据此承诺本机兼容性。
- [官方站点](https://mpmath.org/)由仓库链接；作为 Python 库使用，不是独立桌面计算器。核心开源代码不要求付费服务，用户选择的远端计算环境另计。
- 精度、舍入、收敛与输入表示需检查；数值结果不是严格证明，关键计算应使用已知结果或独立算法复核。未执行真实用户数据计算。

## 核验边界

本批仅依据一手公开仓库及说明形成三条候选，未修改 YAML，未安装、模拟实际作业、上传资料或执行设备操作。未核验完整跨平台运行矩阵及生产结果。
