import AssetManager from './asset_manager'
import { Controller } from './controller'
import { NDArray } from './numpy_loader'
import Renderer from './renderer'
import { lerpSample, remap } from './utils'
import Variation from './variation'

interface MouseCollision {
  sampleIdx: number
  sampleX: number
  sampleY: number

  mouseX: number
  mouseY: number
}

class Visualization {
  id: string

  // Pending or loaded
  variation: Variation | null = null
  canvas: HTMLCanvasElement
  renderer: Renderer | null = null
  controller: Controller

  reactSetIsLoading: (_isLoading: boolean) => void
  reactSetLoadPercentage: (_percentage: number) => void
  reactSetMouseCollision: (_collision: MouseCollision | null) => void

  channel: number
  colorMap: string[]
  renderStyle: string
  tailFalloff: number
  radius: number
  opacity: number
  fraction: number

  colorMapWithTransparency: string[]

  hoveredSampleIdx: number | null = null

  mouseMoveListener: (_e: MouseEvent) => void
  mouseX: number = -1
  mouseY: number = -1

  constructor(
    id: string,
    canvas: HTMLCanvasElement,
    controller: Controller,
    reactSetIsLoading: (_isLoading: boolean) => void,
    reactSetLoadPercentage: (_percentage: number) => void,
    reactSetMouseCollision: (_collision: MouseCollision | null) => void,
    options: {
      channel: number
      colorMap: string[]
      renderStyle: string
      tailFalloff: number
      radius: number
      opacity: number
      fraction: number
    },
  ) {
    this.id = id
    this.canvas = canvas
    this.controller = controller

    this.reactSetIsLoading = reactSetIsLoading
    this.reactSetLoadPercentage = reactSetLoadPercentage
    this.reactSetMouseCollision = reactSetMouseCollision

    this.channel = options.channel
    this.colorMap = options.colorMap
    this.renderStyle = options.renderStyle
    this.tailFalloff = options.tailFalloff
    this.radius = options.radius
    this.opacity = options.opacity
    this.fraction = options.fraction

    this.colorMapWithTransparency = []
    this.buildColorMapWithTransparency()

    this.mouseMoveListener = (event) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      this.mouseX = x
      this.mouseY = y

      const collision = this.getHoveredSample()
      this.hoveredSampleIdx = collision?.sampleIdx ?? null
      reactSetMouseCollision(collision)
      // reactSetMouseCollision({
      //   sampleIdx: collision?.sampleIdx ?? -1,
      //   mouseX: x,
      //   mouseY: y,

      //   sampleX: x,
      //   sampleY: y,
      // })

      this.draw()
    }

    this.canvas.addEventListener(
      Visualization._pointerEventType(),
      this.mouseMoveListener,
    )
  }

  shutdown() {
    this.canvas.removeEventListener(
      Visualization._pointerEventType(),
      this.mouseMoveListener,
    )
  }

  static _pointerEventType() {
    return window.PointerEvent ? 'pointermove' : 'mousemove'
  }

  _setArray(array: NDArray[], variation: Variation) {
    this.renderer = new Renderer(array, variation, this.canvas, this.controller)
    this.variation = variation
    this.draw()
  }

  setVariation(variation: Variation, basePath: string) {
    this.renderer?.clear()
    this.renderer = null

    AssetManager.get(
      this.id,
      variation,
      basePath,
      () => {
        this.reactSetIsLoading(true)
      },
      (percentage) => {
        this.reactSetLoadPercentage(percentage)
      },
    )
      .then((ndArrays) => {
        this._setArray(ndArrays, variation)
      })
      .finally(() => {
        this.reactSetIsLoading(false)
      })
  }

  setChannel(channel: number) {
    this.channel = channel
    this.draw()
  }

  setColorMap(colorMap: string[]) {
    this.colorMap = colorMap
    this.buildColorMapWithTransparency()
    this.draw()
  }

  setRenderStyle(renderStyle: string) {
    this.renderStyle = renderStyle
    this.draw()
  }

  setTailFalloff(tailFalloff: number) {
    this.tailFalloff = tailFalloff
    this.draw()
  }

  setRadius(radius: number) {
    this.radius = radius
    this.draw()
  }

  setOpacity(opacity: number) {
    this.opacity = opacity
    this.buildColorMapWithTransparency()
    this.draw()
  }

  setFraction(fraction: number) {
    this.fraction = fraction
    this.draw()
  }

  buildColorMapWithTransparency() {
    this.colorMapWithTransparency = this.colorMap.map((color) =>
      color.replace('rgb', 'rgba').replace(')', `,${this.opacity}%)`),
    )
  }

  draw(time: number = this.controller.time) {
    this.renderer?.render(
      time,
      this.channel,
      this.radius,
      this.colorMapWithTransparency,
      this.renderStyle.endsWith('tail'),
      this.renderStyle == 'lines-tail',
      this.tailFalloff,
      this.controller.isPlaying,
      this.fraction,
      this.controller.capture?.hasXPreview ? this.hoveredSampleIdx : null,
    )
  }

  _distance2WithMouse(x: number, y: number) {
    return Math.pow(x - this.mouseX, 2) + Math.pow(y - this.mouseY, 2)
  }

  getHoveredSample(): MouseCollision | null {
    const array = this.renderer?.array[this.channel]
    if (!array || !this.variation) return null

    const [xBounds, yBounds] = this.variation.channels[this.channel].bounds
    const radius2 = Math.pow(this.radius, 2)
    let closest = {
      dist2: Infinity,
      sampleIdx: 0,
      sampleX: 0,
      sampleY: 0,

      mouseX: this.mouseX,
      mouseY: this.mouseY,
    }

    for (let i = array.shape[1] - 1; i >= 0; i--) {
      const x = remap(
        lerpSample(array, this.controller.time, i, 0) as number,
        xBounds,
        [0, this.canvas.getBoundingClientRect().width],
      )
      const y = remap(
        lerpSample(array, this.controller.time, i, 1) as number,
        yBounds,
        [0, this.canvas.getBoundingClientRect().height],
      )

      const distance2 = this._distance2WithMouse(x, y)

      if (distance2 <= radius2)
        return {
          sampleIdx: i,
          sampleX: x,
          sampleY: y,

          mouseX: this.mouseX,
          mouseY: this.mouseY,
        }

      if (distance2 < closest.dist2) {
        closest.dist2 = distance2

        closest.sampleIdx = i
        closest.sampleX = x
        closest.sampleY = y
      }
    }

    if (closest.dist2 < radius2 * Math.pow(7, 2))
      return closest

    return null
  }
}

export { Visualization }
export type { MouseCollision }
