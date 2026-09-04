# 六个指定英语 GitHub 项目核验

核验日期：2026-09-04。依据 research 技能，只查官方仓库、官方文档；未安装、注册、上传学习资料或改 YAML。

## 去重与落地建议

全目录搜索仓库名、维护者、产品别名：Qwerty Learner 已在语言学习分类；Anki 已在其他学习工具分类，不应新增同 URL 副本，可移动既有条目以集中查找。其余四项无产品命中。注意四项不全是 OSI 开源软件：byoungd 是带非商业限制的开放内容，发音清单未见明确许可证。

## 1. English-level-up-tips／人生进阶指南

- 用户原链：https://github.com/byoungd/English-level-up-tips
- 当前项目：[byoungd/up](https://github.com/byoungd/up)，现为《人生进阶指南》，保留英语词汇、语法、听说读写等主线，范围已扩展至终身学习；不是可安装英语训练应用。
- [许可范围](https://github.com/byoungd/up/blob/master/LICENSE.md)：正文 CC BY-NC 4.0；网站代码 MIT；第三方素材另有权利。不能把整本书称为无条件开源软件，也不能因可阅读而推断可商业转载。
- 建议标题：`离谱的英语学习指南（现人生进阶指南）`
- 建议 URL：`https://github.com/byoungd/up`
- 建议描述：`公开学习指南｜保留英语听说读写与词汇训练主线，现扩展为人生进阶指南；正文 CC BY-NC 4.0，方法与个人经验不保证学习效果。`

## 2. everyone-can-use-english／人人都能用英语与 Enjoy

- 用户原链：https://github.com/xiaolai/everyone-can-use-english
- [现官方仓库](https://github.com/ZuodaoTech/everyone-can-use-english)为 ZuodaoTech/everyone-can-use-english；GitHub API 同样返回新 full_name，未归档。不是仓库失效。
- 当前 README 同时保留 2010 年《人人都能用英语》、2024 年《一千小时》，并介绍 Enjoy 网页版与支持 YouTube/Netflix 的浏览器扩展。新版桌面版被标为「即将发布」，不能写成已发布的新离线桌面应用。
- 仓库 GPL-3.0；开放源码不代表 Enjoy 托管服务、AI 处理或第三方视频内容永久免费。使用云端功能前核对当前费用、账号要求和录音/文本的处理去向；本次未验证登录后套餐与功能。
- 建议标题：`人人都能用英语 / Enjoy`
- 建议 URL：`https://github.com/ZuodaoTech/everyone-can-use-english`
- 建议描述：`英语学习书稿与 Enjoy 项目｜含口语、语音和精读资料，当前主推网页版与浏览器扩展；云端功能需核对费用和隐私，不保证学习效果。`
- [官方 FAQ](https://1000h.org/enjoy-app/faq.html)可供后续使用核查，但旧桌面文档不能覆盖当前网页服务状态。

## 3. Qwerty Learner（已有）

- [官方仓库](https://github.com/RealKai42/qwerty-learner)：GPL-3.0；网页单词记忆与键盘拼写练习，包含程序员词库和 API 练习，也链接 VS Code 插件。不是 IELTS 官方备考产品。
- 建议保留现条目，不新建副本。建议描述：`开源网页词汇与拼写练习｜把单词记忆和英文键盘输入结合，含程序员词库；适合键盘练习，不替代口语交流或完整语言课程。`
- 可自行部署，但线上版本、语音资源及插件具有各自联网和权限边界；开源不意味着托管服务永不变化。

## 4. Earthworm

- [官方仓库](https://github.com/cuixueshe/earthworm)：AGPL-3.0；以逐步构造句子练习英语的 Web 项目。
- 官方自部署文档需要 Node.js、pnpm、PostgreSQL、Redis 与 Docker 等环境，非无需依赖的桌面应用；有认证与服务端配置，应管理账号、练习数据、数据库与密钥。
- 代码开源与第三方线上服务的课程、可用性、收费是不同事项；不承诺学习提升、免费无限使用或所有资料许可。
- 建议标题：`Earthworm`
- 建议 URL：`https://github.com/cuixueshe/earthworm`
- 建议描述：`开源英语组句练习 Web 项目｜通过逐步构造句子训练表达，可自部署；需数据库等服务，线上课程与账号政策以实际服务为准。`

## 5. 中国程序员容易发音错误的单词

- [官方仓库](https://github.com/shimohq/chinese-programmer-wrong-pronunciation)：技术词汇对照清单，含英美读音、音标、常见误读和中文释义；也链接社区扩展与其他客户端。
- [README](https://github.com/shimohq/chinese-programmer-wrong-pronunciation/blob/master/README.md)读音链接主要指向有道，部分指向其他来源。播放音频会连接第三方，不应标成全离线音频工具。
- 当前 GitHub 文件列表与页面未见明确 LICENSE：可作为公开协作资料链接，不推断可自由再分发音频或软件许可。技术名称存在约定和发音差异，宜结合词典核对，不宣称清单是唯一规范。
- 建议标题：`程序员英语发音清单`
- 建议 URL：`https://github.com/shimohq/chinese-programmer-wrong-pronunciation`
- 建议描述：`公开技术英语发音清单｜对照英美音标、常见误读与中文释义，附第三方读音链接；适合查词纠音，不是完整口语课程。`

## 6. Anki（已有）

- [官方仓库](https://github.com/ankitects/anki)是电脑版本源码；[许可证](https://github.com/ankitects/anki/blob/main/LICENSE)为 AGPL-3.0-or-later，部分组件适用其他许可。
- [官方下载页](https://apps.ankiweb.net/)确认 Windows、macOS、Linux 电脑版本免费；AnkiWeb 同步免费，官方 iOS AnkiMobile 是付费应用，Android AnkiDroid 是独立开发项目，不能把六者混为同一仓库。
- 建议移动或保留已有 Anki 条目，勿重复添加；建议描述：`开源间隔重复词卡工具｜Windows、macOS 与 Linux 可制作多媒体卡片并安排复习；云同步可选，iOS 官方应用另付费，需自行核验牌组质量。`
- 云同步会传输学习内容；插件须审查来源与权限，第三方牌组不自动获得版权授权，复习计划不保证考试成绩。

统一 logo 可沿用 `finance.png`。本记录建议四项新建、两项复用；最终分类应容纳「公开指南/资料」而不将其全部标成开源应用。
