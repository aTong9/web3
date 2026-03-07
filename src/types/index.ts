export interface NavLink {
  title: string
  logo: string
  url: string
  description?: string
}

export interface NavTerm {
  term: string
  links: NavLink[]
}

export interface NavTaxonomy {
  taxonomy: string
  icon: string
  list: NavTerm[]
}

export interface SiteConfig {
  title: string
  description: string
  author: string
  siteurl: string
  upload?: string
  about?: string
  repository?: string
  enablePreLoad?: boolean
  textPreLoad?: string
  expandSidebar?: boolean
  logosPath?: string
  defaultLogo?: string
}

// 博主监控相关类型定义
export interface BloggerInfo {
  id: string
  name: string
  platform: 'youtube' | 'xiaohongshu' | 'wechat'
  url: string
  userId?: string
  accountName?: string
}

export interface StockMention {
  stockCode: string
  stockName: string
  market: 'A 股' | '港股' | '美股'
  confidence: number // 提及的可信度 0-1
}

export interface ContentItem {
  id: string
  bloggerId: string
  title: string
  content: string
  publishDate: string
  url: string
  type: 'article' | 'video'
  platform: 'youtube' | 'xiaohongshu' | 'wechat'
  stocks: StockMention[]
}

export interface BloggerData {
  blogger: BloggerInfo
  contents: ContentItem[]
}
