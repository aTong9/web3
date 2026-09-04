# 资源导航第 81 批核验

核验日期：2026-09-04。范围：终身成长的学习方法、阅读与笔记、时间与习惯管理，各新增一个独立入口；不安装软件、不修改目录 YAML。

## 去重

通过 js-yaml 读取全量 2738 项，检查标题、URL、说明中的 `learningcenter.unc`、`Studying 101`、`Study Smarter`、`library.leeds`、`Note making`、`利兹`、`FocusTimer`、`Focus Timer`、`gnome-pomodoro`：无候选命中。UNC Writing Center 已在写作分类收录，但本项为不同中心的学习策略讲义，不是已有产品子页。

## 1. UNC Studying 101 → 终身成长 · 学习方法

- [UNC Learning Center 官方讲义](https://learningcenter.unc.edu/tips-and-tools/studying-101-study-smarter-not-harder/)正文直接可读：介绍主动自测、用自己的话讲解、分散练习和学习周期。
- 免费公开英文网页，不是软件或保证提分的课程；按个人学习任务调整方法。原文许可为 CC BY-NC-ND 4.0，转载须遵守署名、非商业及禁止演绎要求，本目录只提供链接与原创摘要。

```yaml
- title: UNC Studying 101
  logo: finance.png
  url: https://learningcenter.unc.edu/tips-and-tools/studying-101-study-smarter-not-harder/
  description: 北卡大学免费英文学习指南｜通过主动自测、讲解、分散练习和学习周期安排复习；需结合个人任务调整，不承诺成绩提升。
```

## 2. University of Leeds Note Making → 终身成长 · 阅读与笔记

- [利兹大学图书馆官方指南](https://library.leeds.ac.uk/info/1401/academic-skills/85/note-making)正文直接可读：准备、记录、复盘三阶段，保留作者、标题等来源信息，区分引用和个人观点。
- [有效笔记章节](https://library.leeds.ac.uk/info/1401/academic_skills/85/note_making/2)覆盖扫读、略读、深入阅读和选择性记录。
- 免费公开英文网页，是方法指南而非笔记软件；页面关联的校内支持及软件权益不能推定对公众开放。

```yaml
- title: University of Leeds Note Making
  logo: finance.png
  url: https://library.leeds.ac.uk/info/1401/academic-skills/85/note-making
  description: 利兹大学免费英文笔记指南｜按准备、记录、复盘组织阅读和课堂笔记，保留来源并区分引用与个人观点；校内支持另有资格要求。
```

## 3. Focus Timer → 终身成长 · 时间与习惯管理

- [原仓库](https://github.com/gnome-pomodoro/gnome-pomodoro)自动重定向至[主维护仓库 FocusTimer](https://github.com/focustimerhq/FocusTimer)。README 明确原名 gnome-pomodoro，故只收录现名和当前地址。
- 主仓库 README 列出可调工作与休息时长、休息覆盖层、快捷键及日/周/月统计；Linux/GNOME 应用，推荐 Flatpak，也有发行版包和源码构建说明。
- README License 段及仓库标识为 GPL 3；免费开源。README 明确 Flathub 版不具备运行自定义脚本的 Automation 面板。不要描述为 Windows/macOS 通用应用，也不是完整习惯追踪器。
- 未安装、未执行构建、未测试桌面扩展兼容性；不推断发布日期或维护时间。

```yaml
- title: Focus Timer
  logo: finance.png
  url: https://github.com/focustimerhq/FocusTimer
  description: Linux/GNOME 开源番茄计时器｜原名 gnome-pomodoro，可调专注与休息时长并查看统计；支持 Flatpak，Flathub 版不支持自定义脚本自动化。
```
