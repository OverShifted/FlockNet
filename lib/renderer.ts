import GlobalController from './global_controller'
import { NDArray } from './numpy_loader'
import Variation from './variation'

function remap(
  x: number,
  initial_range: [number, number],
  target_range: [number, number],
) {
  const a =
    (target_range[1] - target_range[0]) / (initial_range[1] - initial_range[0])
  return a * (x - initial_range[0]) + target_range[0]
}

function hex2rgb(hex: string, opacity: number | undefined = undefined) {
  hex = hex.trim()
  hex = hex[0] === '#' ? hex.substring(1) : hex
  const bigint = parseInt(hex, 16)
  const h = []
  if (hex.length === 3) {
    h.push((bigint >> 4) & 255)
    h.push((bigint >> 2) & 255)
  } else {
    h.push((bigint >> 16) & 255)
    h.push((bigint >> 8) & 255)
  }
  h.push(bigint & 255)
  if (opacity !== undefined) {
    h.push(opacity)
    return 'rgba(' + h.join() + ')'
  } else {
    return 'rgb(' + h.join() + ')'
  }
}

function bodyBg() {
  const bodyBg = window.getComputedStyle(document.body, null).backgroundColor
  return bodyBg[0] === '#' ? hex2rgb(bodyBg) : bodyBg
}

export default class Renderer {
  // Holds the currently chosen variation data which is asynchronously
  // loaded by AssetManager
  array: NDArray[]
  variation: Variation
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  constructor(
    array: NDArray[],
    variation: Variation,
    canvas: HTMLCanvasElement,
  ) {
    this.array = array
    this.variation = variation
    this.canvas = canvas
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    this.correctScaling()
  }

  // setArray(array: NDArray[], variation: Variation) {
  //     this.array = array
  //     this.variation = variation
  // }

  render(
    frame: number,
    channel_id: number,
    radius: number,
    colormap: string[],
    tailMode: boolean,
    taTailMode: boolean,
    tailFalloff: number,
    isPlaying: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fraction: number,
  ) {
    if (!(tailMode && frame != 0)) this.clear()

    const array = this.array[channel_id]
    const [xBounds, yBounds] = this.variation.channels[channel_id].bounds

    if (tailMode && isPlaying) {
      this.ctx.beginPath()
      this.ctx.rect(0, 0, this.canvas.width, this.canvas.height)

      this.ctx.fillStyle = bodyBg()
        .replace('rgb', 'rgba')
        .replace(')', `,${tailFalloff}%)`)
      this.ctx.fill()
    }

    function getMaskedColor(mask: number, colorid: number) {
      if (mask === undefined || mask > 0.5) return colormap[colorid]
      else
        return colormap[colorid].replace(
          /(,\s*\d*%)?\)/g,
          `,${1000 / array.shape[1]}%)`,
        )
    }

    if (!tailMode)
      for (let i = 0; i < array.shape[1]; i++) {
        const x = remap(array.at(frame, i, 0) as number, xBounds, [0, 1])
        const y = remap(array.at(frame, i, 1) as number, yBounds, [0, 1])

        // const classCount = GlobalController.capture?.classes?.length ?? 10
        const classid = this.array[this.array.length - 1].data[i] as number
        // const colorid = classid * 9 / (classCount - 1)
        const colorid = classid
        const mask = GlobalController.classMask[classid]

        this._drawCircle(x, y, radius, getMaskedColor(mask, colorid))
      }
    else
      for (let i = 0; i < array.shape[1]; i++) {
        const ax = remap(array.at(frame - 1, i, 0) as number, xBounds, [0, 1])
        const ay = remap(array.at(frame - 1, i, 1) as number, yBounds, [0, 1])

        const bx = remap(array.at(frame, i, 0) as number, xBounds, [0, 1])
        const by = remap(array.at(frame, i, 1) as number, yBounds, [0, 1])
        const classid = this.array[this.array.length - 1].data[i] as number
        const colorid = classid
        const mask = GlobalController.classMask[classid]

        const maskedColor = getMaskedColor(mask, colorid)

        this._drawLine([ax, ay], [bx, by], radius * 2, maskedColor)
        if (taTailMode) this._drawCircle(bx, by, radius, maskedColor)
      }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  _drawCircle(centerX: number, centerY: number, radius: number, color: string) {
    this.ctx.beginPath()
    this.ctx.arc(
      centerX * this.canvas.width,
      centerY * this.canvas.height,
      (radius * this.canvas.width) / 512,
      0,
      2 * Math.PI,
      false,
    )
    this.ctx.fillStyle = color
    this.ctx.fill()
  }

  _drawLine(
    a: [number, number],
    b: [number, number],
    width: number,
    color: string,
  ) {
    this.ctx.beginPath()
    this.ctx.moveTo(a[0] * this.canvas.width, a[1] * this.canvas.height)
    this.ctx.lineTo(b[0] * this.canvas.width, b[1] * this.canvas.height)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = (width * this.canvas.width) / 512
    this.ctx.stroke()
  }

  correctScaling() {
    const ratio = window.devicePixelRatio * (window.visualViewport?.scale ?? 1)
    this.canvas.width = this.canvas.clientWidth * ratio
    this.canvas.height = this.canvas.clientWidth * ratio
  }
}
