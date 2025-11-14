import { NDArray } from './numpy_loader'

function parseColor(color: string): [number, number, number] {
  if (color === 'white') return [255, 255, 255]

  if (color === 'black') return [0, 0, 0]

  const rgbMatch = color.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/)
  if (!rgbMatch) throw new Error('Invalid rgb(...) format: ' + color)

  const [r, g, b] = rgbMatch.slice(1).map(Number)
  return [r, g, b]
}

function mixColors(rgbString1: string, rgbString2: string, factor = 0.5) {
  const [r1, g1, b1] = parseColor(rgbString1)
  const [r2, g2, b2] = parseColor(rgbString2)

  const rOut = r2 * factor + r1 * (1 - factor)
  const gOut = g2 * factor + g1 * (1 - factor)
  const bOut = b2 * factor + b1 * (1 - factor)

  return `rgb(${rOut}, ${gOut}, ${bOut})`
}

function linspace(start: number, stop: number, num: number) {
  if (num === 1) return [start]
  const step = (stop - start) / (num - 1)
  return Array.from({ length: num }, (_, i) => start + step * i)
}

function remap(
  x: number,
  initial_range: [number, number],
  target_range: [number, number],
) {
  const a =
    (target_range[1] - target_range[0]) / (initial_range[1] - initial_range[0])
  return a * (x - initial_range[0]) + target_range[0]
}

function lerpSample(array: NDArray, frame: number, x: number, y: number) {
  const lastFrame = Math.floor(frame)

  const a = array.at(lastFrame, x, y) as number
  if (lastFrame + 1 >= array.shape[0])
    return a
  
  const b = array.at(lastFrame + 1, x, y) as number
  const t = frame - lastFrame

  return a * (1 - t) + b * t
}

export { mixColors, linspace, remap, lerpSample }
