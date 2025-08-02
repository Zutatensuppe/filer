import type http from 'http'

export class Auth {
  constructor(
    private readonly secretToken: string,
    private readonly enabled: boolean,
  ) { }

  public isAuthenticated(req: http.IncomingMessage): boolean {
    if (!this.enabled) {
      return true // Authentication is disabled
    }

    const authHeader = req.headers['authorization']
    if (!authHeader) {
      return false
    }
    return authHeader === `Bearer ${this.secretToken}`
  }
}
