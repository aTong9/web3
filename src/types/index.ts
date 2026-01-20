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
