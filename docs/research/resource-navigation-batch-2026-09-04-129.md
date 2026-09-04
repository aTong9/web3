# 资源导航补充研究 · Batch 129

日期：2026-09-04。范围：运动健康、地理空间、安全防护各 1 项；仅研究，未安装、扫描或上传数据。

## 去重与用途

已检查三个分类现有条目，并对完整 `src/data/webstack.yml` 搜索 openScale / oliexdev / GeoPandas / objective-see / LuLu 等产品、别名和 URL，未发现重复。运动类现有 RunnerUp、wger、GoldenCheetah、LibreFit、Open Food Facts、Gadgetbridge、FitTrackee、Workout.cool；地理类已有 GeoServer、GDAL、CesiumJS、MapLibre GL JS、Tippecanoe、PDAL、GRASS GIS、PROJ；安全类已有 ClamAV、Wazuh、OpenVAS Scanner、Lynis、OWASP ZAP、CrowdSec、osquery、Suricata。

本批分别补足个人身体指标手动记录、Python 表格式几何处理、macOS 应用出站联网控制。GeoPandas 使用 GDAL/PROJ 依赖，但提供不同层次的数据分析工作流，不是已有链接换名。

## 开源应用 · 运动健康

```yaml
title: openScale
logo: finance.png
url: https://github.com/oliexdev/openScale
description: Android 个人身体指标记录工具｜支持手动录入、图表与部分蓝牙秤，无需账户；开发版可能不稳定且不自动更新，指标与估算不能替代医疗判断
```

- [官方仓库与 README](https://github.com/oliexdev/openScale)：Android 应用，GPL-3.0-or-later；支持手动测量输入、CSV 导入导出、图表与部分 BLE 秤。设备兼容性须按型号核查，不能泛称所有蓝牙秤可用。
- 同页说明不要求账户、主应用无互联网权限；额外 openScale sync 可连接外部服务。不要将主应用说明延伸为所有插件和导出文件永不泄露。蓝牙发现可能涉及位置权限；仅手动输入不要求使用蓝牙。
- [官方发布页](https://github.com/oliexdev/openScale/releases)：可查看发布记录；README 明示 Google Play 是开放测试版，GitHub 开发版可能有问题且不自动更新。这里不承诺商店永久免费或提供稳定性保证。
- 仅定位个人记录工具。量测设备、估算和视觉区间反馈不构成诊断；备份文件含敏感健康数据，保存与共享需自行保护。

## 开源应用 · 地理空间

```yaml
title: GeoPandas
logo: finance.png
url: https://github.com/geopandas/geopandas
description: BSD-3-Clause Python 地理数据工具｜以 GeoDataFrame 进行几何处理与绘图，适配 Windows、macOS 和 Linux；需地理依赖，计算前核对坐标系并保护位置数据
```

- [官方仓库](https://github.com/geopandas/geopandas)：BSD-3-Clause；扩展 pandas 的 GeoSeries / GeoDataFrame，结合 Shapely 进行几何操作、读取地理格式与绘图。几何计算采用笛卡尔坐标，不能把任意坐标的面积或距离当作地表真实单位。
- [官方安装说明](https://geopandas.org/en/stable/getting_started/install.html)：支持 conda 或 pip；Windows、Mac、Linux 可用二进制依赖，但具体 Python/平台组合可能需要编译。官方建议保持同一包渠道，避免地理依赖冲突。
- [官方 Releases](https://github.com/geopandas/geopandas/releases)：有版本与变更记录；不代表本机兼容性已经测试。
- 库本身不要求付费账户；外部地图、地理编码、数据库、托管服务可能另有费用和数据条款。位置资料与输出应按敏感程度处理，不承诺所有扩展流程离线。

## 开源应用 · 安全防护

```yaml
title: LuLu
logo: finance.png
url: https://github.com/objective-see/LuLu
description: macOS 开源出站防火墙｜提示并按规则控制应用联网，需批准系统扩展与网络过滤；只用于自有或获授权设备，不能保证拦截全部流量或替代恶意软件防护
```

- [官方仓库](https://github.com/objective-see/LuLu)：GPL-3.0，免费开源 macOS 防火墙；不是远程扫描工具。
- [官方产品与操作文档](https://objective-see.org/products/lulu.html)：公开提供 DMG 与版本入口，当前页列 macOS 10.15+；安装须由用户批准 System Extension 和 Network Filter。这里只核验说明，没有安装或改变防火墙规则。
- 同页说明仅控制出站连接，默认配置可放行 Apple 与已有程序；部分流量不经过网络扩展，因此不可承诺全面阻断。规则误配可能影响正常联网。
- 官方页有版本与 Changelog 链接作为维护信号。更新检查联网；用户主动点击 VirusTotal 时打开包含文件哈希的查询网址，不把工具描述为零网络访问。保持人工判断与系统防护配合。

## 核验边界

以上为一手公开文档与发布入口核验，不是安装、性能、安全审计或医疗验证。无账户创建、下载运行、硬件操作、外部扫描或个人数据上传；未修改目录 YAML。
