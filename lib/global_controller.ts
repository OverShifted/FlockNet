import Capture from './capture'
import Visualization from './visualization'

class _GlobalController {
  items: Map<string, Visualization>

  fps: number = 30
  timeDeltaLastTick: number = 0
  time: number = 0
  reactSetTime: ((time: number) => void) | null = null

  capture: Capture | null = null

  isPlaying: boolean = true
  reactSetIsPlaying: ((isPlaying: boolean) => void) | null = null

  classMask: number[] = []

  constructor() {
    this.items = new Map()
  }

  register(id: string, visualization: Visualization) {
    this.items.set(id, visualization)
  }

  unRegister(id: string) {
    this.items.delete(id)
  }

  get(id: string): Visualization | undefined {
    return this.items.get(id)
  }

  get frameCount() {
    return this.capture?.frameCount ?? 0
  }

  tick(deltaTime: number) {
    if (this.isPlaying && this.frameCount) {
      this.items.forEach((item) => item.draw())
      this.timeDeltaLastTick = this.fps * deltaTime
      this.timeDeltaLastTick = Number.isNaN(this.timeDeltaLastTick)
        ? 0
        : this.timeDeltaLastTick
      this.setTime(this.time + this.timeDeltaLastTick)
    }
  }

  setTime(time: number) {
    time %= this.frameCount
    this.time = time
    this.reactSetTime?.(time)

    if (!this.isPlaying) this.items.forEach((item) => item.draw())
  }

  setIsPlaying(isPlaying: boolean) {
    this.isPlaying = isPlaying
    this.reactSetIsPlaying?.(isPlaying)

    // Make sure we render the frame that we settle on
    if (!isPlaying) this.items.forEach((item) => item.draw())
  }

  setClassMask(classMask: number[]) {
    this.classMask = classMask
    this.items.forEach((item) => item.draw())
  }

  correctScaling() {
    this.items.forEach((item) => {
      item.renderer?.correctScaling()
      item.draw()
    })
  }
}

const GlobalController = new _GlobalController()
export default GlobalController

let then = Date.now()

function tick() {
  const now = Date.now()
  const deltaTime = now - then
  then = now

  GlobalController.tick(deltaTime * 0.001)
  requestAnimationFrame(tick)
}

if (typeof window !== 'undefined') {
  requestAnimationFrame(tick)

  window.addEventListener('resize', () => {
    GlobalController.correctScaling()
  })

  window.visualViewport?.addEventListener('resize', () => {
    GlobalController.correctScaling()
  })
}
