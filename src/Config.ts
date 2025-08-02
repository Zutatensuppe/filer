import { existsSync, readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config()

export interface Config {
  httpServer: {
    port: number
    host: string
  }
  upload: {
    directory: string
  }
  auth: {
    enabled: boolean
    secretToken: string
  }
}

const init = (): Config => {
  const configFile = process.env.APP_CONFIG
  if (!configFile) {
    console.error('APP_CONFIG environment variable is not set. Please specify the path to the config file.')
    process.exit(1)
  }
  if (!existsSync(configFile)) {
    console.error('no config file found. use APP_CONFIG environment variable to specify config file path')
    process.exit(1)
  }
  console.info('using config file:', configFile)
  try {
    const config: Config = JSON.parse(String(readFileSync(configFile)))
    return config
  } catch {
    console.error('bad format of config file.')
    process.exit(1)
  }
}
const config: Config = init()

export default config
