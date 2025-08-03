import { RequestHandler } from './RequestHandler'
import { HttpServer } from './HttpServer'
import { Utility } from './Utility'
import { Storage } from './Storage'
import { Auth } from './Auth'
import config from './Config'

//     _______
//    //_   _ \\
//   || o ..o_||
//   ||   ____(O)
//   \\______//
//     /_X_\
//
// 見えそうで見えない
//
// Comment added during para stream as result of viewer reward for duke
// 2025-08-03


const utility = new Utility()
const storage = new Storage(config.upload.directory)
const auth = new Auth(config.auth.secretToken, config.auth.enabled)
const requestHandler = new RequestHandler(utility, storage, auth)
const server = new HttpServer(requestHandler)

server.listen(config.httpServer.host, config.httpServer.port)
