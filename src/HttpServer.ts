import http from 'http'
import type { RequestHandler } from './RequestHandler'

export class HttpServer {
  private readonly server: http.Server

  constructor(
    private requestHandler: RequestHandler,
  ) {
    this.server = http.createServer(this.requestListener.bind(this))
  }

  private requestListener(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>): void {
    console.log(req.method + ' ' + req.url)

    this.requestHandler.onRequest(req, res).catch(reason => {
      console.error(`Error handling ${req.method} request:`, reason)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error\n')
    })
  }

  public listen(host: string, port: number): void {
    this.server.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}/`)
    })
  }
}
