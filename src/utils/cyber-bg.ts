// 赛博朋克背景特效工具
export class CyberBackground {
  private container: HTMLElement
  private particles: HTMLElement[] = []
  private digitalRain: HTMLElement[] = []

  constructor(containerSelector: string) {
    this.container = document.querySelector(containerSelector) as HTMLElement
    if (this.container) {
      this.init()
    }
  }

  private init(): void {
    this.createDigitalRain()
    this.createInteractiveParticles()
    this.addMouseMoveEffect()
  }

  // 创建数字雨效果
  private createDigitalRain(): void {
    const rainContainer = document.createElement('div')
    rainContainer.className = 'digital-rain-container'
    rainContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
      overflow: hidden;
    `

    // 创建多个数字雨列
    for (let i = 0; i < 10; i++) {
      const rain = document.createElement('div')
      rain.className = 'digital-rain'
      rain.textContent = this.generateRandomText()
      rain.style.left = `${Math.random() * 100}%`
      rain.style.animationDelay = `${Math.random() * 10}s`
      rain.style.animationDuration = `${5 + Math.random() * 10}s`
      rainContainer.appendChild(rain)
      this.digitalRain.push(rain)
    }

    this.container.appendChild(rainContainer)
  }

  // 生成随机二进制文本
  private generateRandomText(length: number = 20): string {
    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  // 创建交互式粒子
  private createInteractiveParticles(): void {
    const particleContainer = document.createElement('div')
    particleContainer.className = 'interactive-particles'
    particleContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 6;
    `

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div')
      particle.className = 'cyber-particle'
      particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: #4c6ef5;
        box-shadow: 0 0 6px #4c6ef5;
        image-rendering: pixelated;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatParticle ${3 + Math.random() * 4}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
      `
      particleContainer.appendChild(particle)
      this.particles.push(particle)
    }

    this.container.appendChild(particleContainer)
  }

  // 添加鼠标移动效果
  private addMouseMoveEffect(): void {
    this.container.addEventListener('mousemove', (e) => {
      this.createRipple(e.clientX, e.clientY)
    })
  }

  // 创建波纹效果
  private createRipple(x: number, y: number): void {
    const ripple = document.createElement('div')
    ripple.className = 'pixel-wave'
    ripple.style.cssText = `
      left: ${x - 10}px;
      top: ${y - 10}px;
      width: 20px;
      height: 20px;
    `

    this.container.appendChild(ripple)

    // 移除波纹
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 2000)
  }

  // 创建故障效果
  public createGlitch(): void {
    const glitch = document.createElement('div')
    glitch.className = 'glitch-overlay'
    glitch.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(76, 110, 245, 0.1);
      z-index: 1000;
      pointer-events: none;
      animation: glitchFlash 0.3s ease-out;
    `

    this.container.appendChild(glitch)

    setTimeout(() => {
      if (glitch.parentNode) {
        glitch.parentNode.removeChild(glitch)
      }
    }, 300)
  }

  // 清理资源
  public cleanup(): void {
    this.particles.forEach((p) => {
      if (p.parentNode) {
        p.parentNode.removeChild(p)
      }
    })
    this.digitalRain.forEach((d) => {
      if (d.parentNode) {
        d.parentNode.removeChild(d)
      }
    })
    this.particles = []
    this.digitalRain = []
  }
}

// 故障闪烁动画
const style = document.createElement('style')
style.textContent = `
  @keyframes glitchFlash {
    0% { opacity: 0; }
    50% { opacity: 1; background: rgba(76, 110, 245, 0.2); }
    100% { opacity: 0; }
  }
  
  @keyframes floatParticle {
    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
  }
  
  .cyber-particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: #4c6ef5;
    box-shadow: 0 0 6px #4c6ef5;
    image-rendering: pixelated;
  }
`
document.head.appendChild(style)

// 随机触发故障效果
setInterval(() => {
  if (Math.random() > 0.8) {
    const bg = new CyberBackground('.cyber-background')
    bg.createGlitch()
  }
}, 5000)

export default CyberBackground
