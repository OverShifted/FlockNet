import Variation from './variation'

export default interface Capture {
  name: string
  path: string
  frameCount: number
  hasXPreview: boolean

  variations: Variation[]
  classes?: { name: string; image?: string }[]
}
