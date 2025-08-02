import { RequestHandler } from './RequestHandler'
import { HttpServer } from './HttpServer'
import { Utility } from './Utility'
import { Storage } from './Storage'
import { Auth } from './Auth'
import config from './Config'

const utility = new Utility()
const storage = new Storage(config.upload.directory)
const auth = new Auth(config.auth.secretToken, config.auth.enabled)
const requestHandler = new RequestHandler(utility, storage, auth)
const server = new HttpServer(requestHandler)

server.listen(config.httpServer.host, config.httpServer.port)
