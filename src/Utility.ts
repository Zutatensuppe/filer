import { Md5 } from 'ts-md5'
import type { StoragePath } from './StoragePath'

export class Utility {
  public getStoragePathFromUrlPath(
    urlPath: string,
  ): StoragePath {
    const hash = this.hashString(urlPath)
    const dir = '/' + hash.substring(0, 2) +
      '/' + hash.substring(2, 4) +
      '/' + hash.substring(4, 6) +
      '/' + hash.substring(6)
    return { dir, originalPath: urlPath }
  }

  public hashString(str: string): string {
    return Md5.hashStr(str)
  }
}
