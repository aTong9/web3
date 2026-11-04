<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed, ref } from 'vue'
import sections from '@/data/million-action-plan.json'

const props = defineProps<{ query?: string }>()
const group = ref('')
const total = sections.reduce((sum, section) => sum + section.items.length, 0)
const visibleSections = computed(() => {
  const needle = (props.query ?? '').trim().toLocaleLowerCase()
  return sections
    .filter((section) => !group.value || group.value === section.id)
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          !needle ||
          [section.title, item.title, item.threshold, item.verdict, item.action]
            .join(' ')
            .toLocaleLowerCase()
            .includes(needle),
      ),
    }))
    .filter((section) => section.items.length)
})
</script>

<template>
  <section class="million-plan" aria-label="资产用途整合目录">
    <header class="merged-heading">
      <span>资产用途目录 · {{ sections.length }} 类 {{ total }} 项</span>
      <h3>50万—100万，用在真正需要的地方</h3>
      <p>
        原行动清单已并入本章，与本章需求和办理材料统一阅读。扩展项目是用途备选，不需要同时做，也不以花光本金为目标。
      </p>
      <small
        >整理日期：2026-11-03 ·
        原50项保留来源记录；新增7项、深化5项；本轮为整理方法及部分官方资料补充，不代表全部条款重新核验。</small
      >
    </header>
    <details class="budget-context">
      <summary>资金口径、50 / 60 / 80 / 100万示例与建议顺序</summary>
      <section class="intro" aria-label="使用说明">
        <div>
          <span>01 / 先留底座</span>
          <h2>50万—100万元是本金，不是消费目标</h2>
          <p>
            以下假设你是内地个人、以人民币50万—100万元可支配金融资产规划。实际优先级还取决于收入、负债、家庭开支、交易经历和出行需求。
          </p>
        </div>
        <div>
          <span>02 / 算清净值</span>
          <h2>门槛、成本、收益分开算</h2>
          <p>
            净权益价值 = 实际用到的优惠 − 年费及手续费 −
            资金机会成本。存款达标、签证材料、产品认购和会员消费不是同一类用途。
          </p>
        </div>
      </section>

      <section id="plan-budgets" class="budget-guide" aria-labelledby="budget-title">
        <h2 id="budget-title">先看50万—100万元，差别在哪里</h2>
        <p>
          下面只演示“总资金减去预留后，还能调度多少”。预留金额是假设，不是推荐比例；实际应先扣除负债和未来确定支出。可调度资金也不等于应当投入或花掉。
        </p>
        <div class="budget-table">
          <table>
            <caption>
              单位：人民币万元；不计算投资收益，不重复计入同一笔资金
            </caption>
            <thead>
              <tr>
                <th scope="col">总资金</th>
                <th scope="col">预留示例</th>
                <th scope="col">可调度</th>
                <th scope="col">可以怎么想</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">50万</th>
                <td>10万</td>
                <td>40万</td>
                <td>
                  优先分散现金、短期开支和技能提升；若50万必须全部留在某账户达标，预留现金就需另有来源。
                </td>
              </tr>
              <tr>
                <th scope="row">60万</th>
                <td>10万</td>
                <td>50万</td>
                <td>
                  有空间研究一家50万门槛账户或一项证券资格，但还需满足日均、经历和持续维护要求。
                </td>
              </tr>
              <tr>
                <th scope="row">80万</th>
                <td>15万</td>
                <td>65万</td>
                <td>
                  若50万用于账户考核，剩15万仍可安排转职缓冲、进修或小项目；别将65万重复用于多个门槛。
                </td>
              </tr>
              <tr>
                <th scope="row">100万</th>
                <td>20万</td>
                <td>80万</td>
                <td>
                  更有余地兼顾家庭目标与关系行；扣除预留后仍不到100万，不应为了单只私募认购额耗尽现金。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <b>先选用途：</b
          >资产达标只是在账户内持有；存款或投资要考虑期限与波动；消费会减少本金；创业预算可能全部损失。本文不假设所有项目同时执行。
        </p>
      </section>
      <section id="plan-order" class="order">
        <h2>建议办理顺序</h2>
        <ol>
          <li>
            <b>先盘点：</b
            >保留应急金和已知支出，查清高息债务，确认50万—100万元中真正长期闲置的部分。
          </li>
          <li>
            <b>再比账户：</b
            >汇丰卓越、金葵花和渣打按真实使用场景比较，先选一家；拿到收费和权益条件再转入资金。
          </li>
          <li>
            <b>并行准备签证：</b>整理真实流水、收入和旅行计划；日本手机待通信兼容性确认后再买。
          </li>
          <li>
            <b>按需开权限：</b
            >先让券商与期货公司核实经历和资金窗口，再安排资金。普通账户、港股通、科创板与衍生品分开处理；衍生品先模拟。
          </li>
          <li><b>补齐家庭服务：</b>先保障缺口，再按实际需要购买医院会员、旅行服务或生产力工具。</li>
          <li>
            <b>暂缓大额锁定：</b>私人银行和私募等独立核验，避免为了身份把全部本金投入单一产品。
          </li>
        </ol>
        <p>
          本页为资料清单，不代表开户、授信、签证或收益承诺。规则与优惠会变化，办理前重新核对链接及机构书面回复。
        </p>
      </section>
    </details>
    <div class="plan-filter">
      <label
        >用途分类<select v-model="group" aria-label="资产用途分类">
          <option value="">全部 {{ total }} 项</option>
          <option v-for="section in sections" :key="section.id" :value="section.id">
            {{ section.title }} · {{ section.items.length }} 项
          </option>
        </select></label
      >
      <span
        >{{ visibleSections.reduce((sum, section) => sum + section.items.length, 0) }} 项匹配</span
      >
    </div>
    <p v-if="!visibleSections.length" role="status">
      此分类没有匹配内容。切换“全部”或清空全文搜索。
    </p>
    <section
      v-for="section in visibleSections"
      :id="`plan-${section.id}`"
      :key="section.id"
      class="plan-section"
    >
      <header>
        <span>{{
          String(sections.findIndex((item) => item.id === section.id) + 1).padStart(2, '0')
        }}</span>
        <div>
          <h3>{{ section.title }}</h3>
          <p>{{ section.summary }}</p>
        </div>
      </header>
      <article v-for="item in section.items" :key="item.id" :data-plan-item="item.id">
        <div class="item-heading">
          <h4>{{ item.title }}</h4>
          <small>{{ item.kind }}</small>
        </div>
        <p class="threshold">{{ item.threshold }}</p>
        <p>{{ item.verdict }}</p>
        <details>
          <summary>下一步与核验来源</summary>
          <p>{{ item.action }}</p>
          <RouterLink v-if="item.url.startsWith('/')" :to="item.url"
            >{{ item.source }} →</RouterLink
          >
          <a v-else :href="item.url" target="_blank" rel="noopener noreferrer"
            >{{ item.source }} ↗</a
          >
          <ul v-if="item.id === 'iphone'" class="phone-checks">
            <li>
              硬件取舍：日本规格列48MP主摄及2倍光学品质裁切、USB
              2最高480Mb/s；没有独立超广角或长焦镜头。这些是Air产品定位，不能归因于日版地区限制。
            </li>
            <li>
              国内可用性：Wi-Fi可用；大陆本地eSIM不可用；境外eSIM漫游需要套餐明确支持中国大陆，并确认是否含语音、短信和长期漫游。
            </li>
            <li>
              Apple智能：境外机若人在大陆且Apple账户地区也为大陆，官方目前明确不可用；买日版不能保证解锁全部服务。
            </li>
            <li>
              仍待实机确认：日本相机快门声音、具体运营商漫游稳定性及跨区保修受理；本页没有实机结论，购买前向Apple及运营商确认。
            </li>
          </ul>
          <a
            v-if="item.id === 'iphone'"
            href="https://support.apple.com/zh-cn/121115"
            target="_blank"
            rel="noopener noreferrer"
            >Apple智能地区限制 ↗</a
          >
          <a
            v-if="item.id === 'iphone'"
            href="https://www.apple.com/jp/iphone-air/specs/"
            target="_blank"
            rel="noopener noreferrer"
            >日本官方硬件规格 ↗</a
          >
          <a
            v-if="item.id === 'us'"
            href="https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html"
            target="_blank"
            rel="noopener noreferrer"
            >访客签证与 EVUS ↗</a
          >
        </details>
      </article>
    </section>
  </section>
</template>

<style scoped>
.million-plan {
  color: var(--ink);
  min-width: 0;
  margin: 24px 0 32px;
}
.merged-heading {
  border-left: 3px solid var(--accent);
  padding: 4px 0 4px 18px;
  margin-bottom: 22px;
}
.merged-heading > span {
  font-size: 11px;
  color: var(--accent);
}
.merged-heading h3 {
  font-size: 21px;
  margin: 10px 0;
  text-wrap: balance;
}
p {
  font-size: 13px;
  line-height: 1.9;
  margin: 8px 0;
  text-wrap: pretty;
}
.merged-heading p,
.merged-heading small {
  color: var(--muted);
}
.merged-heading small {
  display: block;
  font-size: 11px;
  line-height: 1.8;
}
.budget-context {
  border: 1px solid var(--border);
  padding: 18px;
  border-radius: 10px;
  background: var(--surface);
  margin: 0 0 24px;
}
summary {
  cursor: pointer;
  font-size: 13px;
  line-height: 1.7;
  font-weight: 600;
}
.intro {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 24px 0;
}
.intro span {
  color: var(--accent);
  font-size: 11px;
}
h2 {
  font-size: 17px;
  line-height: 1.6;
}
.budget-table {
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
  font-size: 12px;
  line-height: 1.8;
}
caption {
  caption-side: top;
  color: var(--muted);
  font-size: 11px;
  padding: 12px 0;
}
th,
td {
  padding: 12px 10px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  text-align: left;
  font-variant-numeric: tabular-nums;
}
th,
td:not(:last-child) {
  white-space: nowrap;
}
.order {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
.order ol {
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.9;
}
.order li {
  margin-bottom: 10px;
}
.plan-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  margin: 0 0 24px;
}
.plan-filter label {
  font-size: 12px;
  color: var(--muted);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
select {
  max-width: 100%;
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
  font: inherit;
}
.plan-filter > span {
  font-size: 11px;
  color: var(--muted);
}
.plan-section {
  margin: 0 0 30px;
}
.plan-section > header {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
}
.plan-section > header > span {
  color: var(--accent);
  font-size: 12px;
  padding-top: 5px;
}
.plan-section header h3 {
  font-size: 19px;
  margin: 0;
}
.plan-section header p {
  color: var(--muted);
}
.plan-section article {
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  margin-bottom: 12px;
}
.item-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  align-items: start;
}
h4 {
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}
.item-heading small {
  color: var(--muted);
  font-size: 10px;
  white-space: nowrap;
}
.threshold {
  color: var(--accent);
  font-size: 12px;
  margin: 12px 0 8px;
}
article details {
  margin-top: 16px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
article summary {
  font-size: 12px;
  color: var(--muted);
}
a {
  color: var(--accent);
  display: inline-block;
  margin: 8px 12px 0 0;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.phone-checks {
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.9;
}
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
@media (max-width: 540px) {
  .intro {
    grid-template-columns: 1fr;
  }
  .merged-heading h3 {
    font-size: 19px;
  }
  .plan-section article {
    padding: 18px 16px;
  }
  .budget-context {
    padding: 16px;
  }
}
</style>
