<template>
  <article class="about-page">
    <p class="eyebrow">About this desk</p>
    <h1>一个为日常研究服务的个人金融入口。</h1>

    <div class="lede">
      <p>
        这个工作台收集宏观数据、股票研究、加密资产、新闻与常用工具。它优先保留信息本身，而不是图片、行情噪音或复杂视觉效果。
      </p>
      <p>所有资源链接均指向第三方网站，请自行判断信息质量与投资风险。</p>
    </div>

    <section>
      <span>01</span>
      <div>
        <h2>资源台</h2>
        <p>按主题浏览全部网址，也可以搜索标题、描述和域名。点击站点会在新标签页打开。</p>
      </div>
    </section>

    <section>
      <span>02</span>
      <div>
        <h2>本地星标</h2>
        <p>常用网址可以加星，记录仅保存在当前浏览器，不会上传任何个人数据。</p>
      </div>
    </section>

    <section>
      <span>03</span>
      <div>
        <h2>资讯台</h2>
        <p>集中存放高频阅读入口，以原站跳转替代 iframe 嵌入，减少加载问题和第三方追踪面。</p>
      </div>
    </section>

    <footer>内容仅供个人研究使用，不构成任何投资建议。</footer>
  </article>
</template>

<style scoped>
.about-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 72px clamp(20px, 5vw, 64px) 90px;
}

.eyebrow {
  margin: 0 0 18px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  max-width: 760px;
  margin: 0;
  font-family: Georgia, "Songti SC", serif;
  font-size: clamp(42px, 7vw, 72px);
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.lede {
  margin: 56px 0 64px 28%;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.85;
}

section {
  padding: 26px 0;
  border-top: 1px solid var(--border);
  display: grid;
  grid-template-columns: 72px 1fr;
}

section > span {
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
}

h2 {
  margin: 0 0 8px;
  font-family: Georgia, "Songti SC", serif;
  font-size: 21px;
  font-weight: 500;
}

section p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.75;
}

footer {
  margin-top: 58px;
  padding-top: 18px;
  border-top: 1px solid var(--ink);
  color: var(--danger);
  font-size: 12px;
}

@media (max-width: 640px) {
  .lede {
    margin-left: 0;
  }
}
</style>
