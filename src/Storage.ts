import type Stream from 'stream'
import fs from 'fs/promises'
import type { StoragePath } from './StoragePath'
import type http from 'http'
import type { Meta } from './Meta'

export class Storage {
  constructor(
    private readonly uploadDir: string,
  ) { }

  private async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path)
      return true
    } catch {
      return false
    }
  }

  public async ensureDirectoryExists(
    path: string,
  ): Promise<void> {
    await fs.mkdir(path, { recursive: true })
  }

  public async putStream(
    storagePath: StoragePath,
    req: http.IncomingMessage,
  ): Promise<void> {
    const fullDir = this.uploadDir + storagePath.dir
    const fullDataPath = fullDir + '/data'
    const fullMetaPath = fullDir + '/meta'

    if ((await this.exists(fullDataPath))) {
      throw new Error('File already exists')
    }

    await this.ensureDirectoryExists(fullDir)

    // write metadata file
    const metadata: Meta = {
      created: new Date().toISOString(),
      originalPath: storagePath.originalPath,
      headers: {
        // these are guaranteed to be present,
        // as there are checks in the request handler
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length'],
      },
    }
    await fs.writeFile(fullMetaPath, JSON.stringify(metadata))

    // write data file
    const fd = await fs.open(fullDataPath, 'w')
    return new Promise<void>((resolve, reject) => {
      const writeStream = fd.createWriteStream()
      writeStream.on('error', async (error) => {
        await fd.close()
        reject(error)
      })
      writeStream.on('finish', async () => {
        await fd.close()
        resolve()
      })

      req.pipe(writeStream)
    })
  }

  public async getStream(
    storagePath: StoragePath,
  ): Promise<Stream> {
    const fullDir = this.uploadDir + storagePath.dir
    const fullDataPath = fullDir + '/data'

    if (!(await this.exists(fullDataPath))) {
      throw new Error('File not found')
    }

    const fd = await fs.open(fullDataPath, 'r')
    return fd.createReadStream()
  }

  public async getMeta(
    storagePath: StoragePath,
  ): Promise<Meta> {
    const fullDir = this.uploadDir + storagePath.dir
    const fullMetaPath = fullDir + '/meta'
    console.log('fullMetaPath', fullMetaPath)
    if (!(await this.exists(fullMetaPath))) {
      throw new Error('File not found')
    }

    return JSON.parse(await fs.readFile(fullMetaPath, 'utf-8'))
  }

  public async delete(
    storagePath: StoragePath,
  ): Promise<void> {
    const fullDir = this.uploadDir + storagePath.dir

    if (!(await this.exists(fullDir))) {
      throw new Error('File not found')
    }

    await fs.rmdir(fullDir, { recursive: true })
  }
}
