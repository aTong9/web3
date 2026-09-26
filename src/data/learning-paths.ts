import type { LearningPath } from '@/types/learning-paths'

export const learningPaths: LearningPath[] = [
  {
    id: 'personal-finance',
    title: '从收支到 FIRE 目标',
    titleEn: 'From cash flow to a FIRE goal',
    goal: '先整理真实收支，再理解风险与费用，最后写出可复查的财务假设。',
    goalEn: 'Map your cash flow, understand risk and fees, then document reviewable assumptions.',
    destination: '/personal-finance',
    steps: [
      {
        id: 'finance-budget',
        title: '列出一个月的真实收支',
        titleEn: 'Map one month of cash flow',
        task: '阅读预算资料，列出税后收入、固定支出、弹性支出和债务；保留原始账单，不把信用额度算作资产。',
        taskEn:
          'Read the budgeting material. List take-home income, fixed and flexible expenses, and debts. Keep supporting records; credit limits are not assets.',
        resources: [{ title: 'Consumer.gov', url: 'https://consumer.gov/' }],
      },
      {
        id: 'finance-risk',
        title: '看懂风险、分散与费用',
        titleEn: 'Understand risk, diversification and fees',
        task: '阅读投资者教育资料，写下自己尚不理解的三项风险，以及所关注产品的费用来源；不需要购买产品。',
        taskEn:
          'Read investor education material. Note three risks you need to understand and where product fees are disclosed. No purchase is needed.',
        resources: [{ title: 'Investor.gov', url: 'https://www.investor.gov/' }],
      },
      {
        id: 'finance-plan',
        title: '建立可调整的目标',
        titleEn: 'Build an adjustable goal',
        task: '在个人资产模块录入资产、负债和支出，比较三种回报假设；记录通胀、税费、医疗支出和收入变化中未覆盖的因素。',
        taskEn:
          'Use the personal finance module to enter assets, debts and spending. Compare three return assumptions and note omitted taxes, healthcare costs and income changes.',
        resources: [
          {
            title: 'Investor.gov · Employment to Retirement',
            url: 'https://www.investor.gov/employment-retirement',
          },
        ],
      },
    ],
  },
  {
    id: 'macro',
    title: '宏观数据与事件阅读',
    titleEn: 'Read macro data and events',
    goal: '把指标定义、发布日期和历史修订分开，做一份能追溯原始数据的观察笔记。',
    goalEn:
      'Separate indicator definitions, release dates and revisions in a source-backed observation.',
    destination: '/event-calendar',
    steps: [
      {
        id: 'macro-series',
        title: '读懂一个时间序列',
        titleEn: 'Read one time series',
        task: '在 FRED 选择一个通胀或就业序列，记录序列 ID、单位、频率、季调方式和观测日期；不要把同比与环比混用。',
        taskEn:
          'Choose an inflation or employment series in FRED. Record its ID, units, frequency, seasonal adjustment and observation dates; distinguish annual and monthly changes.',
        resources: [{ title: 'FRED', url: 'https://fred.stlouisfed.org/' }],
      },
      {
        id: 'macro-release',
        title: '回到统计机构核对口径',
        titleEn: 'Check the statistical definition',
        task: '从 BEA 资料查找 GDP 或个人收入与支出的定义，区分名义与实际指标；在事件日历核对计划发布日期。',
        taskEn:
          'Use BEA material to check a GDP or income-and-spending definition. Distinguish nominal and real measures, then check the scheduled release in the calendar.',
        resources: [{ title: 'BEA Open Data', url: 'https://www.bea.gov/open-data' }],
      },
      {
        id: 'macro-vintage',
        title: '比较首次发布与修订值',
        titleEn: 'Compare releases and revisions',
        task: '在 ALFRED 选两个历史版本，对比同一观测期的数据；记录当时能看到的信息，完成一段不使用未来信息的复盘。',
        taskEn:
          'Choose two ALFRED vintages for the same observation period. Compare the values and write a review using only information available at the time.',
        resources: [{ title: 'ALFRED', url: 'https://alfred.stlouisfed.org/' }],
      },
    ],
  },
  {
    id: 'company',
    title: '从原始财报到研究笔记',
    titleEn: 'From filings to research notes',
    goal: '选择一家公司，核对报表期间与来源，形成有证据和失效条件的观点。',
    goalEn:
      'Choose a company, verify periods and sources, and write a thesis with an invalidation condition.',
    destination: '/research-workspace?tab=notes',
    steps: [
      {
        id: 'company-filing',
        title: '找到原始申报',
        titleEn: 'Locate the original filing',
        task: '在 EDGAR 找到公司的一份 10-K 或 10-Q，记录 CIK、申报时间和报告期，阅读业务说明与风险因素。',
        taskEn:
          'Find a 10-K or 10-Q in EDGAR. Record its CIK, filing date and reporting period; read the business description and risk factors.',
        resources: [{ title: 'SEC EDGAR', url: 'https://www.sec.gov/edgar/search/' }],
      },
      {
        id: 'company-figures',
        title: '核对三项报表数字',
        titleEn: 'Reconcile three figures',
        task: '选取收入、净利润和经营现金流，与 SEC 结构化数据交叉核对单位、期间和修订。结构化数据不能代替完整申报。',
        taskEn:
          'Cross-check revenue, net income and operating cash flow against SEC structured data, including units, periods and amendments. Structured data does not replace the full filing.',
        resources: [
          {
            title: 'SEC Financial Statement Data Sets',
            url: 'https://www.sec.gov/data-research/sec-markets-data/financial-statement-data-sets',
          },
        ],
      },
      {
        id: 'company-thesis',
        title: '写下可被证伪的观点',
        titleEn: 'Write a testable thesis',
        task: '在研究台记录观点、原文链接、一个失效条件和复查日期。若准备自动取数，先阅读 SEC API 的访问政策与数据定义。',
        taskEn:
          'Record a thesis, filing links, an invalidation condition and a review date in the workspace. Before automating data access, read the SEC API policies and definitions.',
        resources: [
          {
            title: 'SEC EDGAR API',
            url: 'https://www.sec.gov/search-filings/edgar-application-programming-interfaces',
          },
        ],
      },
    ],
  },
  {
    id: 'creator',
    title: '完成一支短视频作品',
    titleEn: 'Finish a short video',
    goal: '用自己有权使用的素材，完成采集、声音处理、剪辑和导出检查。',
    goalEn:
      'Use material you have permission to use and complete capture, audio, editing and export checks.',
    destination: '/income-ledger',
    steps: [
      {
        id: 'creator-capture',
        title: '采集一段可用素材',
        titleEn: 'Capture usable footage',
        task: '用 OBS 或自己的拍摄设备制作一段短素材，记下分辨率、帧率、声音来源和使用许可；先检查原片是否可播放。',
        taskEn:
          'Capture a short clip with OBS or your camera. Record resolution, frame rate, audio source and permissions; confirm the original plays correctly.',
        resources: [{ title: 'OBS Studio', url: 'https://github.com/obsproject/obs-studio' }],
      },
      {
        id: 'creator-edit',
        title: '完成剪辑与声音检查',
        titleEn: 'Edit and check the audio',
        task: '用 Resolve 完成一个短片，必要时用 Audacity 处理声音。保留原素材，检查剪辑点、削波和对白或环境声的可听性。',
        taskEn:
          'Edit a short piece in Resolve, using Audacity for audio if useful. Preserve originals and check cuts, clipping and the clarity of speech or ambience.',
        resources: [
          {
            title: 'DaVinci Resolve',
            url: 'https://www.blackmagicdesign.com/products/davinciresolve',
          },
          { title: 'Audacity', url: 'https://www.audacityteam.org/' },
        ],
      },
      {
        id: 'creator-deliver',
        title: '验证导出并记录投入',
        titleEn: 'Verify the export and log effort',
        task: '完整播放导出文件，核对开头、中间、结尾及音画同步；可使用 FFmpeg 工具查看媒体信息。在实践账本记录耗时与实际成本，尚未结算的收入单独填写。',
        taskEn:
          'Play the export and check the beginning, middle, end and audio sync. FFmpeg tools can inspect media metadata. Log hours and actual costs in the ledger; keep pending income separate.',
        resources: [{ title: 'FFmpeg', url: 'https://github.com/FFmpeg/FFmpeg' }],
      },
    ],
  },
]
