import type { BloggerData, StockMention } from '@/types'

// 股票识别词典
const stockDictionary: Record<string, StockMention> = {
  // A 股
  '贵州茅台': { stockCode: '600519', stockName: '贵州茅台', market: 'A 股', confidence: 0.95 },
  '茅台': { stockCode: '600519', stockName: '贵州茅台', market: 'A 股', confidence: 0.85 },
  '五粮液': { stockCode: '000858', stockName: '五粮液', market: 'A 股', confidence: 0.95 },
  '宁德时代': { stockCode: '300750', stockName: '宁德时代', market: 'A 股', confidence: 0.95 },
  '宁德': { stockCode: '300750', stockName: '宁德时代', market: 'A 股', confidence: 0.75 },
  '比亚迪': { stockCode: '002594', stockName: '比亚迪', market: 'A 股', confidence: 0.95 },
  '平安银行': { stockCode: '000001', stockName: '平安银行', market: 'A 股', confidence: 0.90 },
  '招商银行': { stockCode: '600036', stockName: '招商银行', market: 'A 股', confidence: 0.90 },
  '中国平安': { stockCode: '601318', stockName: '中国平安', market: 'A 股', confidence: 0.90 },
  
  // 港股
  '腾讯': { stockCode: '00700', stockName: '腾讯控股', market: '港股', confidence: 0.90 },
  '腾讯控股': { stockCode: '00700', stockName: '腾讯控股', market: '港股', confidence: 0.95 },
  '阿里巴巴': { stockCode: '09988', stockName: '阿里巴巴', market: '港股', confidence: 0.95 },
  '阿里': { stockCode: '09988', stockName: '阿里巴巴', market: '港股', confidence: 0.80 },
  '美团': { stockCode: '03690', stockName: '美团', market: '港股', confidence: 0.95 },
  '小米': { stockCode: '01810', stockName: '小米集团', market: '港股', confidence: 0.90 },
  '小米集团': { stockCode: '01810', stockName: '小米集团', market: '港股', confidence: 0.95 },
  
  // 美股
  '苹果': { stockCode: 'AAPL', stockName: 'Apple Inc.', market: '美股', confidence: 0.90 },
  'AAPL': { stockCode: 'AAPL', stockName: 'Apple Inc.', market: '美股', confidence: 0.95 },
  '特斯拉': { stockCode: 'TSLA', stockName: 'Tesla Inc.', market: '美股', confidence: 0.95 },
  'TSLA': { stockCode: 'TSLA', stockName: 'Tesla Inc.', market: '美股', confidence: 0.95 },
  '英伟达': { stockCode: 'NVDA', stockName: 'NVIDIA Corporation', market: '美股', confidence: 0.95 },
  'NVDA': { stockCode: 'NVDA', stockName: 'NVIDIA Corporation', market: '美股', confidence: 0.95 },
  '微软': { stockCode: 'MSFT', stockName: 'Microsoft Corporation', market: '美股', confidence: 0.95 },
  'MSFT': { stockCode: 'MSFT', stockName: 'Microsoft Corporation', market: '美股', confidence: 0.95 },
  '谷歌': { stockCode: 'GOOGL', stockName: 'Alphabet Inc.', market: '美股', confidence: 0.90 },
  'GOOGL': { stockCode: 'GOOGL', stockName: 'Alphabet Inc.', market: '美股', confidence: 0.95 },
  '亚马逊': { stockCode: 'AMZN', stockName: 'Amazon.com Inc.', market: '美股', confidence: 0.95 },
  'AMZN': { stockCode: 'AMZN', stockName: 'Amazon.com Inc.', market: '美股', confidence: 0.95 },
}

// 博主配置
export const bloggers: BloggerData[] = [
  {
    blogger: {
      id: 'youtube-henryslowfire',
      name: 'HenrySlowFIRE',
      platform: 'youtube',
      url: 'https://www.youtube.com/@HenrySlowFIRE/videos',
      userId: '@HenrySlowFIRE'
    },
    contents: [
      {
        id: 'yt-001',
        bloggerId: 'youtube-henryslowfire',
        title: '2024 年美股科技股投资策略分析',
        content: '今天我们来聊聊美股科技股的投资机会。首先说说英伟达 NVDA，这家公司在 AI 芯片领域的领先地位无可撼动。另外，特斯拉 TSLA 在电动车市场的表现也值得关注。苹果公司 AAPL 的最新财报显示其服务业务增长强劲。',
        publishDate: '2024-03-05',
        url: 'https://www.youtube.com/watch?v=example1',
        type: 'video',
        platform: 'youtube',
        stocks: []
      },
      {
        id: 'yt-002',
        bloggerId: 'youtube-henryslowfire',
        title: 'A 股白酒板块深度分析',
        content: '白酒板块一直是我的重仓方向。贵州茅台作为行业龙头，护城河非常深。五粮液的估值相对合理，也有不错的投资价值。',
        publishDate: '2024-03-01',
        url: 'https://www.youtube.com/watch?v=example2',
        type: 'video',
        platform: 'youtube',
        stocks: []
      }
    ]
  },
  {
    blogger: {
      id: 'xiaohongshu-user',
      name: '小红书博主',
      platform: 'xiaohongshu',
      url: 'https://www.xiaohongshu.com/user/profile/61ba0abd0000000010008ffa',
      userId: '61ba0abd0000000010008ffa'
    },
    contents: [
      {
        id: 'xhs-001',
        bloggerId: 'xiaohongshu-user',
        title: '我的港股投资心得',
        content: '分享下我的港股持仓：腾讯控股是我的第一大重仓，长期看好其游戏和社交业务。美团在本地生活服务的优势明显。小米集团的生态链模式很有特色。',
        publishDate: '2024-03-06',
        url: 'https://www.xiaohongshu.com/discovery/item/example1',
        type: 'article',
        platform: 'xiaohongshu',
        stocks: []
      },
      {
        id: 'xhs-002',
        bloggerId: 'xiaohongshu-user',
        title: '新能源车产业链投资机会',
        content: '新能源车赛道我主要关注比亚迪和宁德时代。比亚迪的垂直整合能力很强，宁德在电池领域的市占率领先。',
        publishDate: '2024-03-03',
        url: 'https://www.xiaohongshu.com/discovery/item/example2',
        type: 'article',
        platform: 'xiaohongshu',
        stocks: []
      }
    ]
  },
  {
    blogger: {
      id: 'wechat-poor-finance',
      name: '所有的烦恼都源于你穷',
      platform: 'wechat',
      url: 'https://mp.weixin.qq.com/s/a63aQFbWTtnMe3aSo1qp6A',
      accountName: '所有的烦恼都源于你穷'
    },
    contents: [
      {
        id: 'wx-001',
        bloggerId: 'wechat-poor-finance',
        title: '为什么你应该关注 A 股核心资产',
        content: '核心资产指的是那些具有持续竞争优势的公司。比如贵州茅台，它的品牌价值无法复制。招商银行在零售银行领域的优势也很明显。中国平安虽然近期表现一般，但长期价值仍在。',
        publishDate: '2024-03-04',
        url: 'https://mp.weixin.qq.com/s/a63aQFbWTtnMe3aSo1qp6A',
        type: 'article',
        platform: 'wechat',
        stocks: []
      },
      {
        id: 'wx-002',
        bloggerId: 'wechat-poor-finance',
        title: '2024 年投资策略：布局中国核心资产',
        content: '今年我的策略是聚焦核心资产。白酒首选茅台和五粮液，金融股看好招商银行和平安银行，新能源看比亚迪和宁德时代。',
        publishDate: '2024-02-28',
        url: 'https://mp.weixin.qq.com/s/example2',
        type: 'article',
        platform: 'wechat',
        stocks: []
      }
    ]
  }
]

// 识别内容中的股票
function extractStocks(content: string): StockMention[] {
  const mentionedStocks: Map<string, StockMention> = new Map()
  
  // 按关键词长度排序，优先匹配长关键词（更具体）
  const sortedKeywords = Object.keys(stockDictionary).sort((a, b) => b.length - a.length)
  
  for (const keyword of sortedKeywords) {
    if (content.includes(keyword)) {
      const stock = stockDictionary[keyword]
      if (!stock) continue // 跳过未定义的情况
      
      // 如果已存在相同股票，取置信度高的
      if (!mentionedStocks.has(stock.stockCode) || 
          (mentionedStocks.get(stock.stockCode)?.confidence ?? 0) < stock.confidence) {
        mentionedStocks.set(stock.stockCode, stock)
      }
    }
  }
  
  return Array.from(mentionedStocks.values())
}

// 获取处理后的博主数据（自动识别股票）
export function getBloggerData(): BloggerData[] {
  return bloggers.map(bloggerData => ({
    blogger: bloggerData.blogger,
    contents: bloggerData.contents.map(content => ({
      ...content,
      stocks: extractStocks(content.content + ' ' + content.title)
    }))
  }))
}

// 获取所有提及的股票统计
export function getStockStatistics(): Record<string, number> {
  const stats: Record<string, number> = {}
  const data = getBloggerData()
  
  data.forEach(bloggerData => {
    bloggerData.contents.forEach(content => {
      content.stocks.forEach(stock => {
        const key = `${stock.market}-${stock.stockCode}`
        stats[key] = (stats[key] || 0) + 1
      })
    })
  })
  
  return stats
}
