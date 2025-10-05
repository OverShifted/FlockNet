import Variation from './variation'

export default interface Capture {
  name: string
  path: string
  frameCount: number

  variations: Variation[]
  classes?: { name: string; image?: string }[]
}
