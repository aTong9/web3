import type { NavTaxonomy } from '@/types'
import { load } from 'js-yaml'
import webstackData from '@/data/webstack.yml?raw'

export const navigationData = load(webstackData) as NavTaxonomy[]
