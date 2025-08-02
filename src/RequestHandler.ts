import type http from 'http'
import type { Utility } from './Utility'
import type { Storage } from './Storage'
import type { Auth } from './Auth'

export class RequestHandler {
  constructor(
    private readonly utility: Utility,
    private readonly storage: Storage,
    private readonly auth: Auth,
  ) { }

  public async onRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse<http.IncomingMessage>,
  ): Promise<void> {
    const method = req.method?.toUpperCase()
    switch (method) {
      case 'HEAD':
        return await this.onHead(req, res)
      case 'PUT':
        return await this.onPut(req, res)
      case 'GET':
        return await this.onGet(req, res)
      case 'DELETE':
        return await this.onDelete(req, res)
      default:
        return this.respond(res, 405, 'Method Not Allowed')
    }
  }

  public async onHead(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>): Promise<void> {
    // Retrieve file metadata
    // - if the file exists, return 200 OK with metadata in response headers
    // - if the file does not exist, return 404 Not Found

    // head requests do not require AUTH

    const storagePath = this.utility.getStoragePathFromUrlPath(req.url || '')
    try {
      const meta = await this.storage.getMeta(storagePath)
      res.writeHead(200, {
        'meta-headers-content-type': String(meta?.headers.contentType || 'application/octet-stream'),
        'meta-headers-content-length': String(meta?.headers.contentLength || 0),
        'meta-created': meta?.created || '',
        'meta-original-path': meta?.originalPath || '',
      })
      res.write('') // Write an empty body to satisfy HEAD request
      res.end() // End the response without sending the body
    } catch (error) {
      if (error.message === 'File not found') {
        return this.respond(res, 404, 'File not found')
      } else {
        console.error('Error during metadata retrieval:', error)
        return this.respond(res, 500, 'Internal Server Error')
      }
    }
  }

  public async onPut(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>): Promise<void> {
    // File upload
    // - if the put file already exists, return 409 Conflict
    // - if the put file does not exist, create it and return 201 Created

    // put requests require AUTH
    if (!this.auth.isAuthenticated(req)) {
      return this.respond(res, 401, 'Unauthorized')
    }

    if (!req.headers['content-type']) {
      return this.respond(res, 400, 'Bad Request: Content-Type header is required')
    }

    if (!req.headers['content-length'] || req.headers['content-length'] === '0') {
      return this.respond(res, 400, 'Bad Request: Content-Length header is required')
    }

    const storagePath = this.utility.getStoragePathFromUrlPath(req.url || '')
    try {
      await this.storage.putStream(storagePath, req)
      return this.respond(res, 201, 'File created')
    } catch (error) {
      if (error.message === 'File already exists') {
        return this.respond(res, 409, 'File already exists')
      } else {
        console.error('Error during file upload:', error)
        return this.respond(res, 500, 'Internal Server Error')
      }
    }
  }

  public async onGet(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>): Promise<void> {

    // Retrieve file
    // - if the file exists, return it with 200 OK
    // - if the file does not exist, return 404 Not Found

    // get requests do not require AUTH

    const storagePath = this.utility.getStoragePathFromUrlPath(req.url || '')
    try {
      const fileStream = await this.storage.getStream(storagePath)
      const meta = await this.storage.getMeta(storagePath)
      res.writeHead(200, {
        'Content-Type': String(meta?.headers.contentType || 'application/octet-stream'),
        'Content-Length': String(meta?.headers.contentLength || 0),
      })
      fileStream.pipe(res)
    } catch (error) {
      if (error.message === 'File not found') {
        return this.respond(res, 404, 'File not found')
      } else {
        console.error('Error during file retrieval:', error)
        return this.respond(res, 500, 'Internal Server Error')
      }
    }
  }

  public async onDelete(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>): Promise<void> {
    // Delete file
    // - if the file exists, delete it and return 204 No Content
    // - if the file does not exist, return 404 Not Found

    // delete requests require AUTH
    if (!this.auth.isAuthenticated(req)) {
      return this.respond(res, 401, 'Unauthorized')
    }

    const storagePath = this.utility.getStoragePathFromUrlPath(req.url || '')
    try {
      await this.storage.delete(storagePath)
      return this.respond(res, 204, 'File deleted')
    } catch (error) {
      if (error.message === 'File not found') {
        return this.respond(res, 404, 'File not found')
      } else {
        console.error('Error during file deletion:', error)
        return this.respond(res, 500, 'Internal Server Error')
      }
    }
  }

  private respond(
    res: http.ServerResponse<http.IncomingMessage>,
    statusCode: number,
    message: string,
  ): void {
    res.writeHead(statusCode, { 'Content-Type': 'text/plain' })
    res.end(message + '\n')
  }
}
