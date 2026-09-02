# 资源导航第 45 批候选核验（2026-09-02）

本批仅保留官方或主维护 GitHub 仓库。按标题及去除末尾 `/`、忽略大小写后的 URL 检查
`src/data/webstack.yml`，下列 6 项均未在全局目录中出现。

| 分类 | 建议条目 | 平台 / 形态 | 许可与近期维护 | 版权、安全或专业使用边界及推荐中文描述 |
| --- | --- | --- | --- | --- |
| 开源应用 · 广播直播 | [OvenMediaEngine](https://github.com/OvenMediaLabs/OvenMediaEngine) | C++ 自托管低延迟直播服务器；Linux、Docker 与云端部署 | [AGPL-3.0-only](https://github.com/OvenMediaLabs/OvenMediaEngine/blob/master/LICENSE)；官方主仓于 2026-09-01 仍有提交。[README](https://github.com/OvenMediaLabs/OvenMediaEngine#readme) | `自托管低延迟直播服务器｜接收 RTMP、SRT 等信号并以 WebRTC、LL-HLS 等协议分发；仅播出有授权内容，公网部署须配置鉴权、TLS 和访问控制。` |
| 开源应用 · 家庭媒体 | [Gerbera](https://github.com/gerbera/gerbera) | Linux/Unix 自托管 UPnP 媒体服务器；Web UI 与 Docker | [GPL-2.0-only](https://github.com/gerbera/gerbera/blob/master/LICENSE.md)；官方主仓于 2026-08-31 仍有提交，并持续发布版本。[README](https://github.com/gerbera/gerbera#readme) | `自托管 UPnP 家庭媒体服务器｜整理音乐、影片和图片并串流到局域网电视或播放器；仅共享有权使用的媒体，并避免将 UPnP 服务直接暴露公网。` |
| 开源应用 · 漫画阅读 | [LANraragi](https://github.com/Difegue/LANraragi) | NAS、Docker 或服务器自托管 Web 应用；另有 Windows 原生发行 | [MIT](https://github.com/Difegue/LANraragi/blob/dev/COPYING)；主维护分支于 2026-08-28 仍有提交，并提供近期发行。[README](https://github.com/Difegue/LANraragi#readme) | `自托管漫画归档与阅读 Web 应用｜管理漫画压缩包、标签、重复项与阅读进度；下载器和插件可能接触外部内容，仅导入有权保存的作品并保护管理入口。` |
| 开源应用 · 乐谱制谱 | [Verovio](https://github.com/rism-digital/verovio) | C++20 乐谱排版引擎与 CLI；JavaScript、Python、Java、Swift、Go 绑定 | [LGPL-3.0](https://github.com/rism-digital/verovio/blob/develop/COPYING.LESSER)；官方主仓于 2026-09-01 仍有提交，并已发布 6.2.1。[README](https://github.com/rism-digital/verovio#readme) | `跨平台乐谱排版引擎与命令行工具｜将 MEI、MusicXML、ABC 等数字乐谱渲染为 SVG，并提供多语言绑定；渲染能力不代表获得曲谱或字体版权，发布前须核对授权。` |
| 开源应用 · 摄影测量 | [AliceVision](https://github.com/alicevision/AliceVision) | C++ 摄影测量与三维计算机视觉框架、CLI；Linux、Windows 与 nightly 构建 | [MPL-2.0](https://github.com/alicevision/AliceVision/blob/develop/COPYING.md)；官方主仓于 2026-08-28 仍有提交，并提供 2026 年 nightly。[README](https://github.com/alicevision/AliceVision#readme) | `跨平台摄影测量与三维重建框架｜从照片或视频完成相机跟踪、结构恢复和稠密重建；专业测绘须独立校验控制点与精度，采集还要遵守隐私和无人机规则。` |
| 开源应用 · 数字典藏 | [ResourceSpace](https://github.com/resourcespace/resourcespace) | PHP/LAMP 自托管数字资产管理系统；Web UI 与官方 Docker | 采用明确的 [BSD-style 许可](https://github.com/resourcespace/resourcespace/blob/master/documentation/licenses/resourcespace.txt)，并对 ResourceSpace 商标命名另有限制；官方主仓于 2026-08-29 仍有提交，11.0 于 2026-06-29 发布。[README 与安装资料](https://github.com/resourcespace/resourcespace) | `自托管数字资产管理系统｜集中编目、检索、权限控制和发布图片、音视频与文档；系统不会自动取得素材权利，开放共享前须核对许可、隐私与访问权限。` |
