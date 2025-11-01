import { NumpyLoader, NDArray } from './numpy_loader'
import Variation from './variation'

type Wish = {
  makerId: string
  resolve: (_value: NDArray[] | PromiseLike<NDArray[]>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (_reason?: any) => void
  onProgress: (_percentage: number) => void
}

class Pending {
  xhr: XMLHttpRequest
  wishlist: Wish[]
  progress: number = 0

  constructor(xhr: XMLHttpRequest, wishlist: Wish[]) {
    this.xhr = xhr
    this.wishlist = wishlist
  }

  onProgress(progress: number) {
    this.progress = progress
    this.wishlist.forEach((w) => w.onProgress(progress))
  }

  onResolve(value: NDArray[] | PromiseLike<NDArray[]>) {
    this.wishlist.forEach((w) => w.resolve(value))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onReject(reason?: any) {
    this.wishlist.forEach((w) => w.reject(reason))
  }

  addWish(wish: Wish) {
    this.wishlist.push(wish)
    wish.onProgress(this.progress)
  }
}

// A utility class for downloading and caching NumPy arrays.
class _AssetManager {
  assets: Map<string, NDArray[]>
  pending: Map<string, Pending>

  constructor() {
    this.assets = new Map()
    this.pending = new Map()
  }

  /* eslint @typescript-eslint/no-unused-vars: 0 */
  get(
    requesterId: string,
    variation: Variation,
    basePath: string,
    onLongLoadRequired: () => void,
    onProgress: (_percentage: number) => void,
  ): Promise<NDArray[]> {
    this.revokePendingRequests(requesterId)
    const url = basePath + variation.path

    return new Promise((resolve, reject) => {
      if (this.assets.has(url)) {
        resolve(this.assets.get(url)!)
        return
      }

      onLongLoadRequired()
      const thisWish = { makerId: requesterId, resolve, reject, onProgress }

      if (this.pending.has(url)) {
        this.pending.get(url)!.addWish(thisWish)
        return
      }

      const xhr = new XMLHttpRequest()
      const pending = new Pending(xhr, [])
      this.pending.set(url, pending)
      pending.addWish(thisWish)

      const fail = ((e: object) => {
        pending.onReject(e)
        console.log(e)
        this.pending.delete(url)

        setTimeout(
          () => alert('Could not load data. See console for more information.'),
          400,
        )
      }).bind(this)

      const succeed = (() => {
        const buf = xhr.response
        const ndArrays = NumpyLoader.fromArrayBuffer(buf, variation)
        this.assets.set(url, ndArrays)
        pending.onResolve(ndArrays)
      }).bind(this)

      xhr.addEventListener('load', succeed)
      xhr.addEventListener('error', fail)
      xhr.addEventListener('timeout', fail)

      xhr.addEventListener('progress', (e) => {
        const percentage = e.lengthComputable ? (e.loaded * 100) / e.total : NaN
        console.log(
          `Loaded ${percentage.toFixed(1)}% of ${url} (${e.loaded}/${e.total})`,
        )
        pending.onProgress(percentage)
      })

      xhr.open('GET', url, true)
      xhr.responseType = 'arraybuffer'
      xhr.send(null)
    })
  }

  revokePendingRequests(requesterId: string) {
    this.pending.forEach((pending) => {
      pending.wishlist = pending.wishlist.filter(
        (wish) => wish.makerId != requesterId,
      )

      if (pending.wishlist.length === 0) pending.xhr.abort()
    })

    for (const [url, pending] of this.pending) {
      if (pending.wishlist.length === 0) this.pending.delete(url)
    }
  }
}

const AssetManager = new _AssetManager()
export default AssetManager
