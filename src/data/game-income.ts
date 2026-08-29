import type { GameIncomeGame } from '@/types'

// 仅收录官方提供或明确许可兑现路径的项目；规则会变化，操作前必须复核来源。
export const gameIncomeUpdatedAt = '2026-08-29'

export const gameIncomeGames: GameIncomeGame[] = [
  {
    id: 'roblox-devex',
    name: 'Roblox',
    model: '创作者经济 · DevEx',
    payout: 'fiat',
    startCost: 'free',
    platforms: 'Windows / macOS / 移动端',
    availability: '全球多数地区 · 13+ · 税务资料',
    summary:
      '用 Roblox Studio 制作体验、插件或虚拟物品，合资格的 Earned Robux 可通过 Developer Exchange 换成本地法币；这是一条创作经营路线，不是刷号。',
    earningRoutes: ['原创体验', '通行证与开发者商品', '插件 / 头像物品', '创作者奖励'],
    steps: [
      '免费注册并用 Roblox Studio 制作原创体验、插件、头像物品或游戏内商品。',
      '通过官方认可的商品、通行证、订阅、私人服务器等方式获得 Earned Robux。',
      '达到 30,000 Earned Robux，验证邮箱并保持账号合规。',
      '在 Creator Hub 进入 Finances → Cash Out，用法定姓名提交 DevEx 申请。',
      '首次通过后，在 DevEx Portal 填写税务与付款资料并提交收款。',
    ],
    requirements: [
      '至少 13 岁，邮箱已验证并持续遵守服务条款。',
      '最低 30,000 Earned Robux；购买、礼品卡及部分转售所得不计入。',
      '美国纳税人提交 W-9，其他地区通常提交 W-8。',
    ],
    risks: [
      '平台明确不保证投入时间后一定赚钱。',
      'DevEx 汇率和合资格收入由平台认定，存在审核、版权与封禁风险。',
      '冷启动、开发和运营的时间成本可能高于收入。',
    ],
    sources: [
      {
        label: 'DevEx 资格、汇率与申请',
        url: 'https://en.help.roblox.com/hc/en-us/articles/203314100-Developer-Exchange-DevEx-Overview-How-to-Submit-Requirements',
      },
    ],
  },
  {
    id: 'second-life',
    name: 'Second Life',
    model: '虚拟商品与服务 · LindeX',
    payout: 'fiat',
    startCost: 'free',
    platforms: 'Windows / macOS / Linux',
    availability: '依付款地区 · 付款方式备案 / 可能 KYC',
    summary:
      '销售原创服装、模型、脚本或虚拟服务获得 L$，再通过官方 LindeX 卖成 USD 余额并申请 Payout。',
    earningRoutes: ['原创虚拟商品', '场景与脚本服务', '活动服务', '合规虚拟经营'],
    steps: [
      '免费创建 Basic 账号，选择原创商品或可持续虚拟服务路线。',
      '在 Second Life 或 Marketplace 销售并积累 L$，保留交易记录。',
      '在账号中添加受支持的付款方式。',
      '在 LindeX 用市价或限价卖出 L$，换成账号 USD balance。',
      '在 Account Dashboard 提交 Payout，并完成可能触发的身份与税务核验。',
    ],
    requirements: [
      '提现方式取决于真实所在地与支付服务支持情况。',
      '出售 L$ 或提现时可能需要 Tilia / Linden Lab 身份核验。',
      '只能销售有权使用的原创或授权内容。',
    ],
    risks: [
      '卖出 L$ 和 USD Payout 各有费用，限价单也可能长期不成交。',
      '租地、开店和订阅会形成固定成本。',
      '非官方换汇、侵权内容和私下现金交易可能导致损失或封禁。',
    ],
    sources: [
      {
        label: 'L$ 赚取、出售与提现',
        url: 'https://community.secondlife.com/knowledgebase/english/buying-and-selling-linden-dollars-r46/',
      },
      { label: '官方费率表', url: 'https://secondlife.com/corporate/pricing' },
    ],
  },
  {
    id: 'entropia-universe',
    name: 'Entropia Universe',
    model: '真实现金经济 MMO · PED',
    payout: 'fiat',
    startCost: 'capital',
    platforms: 'Windows / macOS',
    availability: '银行与法律允许地区 · 本人银行账户 / KYC',
    summary:
      'PED 以 10 PED = USD 1 固定计值，可提现到本人银行；免费活动能入门，但交易、采矿、制造和狩猎通常需要本金且波动很高。',
    earningRoutes: ['资源采集与 markup', '玩家间交易', '服务经营', '预算化制造 / 采矿'],
    steps: [
      '先用免费活动熟悉拍卖、Trade Terminal Value 与物品 markup。',
      '选择采集、交易或服务路线；高消耗玩法必须预设 PED 预算。',
      '逐笔记录弹药、装备衰减、拍卖费、成交收入，只看净 PED。',
      '累积至少 1,000 PED，在 Account → Withdrawal 填写本人银行资料。',
      '完成身份与资金审查，核对平台费和银行费后提交。',
    ],
    requirements: [
      '最低提现 1,000 PED（USD 100）。',
      '银行账户必须为本人名下并能接收国际付款。',
      '提现费 1%，最低 100 PED；收款银行可能另收费。',
    ],
    risks: [
      '真实现金经济不代表狩猎、采矿或制造具有正期望值。',
      '低流动性物品的挂牌价格不等于可以成交的价格。',
      '最低提现时最低平台费相当于 10%，且审核到账可能较慢。',
    ],
    sources: [
      { label: 'PED 汇率', url: 'https://account.entropiauniverse.com/account/deposit' },
      { label: '官方提现', url: 'https://www.entropia-universe.com/account/withdrawal' },
      {
        label: '提现费用',
        url: 'https://account.entropiauniverse.com/support-faq/deposits-and-withdrawals/withdrawal-faq/do-i-have-to-pay-any-fees/index.xml',
      },
    ],
  },
  {
    id: 'sorare',
    name: 'Sorare',
    model: '梦幻体育 · 赛事奖励',
    payout: 'mixed',
    startCost: 'free',
    platforms: 'Web / iOS / Android',
    availability: '18+ · 地区限制 · Cash Wallet KYC',
    summary:
      '部分 Common Card 赛事可免费参加；赛事可能发放现金、ETH、SOL 或可交易卡片。付费卡不是必需起点，也不应被视为保证回本的本金。',
    earningRoutes: ['免费 Common Card 赛事', '赛事现金奖励', 'ETH / SOL 奖励', '合资格数字卡'],
    steps: [
      '先核对所在国家是否受支持，注册账号并启用安全措施。',
      '用 Common Cards 参加允许免费阵容的赛事，熟悉赛程、评分和伤病。',
      '若进入付费赛区，只用可承受全部损失的预算购买所需卡片。',
      '获得奖励后激活 Cash Wallet 或 Blockchain Wallet；现金路径需完成 Mangopay KYC。',
      '现金提到本人银行；加密资产提到已小额验证的个人钱包地址。',
    ],
    requirements: [
      '有价值奖励赛事通常要求 18+，受制裁地区不可用。',
      '现金提现需政府证件、本人银行账户与 Mangopay 验证。',
      '支持国家与法国 JONUM 规则会变化，操作前需重查。',
    ],
    risks: [
      '球员表现、伤病、卡片折旧和赛事规则会影响净收益。',
      '加密提现产生网络费，错误钱包地址通常不可逆。',
      '不得使用多账号、操纵市场或绕过地区限制。',
    ],
    sources: [
      { label: '2026 游戏规则', url: 'https://sorare.com/game-rules' },
      { label: '地区与条款', url: 'https://sorare.com/terms-and-conditions' },
      {
        label: '官方提现步骤',
        url: 'https://sorare.com/help/a/4402888729361/--How-to-withdraw-funds-from-my-Sorare-Wallet',
      },
    ],
  },
  {
    id: 'upland',
    name: 'Upland',
    model: '数字地产与 NFT · USD Marketplace',
    payout: 'fiat',
    startCost: 'low',
    platforms: 'Web / iOS / Android',
    availability: '18+ · Thunes KYC · PayPal 支持地区',
    summary:
      '合资格玩家可把满足持有期的地产和部分 NFT 在官方 USD Marketplace 出售，成交款经支付伙伴结算后提到 PayPal。',
    earningRoutes: ['合资格地产', '可售 NFT', '官方 USD Marketplace'],
    steps: [
      '免费注册为 Visitor，验证邮箱并开启 2FA。',
      '通过新手分配、活动或合规购买取得资产，并达到 Uplander 状态。',
      '在 Settings → Verify Your Identity 完成 Thunes KYC。',
      '等待资产满足持有期，在 Marketplace 选择 List for USD。',
      '成交后通过支持的 PayPal 提现，并核对费用与地区限制。',
    ],
    requirements: [
      '18+，达到 Uplander 或更高身份并持有合资格资产。',
      'USD 提现需 Thunes KYC 与受支持的 PayPal 地区。',
      'UPX 本身不是可在游戏外交易的代币。',
    ],
    risks: [
      '资产可能无人接盘，或只能低于购入成本成交。',
      '存在资产购入、市场交易、提现与税务成本。',
      '地区、持有期和可售资产规则可能调整。',
    ],
    sources: [
      { label: 'USD 出售与提现', url: 'https://upland.me/learn/selling-for-usd' },
      { label: '账号与 KYC', url: 'https://upland.me/learn/create-your-account' },
      {
        label: '官方服务条款',
        url: 'https://upland.me/documents/Upland_Terms_of_Service_June_8_2026.pdf',
      },
    ],
  },
  {
    id: 'axie-infinity',
    name: 'Axie Infinity',
    model: '链游任务与竞技 · Ronin',
    payout: 'crypto',
    startCost: 'free',
    platforms: 'Web / Windows / macOS / 移动端',
    availability: '18+ · 钱包 · 地区与交易所限制',
    summary:
      '免费 Codex/Bounty Board 与部分竞技路线可获得链上奖励，AXS、SLP、bAXS 或 NFT 提到 Ronin；转法币需再走所在地合法且支持相应网络的交易服务。',
    earningRoutes: ['Codex / Bounty Board', '竞技与锦标赛', 'AXS / SLP / bAXS', '可交易 NFT'],
    steps: [
      '创建 Sky Mavis 账号和 Ronin Wallet，离线备份恢复信息。',
      '先从免费 Codex/Bounty Board 或合规赛事开始，避免先买高价资产。',
      '按快照与领取窗口在 App.Axie Claim；Classic 奖励按官方 Withdrawal 流程操作。',
      '等待审计后把可转让资产提到正确的 Ronin 地址。',
      '如需法币，只使用所在地合法且支持该资产与网络的交易服务，并先小额验证。',
    ],
    requirements: [
      '官方条款要求 18+，受制裁或法律禁止地区不可用。',
      '需要自主管理钱包；交易所出金通常另需 KYC。',
      '部分高阶赏金、繁殖、锻造或阵容需要代币 / NFT。',
    ],
    risks: [
      '代币、NFT 与奖励池价格可能剧烈下降或调整。',
      '私钥、钓鱼、桥接、网络和交易所风险可能造成不可逆损失。',
      '多账号、机器人、代练和绕规则行为可能导致封禁。',
    ],
    sources: [
      {
        label: 'Classic 奖励提现',
        url: 'https://support.axieinfinity.com/hc/en-us/articles/29281788349211-Axie-Classic-AXS-SLP-Withdrawal',
      },
      {
        label: 'Codex 与 Bounty Board',
        url: 'https://support.axieinfinity.com/hc/en-us/articles/42313486303771-App-Axie-Codex-and-Bounty-Board',
      },
      { label: '18+ 与地区条款', url: 'https://axieinfinity.com/terms-of-use' },
    ],
  },
  {
    id: 'decentraland',
    name: 'Decentraland',
    model: '数字商品创作 · Polygon MANA',
    payout: 'crypto',
    startCost: 'capital',
    platforms: 'Web / Windows / macOS',
    availability: '钱包 · 内容审核 · 当地加密合规',
    summary:
      '用 Creator Hub 或 Blender 制作原创 Wearable 与 Emote，通过审核后在官方 Marketplace 初售，扣费后的 Polygon MANA 直接进入创作者指定钱包。',
    earningRoutes: ['Wearable 创作', 'Emote 创作', 'Marketplace 初售', '二级销售版税'],
    steps: [
      '免费创建账号并连接钱包，用 Creator Hub 或 Blender 制作原创 Wearable / Emote。',
      '在 Builder 创建 collection，设置受益钱包和供应量，核对并支付发布费。',
      '提交 Curation Committee 审核；通过后启用 Primary Sales 并设置 MANA 价格。',
      '成交后在钱包核对扣除平台费后的 Polygon MANA。',
      '如需法币，先确认网络支持并小额测试，再使用所在地合法的交易服务。',
    ],
    requirements: [
      '发布商品需要逐项付费，支付前以 Builder 实时报价为准。',
      '作品必须原创并满足技术规范与内容审核要求。',
      '法币出金不由 Decentraland 保证，需另行满足当地交易服务 KYC。',
    ],
    risks: [
      '发布费是沉没成本，审核通过也不代表一定有买家。',
      'MANA 价格、桥接、gas 和交易费可能吞掉利润。',
      '存在著作权、钱包授权、私钥和错误网络风险。',
    ],
    sources: [
      {
        label: '创作收入与发布费',
        url: 'https://docs.decentraland.org/faqs/creating-in-decentraland',
      },
      {
        label: '发布审核与销售费用',
        url: 'https://docs.decentraland.org/creator/wearables-and-emotes/publishing-collections/publishing-collections',
      },
      { label: '官方 Marketplace', url: 'https://docs.decentraland.org/marketplace/marketplace' },
    ],
  },
  {
    id: 'the-sandbox',
    name: 'The Sandbox',
    model: '赛事与数字创作 · SAND',
    payout: 'crypto',
    startCost: 'free',
    platforms: 'Windows / macOS / Web',
    availability: '奖励需 18+ · KYC · 活动地区限制',
    summary:
      '通过官方 Season、Event、Contest 领取 SAND/NFT，或用 VoxEdit 创作 Asset 在官方 Marketplace 以 SAND 出售；免费制作不等于免费发布。',
    earningRoutes: ['Season / Event 奖励', '创作赛事', '原创 Asset 销售', 'SAND / NFT'],
    steps: [
      '注册并用免费 VoxEdit / Game Maker 创作，或参加当前官方 Events / Contests。',
      '逐场核对资格、地区、截止时间和反作弊要求，连接官方支持钱包。',
      '领取赛事奖励前在 Account Settings 完成 18+ KYC。',
      '赛事路线从 Claim Rewards 领取；创作路线按 Creator Portal 流程发布并上架。',
      '在钱包核对净收入；法币路径需另走所在地合法交易服务并先小额验证。',
    ],
    requirements: [
      '领取官方赛事或活动奖励必须年满 18 岁并通过 KYC。',
      '每场活动可单独限制地区、名额和资格。',
      '发布可交易 Asset 可能需要 Catalyst、钱包资产或 Creator Portal 权限。',
    ],
    risks: [
      '完成活动不保证得奖，规则与名额会调整。',
      'Asset 可能没有成交，制作和铸造成本可能无法收回。',
      'SAND/NFT 价格、钱包授权、钓鱼领取站和跨链操作风险很高。',
    ],
    sources: [
      { label: 'SAND 与创作销售', url: 'https://docs.sandbox.game/en/owners/sand' },
      { label: '奖励 KYC 与地区要求', url: 'https://docs.sandbox.game/en/accounts/manage/verify-kyc' },
      { label: '官方奖励领取', url: 'https://docs.sandbox.game/en/players/claim-rewards' },
    ],
  },
  {
    id: 'splinterlands',
    name: 'Splinterlands',
    model: '卡牌排位与公会 · SPS / DEC',
    payout: 'crypto',
    startCost: 'low',
    platforms: 'Web / iOS / Android',
    availability: 'Spellbook · 外部钱包 · 当地加密合规',
    summary:
      'Lite Account 可免费试玩；购买 Summoner’s Spellbook 并达到 Bronze 后，排位或公会奖励可获得 SPS，SPS/DEC 可经官方桥转到外部钱包。',
    earningRoutes: ['排位 SPS', '公会奖励', '卡牌经营', 'SPS / DEC 跨链转出'],
    steps: [
      '先用 Lite Account 免费试玩，确认能持续参与排位后再买 Summoner’s Spellbook。',
      '安全备份 Hive keys，配置 Hive Keychain，组建或租赁卡组并打到 Bronze。',
      '按当前排位或公会规则取得 SPS，并记录 Spellbook、租卡和时间成本。',
      '在 token management 选择 Transfer：From In Game，To Base、ETH 或 BSC。',
      '核对钱包、bridge fee 与到账数后签名；法币路径先小额测试支持的交易服务。',
    ],
    requirements: [
      '赚取排位 SPS 需要 Spellbook，并至少达到 Bronze League。',
      '外部交易所出金通常另需 KYC 和所在地支持。',
      '转出时必须正确选择目标链、钱包与代币合约。',
    ],
    risks: [
      'Spellbook 只解锁资格，不保证回本。',
      '卡价、租金、SPS/DEC 价格及奖励公式会变化。',
      '错误链、Hive 密钥泄露、桥合约和低流动性可造成不可逆损失。',
    ],
    sources: [
      {
        label: 'Spellbook 与奖励资格',
        url: 'https://support.splinterlands.com/hc/en-us/articles/8315566452884-What-is-a-Summoner-s-Spellbook',
      },
      {
        label: '免费账号与升级',
        url: 'https://support.splinterlands.com/hc/en-us/articles/13364236814612-Upgrade-Your-Splinterlands-Account',
      },
      {
        label: 'SPS / DEC 官方转出',
        url: 'https://support.splinterlands.com/hc/en-us/articles/7332259241492-Transferring-Tokens-In-and-Out-of-Splinterlands-DEC-SPS-Across-Multiple-Chains',
      },
    ],
  },
  {
    id: 'big-time',
    name: 'Big Time',
    model: '副本掉落与收藏品 · Open Loot',
    payout: 'crypto',
    startCost: 'capital',
    platforms: 'Windows',
    availability: 'Open Loot · KYC/AML · 地区限制',
    summary:
      '游戏本体免费，但主要 BIGTIME 产出通常要求 Hourglass；代币可经 Open Loot 导出到外部钱包，部分掉落或制作 Collectible 可在合作市场交易。',
    earningRoutes: ['BIGTIME 随机掉落', 'Cosmetic Collectible', 'Open Loot 市场', '外部钱包转出'],
    steps: [
      '免费注册 Big Time / Open Loot 并先体验普通副本，确认设备、地区与玩法适合。',
      '严格按预算取得 Hourglass / Cracked Hourglass，或收集合资格 Collectible。',
      '完成杀敌、任务和副本，记录 Hourglass、充能、制作与入场消耗。',
      '在 Open Loot 上架可售 Collectible，或把 BIGTIME 导出到兼容钱包。',
      '按要求完成 KYC/AML；如需法币，使用所在地合法交易服务小额测试后提现。',
    ],
    requirements: [
      'BIGTIME 主要产出需要 Hourglass 或 Cracked Hourglass。',
      'Open Loot 外部提款受 KYC/AML 和受限司法辖区约束。',
      'Time Crystal 是账户绑定货币，不能列作可兑现收入。',
    ],
    risks: [
      'Hourglass 和经济设施带来本金及维护成本，掉落并不稳定。',
      'BIGTIME 与 Collectible 价格可能剧烈波动或缺少流动性。',
      '存在托管、提款等待、KYC 拒绝、假资产和错误钱包风险。',
    ],
    sources: [
      {
        label: 'BIGTIME 掉落与钱包导出',
        url: 'https://wiki.bigtime.gg/big-time-economy/economy-components/resources/usdtime-tokens',
      },
      { label: '免费游戏说明', url: 'https://wiki.bigtime.gg/big-time-getting-started' },
      {
        label: 'Collectible 获取与交易',
        url: 'https://wiki.bigtime.gg/big-time-economy/faq/how-do-i-obtain-digital-collectibles',
      },
      { label: 'Open Loot 合规披露', url: 'https://about.openloot.com/mica-ol-whitepaper' },
    ],
  },
]
