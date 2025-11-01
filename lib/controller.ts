import Capture from './capture'
import Visualization from './visualization'

// Manages the playback of a group of Visualization instances
class Controller {
  static instances: Controller[] = []

  items: Map<string, Visualization>

  fps: number = 30
  timeDeltaLastTick: number = 0
  time: number = 0
  reactSetTime: ((_time: number) => void) | null = null

  capture: Capture | null = null

  isPlaying: boolean = true
  reactSetIsPlaying: ((_isPlaying: boolean) => void) | null = null

  classMask: number[] = []

  constructor() {
    Controller.instances.push(this)
    this.items = new Map()
  }

  static removeInstance(instance: Controller) {
    const index = Controller.instances.indexOf(instance)
    if (index > -1) Controller.instances.splice(index, 1)
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

// The default instance used in the "playground"
const globalController = new Controller()
export { Controller, globalController }

let then = Date.now()

function tick() {
  const now = Date.now()
  const deltaTime = now - then
  then = now

  // console.log(Controller.instances)
  Controller.instances.map((c) => c.tick(deltaTime * 0.001))
  requestAnimationFrame(tick)
}

if (typeof window !== 'undefined') {
  requestAnimationFrame(tick)

  const correctScaling = () =>
    Controller.instances.map((c) => c.correctScaling())
  window.addEventListener('resize', correctScaling)
  window.visualViewport?.addEventListener('resize', correctScaling)
}
