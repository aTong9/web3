import fs from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const outputPath = new URL('../src/data/lifelong-books.json', import.meta.url)
const apiBase = 'https://openlibrary.org/search.json'
const execFileAsync = promisify(execFile)

const categoryQueries = {
  '0-6岁早期发展': [
    'early childhood development',
    'early childhood education',
    'infant development',
  ],
  '6-12岁基础能力': [
    'middle childhood development',
    'elementary education',
    'children life skills',
  ],
  '12-18岁科学探索': ['science for teenagers', 'science education', 'young adult popular science'],
  '18岁以上开放大学': ['adult education', 'self education', 'lifelong learning'],
  职业方向: ['career development', 'vocational guidance', 'career planning'],
  财商基础: ['personal finance', 'financial literacy', 'money management'],
  创业增收: ['entrepreneurship', 'small business', 'business startup'],
  独立生活: ['independent living', 'life skills', 'home economics'],
  艺术审美: ['art history', 'aesthetics', 'visual arts'],
  语言沟通: ['linguistics', 'language learning', 'interpersonal communication'],
  数据统计素养: ['statistics', 'data literacy', 'data visualization'],
  '50-70岁持续学习': ['healthy aging', 'education of older adults', 'active aging'],
  青少年心理韧性: ['adolescent psychology', 'resilience psychology', 'teen mental health'],
  媒介数字素养: ['media literacy', 'digital literacy', 'information literacy'],
  家庭关系: ['family relationships', 'family psychology', 'marriage and family'],
  法律常识: ['introduction to law', 'legal literacy', 'everyday law'],
  写作研究: ['academic writing', 'research methods', 'writing craft'],
  创客动手: ['maker movement', 'electronics projects', 'do it yourself'],
  自然户外: ['outdoor education', 'nature study', 'wilderness skills'],
  世界文化: ['cultural anthropology', 'world cultures', 'intercultural studies'],
  家庭健康知识: ['family health', 'public health', 'preventive medicine'],
  家庭照护: ['family caregiving', 'elder care', 'home care'],
  退休规划: ['retirement planning', 'retirement finance', 'life after retirement'],
  居家经营: ['home management', 'household management', 'home maintenance'],
  数学思维: ['mathematical thinking', 'recreational mathematics', 'problem solving mathematics'],
  经济常识: ['economics introduction', 'economic literacy', 'political economy'],
  历史哲学: ['world history', 'introduction to philosophy', 'history of ideas'],
  烹饪饮食: ['cooking', 'food science', 'culinary arts'],
  运动体能: ['physical fitness', 'exercise science', 'strength training'],
  园艺种植: ['gardening', 'horticulture', 'vegetable gardening'],
  汽车维护: ['automobile maintenance', 'automotive repair', 'car mechanics'],
  隐私安全: ['digital privacy', 'cybersecurity', 'information security'],
  自由职业: ['freelancing', 'self employment', 'independent contractor'],
  沟通表达: ['public speaking', 'communication skills', 'rhetoric'],
  志愿服务: ['volunteering', 'community service', 'civic engagement'],
  学习方法: ['learning science', 'study skills', 'memory techniques'],
  音乐实践: ['music theory', 'music practice', 'music education'],
  摄影表达: ['photography', 'photographic composition', 'documentary photography'],
  电影创作: ['filmmaking', 'cinematography', 'film directing'],
  旅行规划: ['travel planning', 'independent travel', 'travel guide'],
  急救常识: ['first aid', 'emergency medicine handbook', 'medical emergencies'],
  防灾准备: ['disaster preparedness', 'emergency preparedness', 'disaster risk reduction'],
  消费者权益: ['consumer protection', 'consumer rights', 'consumer law'],
  缝纫纺织: ['sewing', 'textile crafts', 'dressmaking'],
  木工制作: ['woodworking', 'carpentry', 'furniture making'],
  自行车维护: ['bicycle maintenance', 'bicycle repair', 'bike mechanics'],
  地图地理: ['geography', 'cartography', 'map reading'],
  环境行动: ['environmental sustainability', 'environmental conservation', 'climate action'],
}

const categoryPatterns = {
  '0-6岁早期发展': /early childhood|infant development/i,
  '6-12岁基础能力': /middle childhood|child development|elementary education|life skills/i,
  '12-18岁科学探索': /science/i,
  '18岁以上开放大学': /adult education|adult learner|lifelong learning|self[ -]education/i,
  职业方向: /career|vocational/i,
  财商基础: /personal finance|financial literacy|money management/i,
  创业增收: /entrepreneur|small business|business start/i,
  独立生活: /independent living|life skills|home economics/i,
  艺术审美: /art history|aesthetic|visual art/i,
  语言沟通: /linguist|language learning|communication/i,
  数据统计素养: /statistic|data literacy|data visual/i,
  '50-70岁持续学习': /aging|ageing|older adult/i,
  青少年心理韧性: /adolescent|resilience|teen mental/i,
  媒介数字素养: /media literacy|digital literacy|information literacy/i,
  家庭关系: /family|marriage/i,
  法律常识: /\blaw\b|legal/i,
  写作研究: /writing|research method/i,
  创客动手: /maker|electronics|do it yourself/i,
  自然户外: /outdoor|nature study|wilderness/i,
  世界文化: /cultural anthropology|world culture|intercultural/i,
  家庭健康知识: /family health|public health|preventive medicine/i,
  家庭照护: /caregiv|elder care|home care/i,
  退休规划: /retir/i,
  居家经营: /home management|household|home maintenance/i,
  数学思维: /mathemat|problem solving/i,
  经济常识: /econom/i,
  历史哲学: /history|philosoph/i,
  烹饪饮食: /cook|food science|culinary/i,
  运动体能: /fitness|exercise|strength training/i,
  园艺种植: /gardening|horticultur|vegetable garden/i,
  汽车维护: /automobil|automotive|car mechanic/i,
  隐私安全: /privacy|cybersecurity|information security/i,
  自由职业: /freelanc|self[ -]employ|independent contractor/i,
  沟通表达: /public speaking|communication skills|rhetoric/i,
  志愿服务: /volunteer|community service|civic engagement/i,
  学习方法: /learning science|study skill|memory/i,
  音乐实践: /music/i,
  摄影表达: /photograph/i,
  电影创作: /film|cinematograph/i,
  旅行规划: /travel|tourism|trip planning/i,
  急救常识: /first aid|emergency medicine|medical emergenc/i,
  防灾准备: /disaster|emergency preparedness/i,
  消费者权益: /consumer/i,
  缝纫纺织: /sew|textile|dressmaking/i,
  木工制作: /woodwork|carpentry|furniture making/i,
  自行车维护: /bicycle|bike/i,
  地图地理: /geograph|cartograph|map reading/i,
  环境行动: /environment|sustainab|conservation|climate action/i,
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const fetchBooks = async (query, attempt = 1) => {
  const url = new URL(apiBase)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '100')
  url.searchParams.set(
    'fields',
    'key,title,author_name,first_publish_year,edition_count,language,ratings_average,ratings_count',
  )

  try {
    const { stdout } = await execFileAsync(
      'curl',
      [
        '-L',
        '--fail',
        '--max-time',
        '45',
        '--retry',
        '4',
        '--retry-delay',
        '1',
        '--silent',
        '--show-error',
        url.toString(),
      ],
      { maxBuffer: 12 * 1024 * 1024 },
    )

    return JSON.parse(stdout).docs ?? []
  } catch (error) {
    if (attempt < 4) {
      await sleep(1000 * attempt)
      return fetchBooks(query, attempt + 1)
    }
    throw error
  }
}

const normalizeBook = (document) => ({
  title: document.title.trim(),
  authors: (document.author_name ?? []).slice(0, 3),
  firstPublishYear: document.first_publish_year ?? null,
  editionCount: document.edition_count ?? 1,
  rating: document.ratings_average ? Number(document.ratings_average.toFixed(2)) : null,
  source: 'Open Library',
  url: `https://openlibrary.org${document.key}`,
})

const isUsable = (document, category) =>
  document.key?.startsWith('/works/') &&
  document.title?.trim() &&
  document.author_name?.length &&
  document.first_publish_year &&
  document.edition_count &&
  categoryPatterns[category]?.test(document.title)

const scoreBook = (document) =>
  Math.min(document.edition_count ?? 0, 100) +
  Math.min(document.ratings_count ?? 0, 100) * 0.5 +
  (document.ratings_average ?? 0) * 4

const buildCategory = async ([category, queries]) => {
  let documents = await fetchBooks(`title:"${queries[0]}"`)
  const unique = new Map()

  documents
    .filter((document) => isUsable(document, category))
    .sort((a, b) => scoreBook(b) - scoreBook(a))
    .forEach((document) => {
      const key = `${document.title.trim().toLocaleLowerCase()}|${document.author_name[0]}`
      if (!unique.has(key)) unique.set(key, normalizeBook(document))
    })

  if (unique.size < 50) {
    const supplements = (
      await Promise.all(queries.slice(1).map((query) => fetchBooks(`title:"${query}"`)))
    ).flat()
    supplements
      .filter((document) => isUsable(document, category))
      .sort((a, b) => scoreBook(b) - scoreBook(a))
      .forEach((document) => {
        const key = `${document.title.trim().toLocaleLowerCase()}|${document.author_name[0]}`
        if (!unique.has(key)) unique.set(key, normalizeBook(document))
      })
  }

  const books = [...unique.values()].slice(0, 50)
  if (books.length < 50) throw new Error(`${category} only produced ${books.length} books`)
  return { category, books }
}

let results = []
if (!process.argv.includes('--force')) {
  try {
    const existing = JSON.parse(await fs.readFile(outputPath, 'utf8'))
    results = Array.isArray(existing.categories) ? existing.categories : []
  } catch {
    results = []
  }
}

const completedCategories = new Set(results.map((entry) => entry.category))
const entries = Object.entries(categoryQueries).filter(
  ([category]) => !completedCategories.has(category),
)

const writeResults = async () => {
  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      name: 'Open Library',
      url: 'https://openlibrary.org/',
      methodology:
        'Subject-query candidates with author and publication metadata, ranked by editions and reader ratings; top 50 unique works per category.',
    },
    categories: results,
  }

  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

for (let index = 0; index < entries.length; index += 2) {
  const batch = entries.slice(index, index + 2)
  results.push(...(await Promise.all(batch.map(buildCategory))))
  console.log(`Fetched ${results.length}/${Object.keys(categoryQueries).length} categories`)
  await writeResults()
  await sleep(250)
}

console.log(`Wrote ${results.length} categories and ${results.length * 50} books`)
