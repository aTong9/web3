// 中文字体检测工具
export const hasChinese = (text: string): boolean => {
  // 检测中文字符的正则表达式
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/
  return chineseRegex.test(text)
}

// 自动为元素添加中文字体类
export const addChineseClass = (element: HTMLElement): void => {
  const text = element.textContent || ''
  if (hasChinese(text)) {
    element.classList.add('has-chinese')
  }
}

// 为页面中的所有元素自动检测并添加中文字体类
export const initChineseFont = (): void => {
  try {
    const elements = document.querySelectorAll(
      'h1, h2, h3, p, button, .link-title, .link-description',
    )
    elements.forEach((element) => {
      addChineseClass(element as HTMLElement)
    })
  } catch (error) {
    console.warn('中文字体初始化失败:', error)
  }
}

// 根据内容动态选择字体类
export const getFontClass = (text: string): string => {
  if (hasChinese(text)) {
    const hasEnglish = /[a-zA-Z]/.test(text)
    if (hasEnglish) {
      return 'mixed-pixel chinese-pixel'
    } else {
      return 'chinese-pixel mixed-pixel'
    }
  } else {
    return 'pixel-font'
  }
}

// 字体加载状态管理
export class FontLoader {
  private static instance: FontLoader
  private fontsLoaded = new Set<string>()

  static getInstance(): FontLoader {
    if (!FontLoader.instance) {
      FontLoader.instance = new FontLoader()
    }
    return FontLoader.instance
  }

  async loadFont(fontName: string, src: string): Promise<void> {
    try {
      if (this.fontsLoaded.has(fontName)) {
        return
      }

      // 检查字体文件是否存在
      const response = await fetch(src, { method: 'HEAD' })
      if (!response.ok) {
        console.warn(`字体文件不存在: ${src}`)
        return
      }

      const font = new FontFace(fontName, `url(${src})`)
      await font.load()
      document.fonts.add(font)
      this.fontsLoaded.add(fontName)
      console.log(`字体加载成功: ${fontName}`)
    } catch (error) {
      console.error(`字体加载失败 ${fontName}:`, error)
    }
  }

  async loadAllFonts(): Promise<void> {
    const fontConfigs = [
      { name: 'Press Start 2P', src: '/assets/fonts/PressStart2P-Regular.woff2' },
      { name: 'VT323', src: '/assets/fonts/VT323-Regular.woff2' },
      { name: 'ZCOOL KuaiLe', src: '/assets/fonts/ZCOOLKuaiLe-Regular.woff2' },
    ]

    try {
      await Promise.allSettled(fontConfigs.map((config) => this.loadFont(config.name, config.src)))

      // 字体加载完成后移除loading类
      document.body.classList.remove('font-loading')
      document.body.classList.add('font-loaded')
    } catch (error) {
      console.error('批量字体加载失败:', error)
    }
  }
}

export default FontLoader
