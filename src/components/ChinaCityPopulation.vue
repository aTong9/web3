<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from '@/composables/use-i18n'
import cityData from '@/data/china-city-population-2020.json'
import housingSource from '@/data/china-city-housing-assumption-2020.json' with { type: 'json' }
import indicators from '@/data/china-city-indicators.json'
import living from '@/data/china-city-living-indicators.json'
import { estimateCityHousingUnits } from '@/utils/china-city-housing'
import { matchesCityFilters } from '@/utils/china-city-filters'
import type { CityFilters } from '@/utils/china-city-filters'
import {
  askingGrossRentalYield,
  fiveYearPopulationChange,
  referenceRentIncomeRatio,
} from '@/utils/china-city-living'

const { locale } = useI18n()
const search = ref('')
const province = ref('')
const populationFilter = ref('')
const gdpFilter = ref('')
const resaleFilter = ref('')
const rentFilter = ref('')
const ratioFilter = ref('')
const yieldFilter = ref('')
const changeFilter = ref('')
const completeOnly = ref(false)
const page = ref(1)
const unitsPerHousehold = ref(housingSource.defaultUnitsPerHousehold)
const pageSize = 20
const cities = (cityData as Array<[string, string, number]>).map(
  ([name, province, population], index) => ({
    rank: index + 1,
    name,
    province,
    population: Number(population),
    gdp: (indicators.gdp as Record<string, number>)[name],
    resale: (indicators.resale as Record<string, number>)[name],
    rent: (indicators.rent as Record<string, number>)[name],
    income: (living.urbanDisposableIncome as Record<string, number>)[name],
    yearEndPopulation: (living.yearEndPopulationTenThousand as Record<string, number[]>)[name],
    incomeSource:
      (living.officialIncomeSources as Record<string, string>)[name] || living.incomeSource,
    populationSources: (living.populationSources as Record<string, string[]>)[name],
    rentIncomeRatio: referenceRentIncomeRatio(
      (indicators.rent as Record<string, number>)[name],
      (living.urbanDisposableIncome as Record<string, number>)[name],
    ),
    grossYield: askingGrossRentalYield(
      (indicators.rent as Record<string, number>)[name],
      (indicators.resale as Record<string, number>)[name],
    ),
    populationChange: fiveYearPopulationChange(
      (living.yearEndPopulationTenThousand as Record<string, number[]>)[name],
    ),
    gdpSource:
      (indicators.officialGdpSources as Record<string, string>)[name] || indicators.gdpSource,
  }),
)
const provinces = [...new Set(cities.map((city) => city.province))].sort((a, b) =>
  a.localeCompare(b, 'zh-CN'),
)
const filters = computed<CityFilters>(() => ({
  search: search.value,
  province: province.value,
  population: populationFilter.value,
  gdp: gdpFilter.value,
  resale: resaleFilter.value,
  rent: rentFilter.value,
  rentIncomeRatio: ratioFilter.value,
  grossYield: yieldFilter.value,
  populationChange: changeFilter.value,
  complete: completeOnly.value,
}))
const activeFilters = computed(
  () =>
    [
      populationFilter.value,
      gdpFilter.value,
      resaleFilter.value,
      rentFilter.value,
      ratioFilter.value,
      yieldFilter.value,
      changeFilter.value,
      completeOnly.value,
    ].filter(Boolean).length,
)
const filtered = computed(() => cities.filter((city) => matchesCityFilters(city, filters.value)))
const resetFilters = () => {
  search.value = ''
  province.value = ''
  populationFilter.value = ''
  gdpFilter.value = ''
  resaleFilter.value = ''
  rentFilter.value = ''
  ratioFilter.value = ''
  yieldFilter.value = ''
  changeFilter.value = ''
  completeOnly.value = false
}
const housingUnits = (population: number) =>
  estimateCityHousingUnits(population, unitsPerHousehold.value)
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const visible = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize).map((city) => ({
    ...city,
    estimatedUnits: housingUnits(city.population),
  })),
)
watch(filters, () => {
  page.value = 1
})
const english = computed(() => locale.value !== 'zh')
const number = (value: number) => value.toLocaleString(english.value ? 'en-US' : 'zh-CN')
const decimal = (value: number) =>
  value.toLocaleString(english.value ? 'en-US' : 'zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
const percent = (value: number) => `${decimal(value)}%`
</script>

<template>
  <section class="city-panel" :aria-label="english ? 'City population ranking' : '城市人口排名'">
    <div class="city-heading">
      <div>
        <h2>{{ english ? 'City population ranking' : '全国城市人口排名' }}</h2>
        <p>
          {{
            english
              ? '2020 census · 1 November 2020 · administrative-division totals in the cited compilation'
              : '2020 年第七次人口普查 · 2020 年 11 月 1 日零时 · 所引汇编的行政区划归集人口'
          }}
        </p>
      </div>
      <strong>{{ number(filtered.length) }} / {{ number(cities.length) }}</strong>
    </div>

    <div class="city-controls">
      <label>
        {{ english ? 'Search city or province' : '搜索城市或省份' }}
        <input
          v-model="search"
          type="search"
          :placeholder="english ? 'City or province' : '城市或省份'"
        />
      </label>
      <label>
        {{ english ? 'Province' : '省份' }}
        <select v-model="province">
          <option value="">{{ english ? 'All provinces' : '全部省份' }}</option>
          <option v-for="item in provinces" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <label>
        {{ english ? 'Assumed homes per family household' : '假设每家庭户住宅套数' }}
        <input v-model.number="unitsPerHousehold" type="number" min="0.01" step="0.01" />
      </label>
    </div>
    <details class="more-filters">
      <summary>
        {{ english ? 'More filters' : '更多筛选' }}
        <span v-if="activeFilters">({{ activeFilters }})</span>
      </summary>
      <div class="city-controls filter-controls">
        <label>
          {{ english ? 'Population' : '人口规模' }}
          <select v-model="populationFilter">
            <option value="">{{ english ? 'All populations' : '全部人口' }}</option>
            <option value="0">{{ english ? 'Under 1 million' : '100 万以下' }}</option>
            <option value="1">{{ english ? '1–5 million' : '100–500 万' }}</option>
            <option value="2">{{ english ? '5–10 million' : '500–1000 万' }}</option>
            <option value="3">{{ english ? '10 million or more' : '1000 万以上' }}</option>
          </select>
        </label>
        <label>
          {{ english ? 'GDP · CNY 100m' : 'GDP · 亿元' }}
          <select v-model="gdpFilter">
            <option value="">{{ english ? 'All GDP' : '全部 GDP' }}</option>
            <option value="0">{{ english ? 'Under 5000' : '5000 亿以下' }}</option>
            <option value="1">{{ english ? '5000–10000' : '5000 亿–1 万亿' }}</option>
            <option value="2">{{ english ? '10000 or more' : '1 万亿以上' }}</option>
          </select>
        </label>
        <label>
          {{ english ? 'Resale asking price · CNY/m²' : '二手房挂牌样本价 · 元/㎡' }}
          <select v-model="resaleFilter">
            <option value="">{{ english ? 'All prices' : '全部房价' }}</option>
            <option value="0">{{ english ? 'Under 10000' : '1 万以下' }}</option>
            <option value="1">{{ english ? '10000–20000' : '1–2 万' }}</option>
            <option value="2">{{ english ? '20000–40000' : '2–4 万' }}</option>
            <option value="3">{{ english ? '40000 or more' : '4 万以上' }}</option>
          </select>
        </label>
        <label>
          {{ english ? 'Monthly asking rent · CNY/m²' : '月租金挂牌样本 · 元/㎡' }}
          <select v-model="rentFilter">
            <option value="">{{ english ? 'All rents' : '全部租金' }}</option>
            <option value="0">{{ english ? 'Under 20' : '20 以下' }}</option>
            <option value="1">20–40</option>
            <option value="2">40–60</option>
            <option value="3">{{ english ? '60 or more' : '60 及以上' }}</option>
          </select>
        </label>
        <label>
          {{ english ? 'Reference rent / income' : '参考租金收入比' }}
          <select v-model="ratioFilter">
            <option value="">{{ english ? 'All ratios' : '全部比率' }}</option>
            <option value="0">{{ english ? 'Under 20%' : '20% 以下' }}</option>
            <option value="1">20%–30%</option>
            <option value="2">{{ english ? '30% or more' : '30% 及以上' }}</option>
          </select>
        </label>
        <label>
          {{ english ? 'Asking-sample gross yield' : '挂牌样本毛租金收益率' }}
          <select v-model="yieldFilter">
            <option value="">{{ english ? 'All yields' : '全部收益率' }}</option>
            <option value="0">{{ english ? 'Under 2%' : '2% 以下' }}</option>
            <option value="1">2%–3%</option>
            <option value="2">{{ english ? '3% or more' : '3% 及以上' }}</option>
          </select>
        </label>
        <label>
          {{ english ? '2020–2025 population change' : '2020–2025 年末人口变化' }}
          <select v-model="changeFilter">
            <option value="">{{ english ? 'All changes' : '全部变化' }}</option>
            <option value="growth">{{ english ? 'Growth' : '增长' }}</option>
            <option value="decline">{{ english ? 'Decline' : '减少' }}</option>
            <option value="same">{{ english ? 'Exactly unchanged' : '完全持平' }}</option>
          </select>
        </label>
        <label class="complete-filter">
          <input v-model="completeOnly" type="checkbox" />
          {{ english ? 'Only cities with complete data' : '仅看数据完整城市' }}
        </label>
      </div>
      <p class="estimate-note">
        {{
          english
            ? 'Complete means GDP, urban income, resale price, rent and comparable population change are all available.'
            : '“数据完整”指 GDP、城镇收入、二手房价、租金和可比人口变化均有数据。'
        }}
      </p>
    </details>
    <button
      v-if="activeFilters || search || province"
      type="button"
      class="reset-filters"
      @click="resetFilters"
    >
      {{ english ? 'Reset filters' : '重置筛选' }}
    </button>
    <p class="estimate-note">
      {{
        english
          ? 'All housing figures are estimates using one national household rate and the adjustable homes-per-household assumption; they are not observed city housing stock.'
          : '住宅套数与人/套均为估算：统一套用全国家庭户比率和可调每户套数假设，不是各城市实测住宅存量。'
      }}
    </p>
    <p class="estimate-note">
      {{
        english
          ? `GDP: ${Object.keys(indicators.gdp).length}/337 (2025); resale asking sample: ${Object.keys(indicators.resale).length}/337; rental asking sample: ${Object.keys(indicators.rent).length}/337 (October 2026). Missing observations show —.`
          : `GDP ${Object.keys(indicators.gdp).length}/337（2025 年）；二手住宅挂牌样本价 ${Object.keys(indicators.resale).length}/337、普通住宅挂牌样本租金 ${Object.keys(indicators.rent).length}/337（2026 年 10 月）。无对应样本显示“—”。`
      }}
    </p>
    <p class="estimate-note">
      {{
        english
          ? `Urban disposable income: ${Object.keys(living.urbanDisposableIncome).length}/337 (2025); comparable 2020–2025 year-end population: ${Object.keys(living.yearEndPopulationTenThousand).length}/337. Rent/income assumes 30 m² per person; rent and prices are October 2026 asking samples, not 2025 observations.`
          : `城镇居民人均可支配收入 ${Object.keys(living.urbanDisposableIncome).length}/337（2025 年）；同辖区 2020–2025 年末常住人口 ${Object.keys(living.yearEndPopulationTenThousand).length}/337。参考租金收入比按每人租住 30㎡ 估算；租金及房价为 2026 年 10 月挂牌样本，并非与收入同年实测。`
      }}
    </p>
    <p v-if="housingUnits(1) === null" class="input-error" role="alert">
      {{
        english
          ? 'Enter a positive number of homes per household.'
          : '每家庭户套数须为大于 0 的数字。'
      }}
    </p>
    <p class="estimate-note">
      {{ english ? 'Scroll sideways to see all indicators.' : '左右滑动查看全部指标。' }}
    </p>

    <div
      class="table-scroll"
      tabindex="0"
      :aria-label="english ? 'Scrollable city indicators table' : '可横向滚动的城市指标表'"
    >
      <table>
        <caption class="visually-hidden">
          {{
            english ? 'City population, descending' : '城市常住人口，从多到少'
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col">{{ english ? 'National rank' : '全国排名' }}</th>
            <th scope="col">{{ english ? 'City / prefecture' : '城市 / 地级行政区' }}</th>
            <th scope="col">{{ english ? 'Province' : '省份' }}</th>
            <th scope="col">{{ english ? 'Residents' : '常住人口（人）' }}</th>
            <th scope="col">
              {{ english ? 'Estimated homes (10k units)' : '估算住宅套数（万套）' }}
            </th>
            <th scope="col">
              {{ english ? 'Estimated residents / home' : '估算人口住宅比（人/套）' }}
            </th>
            <th scope="col">{{ english ? 'GDP · 2025 (CNY 100m)' : 'GDP · 2025（亿元）' }}</th>
            <th scope="col">
              {{
                english
                  ? 'Resale asking sample · Oct 2026 (CNY/m²)'
                  : '二手房挂牌样本 · 2026.10（元/㎡）'
              }}
            </th>
            <th scope="col">
              {{
                english
                  ? 'Rental asking sample · Oct 2026 (CNY/m²/mo)'
                  : '住宅租金挂牌样本 · 2026.10（元/㎡/月）'
              }}
            </th>
            <th scope="col">
              {{
                english
                  ? 'Urban disposable income · 2025 (CNY/person/year)'
                  : '城镇居民人均可支配收入 · 2025（元/人/年）'
              }}
            </th>
            <th scope="col">
              {{ english ? 'Reference rent / income (30 m²/person)' : '参考租金收入比（30㎡/人）' }}
            </th>
            <th scope="col">
              {{ english ? 'Asking-sample gross rental yield' : '挂牌样本毛租金收益率' }}
            </th>
            <th scope="col">
              {{ english ? 'Population change · 2020–2025 year-end' : '人口变化 · 2020–2025 年末' }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="city in visible" :key="`${city.province}-${city.name}`">
            <td>{{ city.rank }}</td>
            <th scope="row">{{ city.name }}</th>
            <td>{{ city.province }}</td>
            <td>{{ number(city.population) }}</td>
            <td>{{ city.estimatedUnits === null ? '—' : decimal(city.estimatedUnits / 10000) }}</td>
            <td>
              {{
                city.estimatedUnits === null ? '—' : decimal(city.population / city.estimatedUnits)
              }}
            </td>
            <td>
              <a
                v-if="city.gdp !== undefined"
                :href="city.gdpSource"
                target="_blank"
                rel="noopener noreferrer"
                :title="english ? 'GDP source' : 'GDP 数据来源'"
                >{{ decimal(city.gdp) }}</a
              >
              <span v-else>—</span>
            </td>
            <td>
              <a
                v-if="city.resale !== undefined"
                :href="indicators.resaleSource"
                target="_blank"
                rel="noopener noreferrer"
                :title="english ? 'Resale asking sample source' : '二手住宅挂牌样本来源'"
                >{{ number(city.resale) }}</a
              >
              <span v-else>—</span>
            </td>
            <td>
              <a
                v-if="city.rent !== undefined"
                :href="indicators.rentSource"
                target="_blank"
                rel="noopener noreferrer"
                :title="english ? 'Rental asking sample source' : '普通住宅挂牌样本来源'"
                >{{ decimal(city.rent) }}</a
              >
              <span v-else>—</span>
            </td>
            <td>
              <a
                v-if="city.income !== undefined"
                :href="city.incomeSource"
                target="_blank"
                rel="noopener noreferrer"
                >{{ number(city.income) }}</a
              ><span v-else>—</span>
            </td>
            <td>{{ city.rentIncomeRatio === null ? '—' : percent(city.rentIncomeRatio * 100) }}</td>
            <td>{{ city.grossYield === null ? '—' : percent(city.grossYield) }}</td>
            <td>
              <template v-if="city.populationChange !== null && city.populationSources">
                <a
                  :href="city.populationSources[1]"
                  target="_blank"
                  rel="noopener noreferrer"
                  :title="english ? '2025 population source' : '2025 年人口来源'"
                  >{{ city.populationChange > 0 ? '+' : '' }}{{ percent(city.populationChange) }}</a
                >
                <a
                  :href="city.populationSources[0]"
                  target="_blank"
                  rel="noopener noreferrer"
                  :title="english ? '2020 population source' : '2020 年人口来源'"
                >
                  ↗20</a
                >
              </template>
              <span v-else>—</span>
            </td>
          </tr>
          <tr v-if="!visible.length">
            <td colspan="13" class="empty">
              {{ english ? 'No matching places' : '没有匹配的地区' }}
              <button type="button" @click="resetFilters">
                {{ english ? 'Reset filters' : '重置筛选' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button type="button" :disabled="page === 1" @click="page--">
        {{ english ? 'Previous' : '上一页' }}
      </button>
      <span>{{ page }} / {{ pageCount }}</span>
      <button type="button" :disabled="page === pageCount" @click="page++">
        {{ english ? 'Next' : '下一页' }}
      </button>
    </div>

    <div class="source-note">
      <p v-if="english">
        2025 urban residents' disposable income is annual CNY per person, including non-wage income;
        it is neither a wage nor a median. The city figures come from a public compilation of local
        statistics; the four municipalities link to official bulletins. Reference rent/income =
        October 2026 asking rent (CNY/m²/month) × 30 m² × 12 ÷ 2025 urban income. The 30 m²
        per-person rental area is a fixed assumption, not an observed household. The mismatch in
        years and district rental sample limits comparisons.
      </p>
      <p v-else>
        2025
        年城镇居民人均可支配收入为每人每年金额，包含工资以外收入，不是工资或收入中位数。地级市主要来自地方统计数据的公开汇编；四个直辖市链接官方公报。参考租金收入比
        = 2026 年 10 月挂牌租金（元/㎡/月）× 30㎡ × 12 ÷ 2025 年城镇居民人均可支配收入。每人租住
        30㎡ 是固定假设，并非家庭实测；收入与租金年份及市辖区样本口径不同。
      </p>
      <p v-if="english">
        Asking-sample gross rental yield = October 2026 monthly asking rent × 12 ÷ resale asking
        price × 100%. The two indexes use separate asking samples; this is neither transaction-based
        nor net investment yield. Population change uses separate local 2020 and 2025 year-end
        resident counts for the same municipality or city jurisdiction, not the 2020 ranking count.
        Links in the change cell lead to both source years; missing or unverified pairs show —.
      </p>
      <p v-else>
        挂牌样本毛租金收益率 = 2026 年 10 月挂牌月租金 × 12 ÷ 同月二手住宅挂牌价 ×
        100%。两项指数来自不同挂牌样本，不是成交回报或扣除税费、空置等后的净收益。人口变化单独使用地方同一市域
        2020 与 2025
        年末常住人口，不拿本榜七普归集数直接计算；变化值旁链接分别指向两期来源，缺少可核对数据则显示“—”。
      </p>
      <p v-if="english">
        GDP is a 2025 citywide current-price total, mainly from a public compilation of local
        statistics; the four municipalities link to their official bulletins. The 2026 October
        resale and rent figures are Cih-Index asking-price sample averages from monitored urban
        districts, not transaction prices or whole-prefecture averages. Chongqing's price sample
        covers its main urban area. Years and administrative boundaries differ from the 2020 census.
      </p>
      <p v-else>
        GDP 为 2025
        年全市域现价总量，主要取自地方统计数据的公开汇编；四个直辖市直接链接官方公报。2026 年 10
        月二手房价和租金取自中指研究院监测市辖区的挂牌样本均价，非成交价或全地级行政区均价；重庆价格样本仅为主城区。年份及地域口径均与
        2020 年人口普查不同。
      </p>
      <p v-if="english">
        Housing units are estimates, not measured city housing stock. Formula: city residents ×
        {{ number(housingSource.familyHouseholds) }} family households ÷
        {{ number(housingSource.mainlandPopulation) }} mainland census residents × assumed homes per
        family household. The census also reports
        {{ number(housingSource.familyHouseholdPopulation) }}
        family-household residents; the published 2.62 residents per family household is rounded, so
        this calculation uses the exact counts. The default 1.08 homes per family household comes
        from this site's national scenario model and is an assumption, not an official statistic.
        The same national rate is applied to every city; local household composition, collective
        households and the population table's administrative aggregation may differ. Ratios
        therefore vary little and do not measure local housing supply.
      </p>
      <p v-else>
        住宅套数为模型估算，并非城市实测住宅存量。公式：城市常住人口 × 全国家庭户
        {{ number(housingSource.familyHouseholds) }} 户 ÷ 大陆普查人口
        {{ number(housingSource.mainlandPopulation) }} 人 × 假设每家庭户套数。七普家庭户人口为
        {{ number(housingSource.familyHouseholdPopulation) }} 人，公报中的户均 2.62
        人经过四舍五入，因此计算采用精确总数。默认每家庭户 1.08
        套沿用本站全国情景模型，属于假设，并非官方统计。所有城市使用同一全国比率；各地家庭结构、集体户占比及本表行政区划归集口径可能不同。估算比值因此几乎相同，不能视为城市真实住房供给差异。
      </p>
      <p v-if="english">
        Covers 4 municipalities and 333 prefecture-level divisions in mainland China, including
        autonomous prefectures, prefectures and leagues. Excludes county-level Jiyuan and all other
        county-level cities, Hong Kong, Macao and Taiwan. Some provinces administer counties
        directly, so the listed areas need not sum to provincial totals. This is not built-up urban
        population.
      </p>
      <p v-else>
        覆盖中国大陆 4 个直辖市及 333
        个地级行政区，含自治州、地区、盟；不含县级济源市等县级市及港澳台。部分省份另有省直辖县级单位，因此表内地区人口之和不一定等于全省人口。这里不是城区人口。
      </p>
      <p v-if="english">
        Figures follow City Population's 2020 census administrative table, checked row by row
        against that table. Local census bulletins may use a different jurisdiction or inclusion
        rule: for example, Shenzhen's bulletin reports 17,560,061 versus 17,494,398 here, and
        Baoding's current-jurisdiction bulletin reports 9,242,610 versus 11,544,036 here. Do not mix
        the two series.
      </p>
      <p v-else>
        数值逐条核对 City Population
        的七普行政区划表。地方普查公报可能采用不同辖区或纳入口径，例如深圳公报为 17,560,061
        人，本表为 17,494,398 人；保定现管辖公报为 9,242,610 人，本表为 11,544,036
        人。两套数字不可混用。
      </p>
      <div class="source-links">
        <a :href="housingSource.censusSource" target="_blank" rel="noopener noreferrer">
          {{ english ? 'NBS census household bulletin' : '国家统计局七普户别公报' }} ↗
        </a>
        <a
          href="https://www.citypopulation.de/en/china/admin/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ english ? 'City Population source table' : 'City Population 原表' }} ↗
        </a>
        <a
          href="https://www.stats.gov.cn/xxgk/sjfb/zxfb2020/202105/t20210511_1817198.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ english ? 'NBS census bulletin' : '国家统计局七普公报' }} ↗
        </a>
        <a
          href="https://www.sz.gov.cn/zfgb/2021/gb1199/content/post_8806392.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ english ? 'Shenzhen bulletin' : '深圳七普公报' }} ↗
        </a>
        <a
          href="https://www.baoding.gov.cn/content-173-312950.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ english ? 'Baoding bulletin' : '保定七普公报' }} ↗
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.city-panel {
  padding: var(--panel-padding);
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface);
  box-shadow: var(--shadow);
}
.city-heading,
.city-controls,
.pagination,
.source-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.city-heading {
  align-items: start;
  justify-content: space-between;
}
.city-heading h2 {
  margin: 0;
}
.city-heading p,
.source-note p,
.estimate-note {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}
.city-heading strong {
  color: var(--accent);
}
.city-controls {
  margin: 18px 0;
}
.more-filters {
  margin: 0 0 18px;
}
.reset-filters {
  margin-bottom: 18px;
}
.more-filters summary {
  width: fit-content;
  color: var(--accent);
  cursor: pointer;
  font-weight: 700;
}
.filter-controls {
  gap: 12px;
  margin: 14px 0 8px;
}
.filter-controls label {
  flex: 1 1 210px;
}
.filter-controls select {
  width: 100%;
}
.filter-controls .complete-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}
.complete-filter input {
  min-height: auto;
}
.city-controls label {
  display: grid;
  gap: 7px;
  min-width: min(100%, 220px);
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}
input,
select,
button {
  min-height: var(--control-height);
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-elevated);
  color: var(--ink);
  font: inherit;
}
button {
  cursor: pointer;
}
button:disabled {
  cursor: default;
  opacity: 0.5;
}
.table-scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 1800px;
  border-collapse: collapse;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
th,
td {
  padding: 10px 9px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
thead th {
  color: var(--muted);
  text-align: left;
  white-space: normal;
  min-width: 105px;
}
thead th:nth-child(1) {
  min-width: 72px;
}
thead th:nth-child(2) {
  min-width: 130px;
}
thead th:nth-child(10) {
  min-width: 175px;
}
td:last-child,
thead th:last-child {
  text-align: right;
}
tbody th {
  text-align: left;
}
thead th:nth-child(2),
tbody th {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--surface);
}
.empty {
  text-align: center;
  color: var(--muted);
}
.empty button {
  margin-left: 12px;
}
.input-error {
  color: var(--danger, #b42318);
  font-size: 12px;
}
.pagination {
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
  color: var(--muted);
  font-size: 12px;
}
.source-note {
  margin-top: 20px;
  border-top: 1px solid var(--border);
}
.source-links a {
  color: var(--accent);
  font-size: 12px;
}
td a {
  color: var(--accent);
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
