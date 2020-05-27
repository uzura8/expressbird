import config from '@/config/config'
import str from './str'

export default {
  uri: (path) => {
    const validPath = str.ltrimChar(path, '/')
    const domain = config.domain
    const port = config.port ? ':' + config.port: ''
    const basePath = config.baseUrl
    if (!domain && !port) return basePath + validPath

    const schem = config.isSSL ? 'https://' : 'http://'
    let items = [schem, domain, port, basePath, validPath]
    return items.join('')
  },

  baseUri: (type = 'url') => {
    const domain = config.domain
    const port = config.port ? ':' + config.port: ''
    const basePath = config.baseUrl
    if (!domain && !port) return basePath

    const schem = config.isSSL ? 'https://' : 'http://'
    let items = [domain, port]

    if (type == 'host') return items.join('')
    items.unshift(schem)
    if (type == 'origin') return items.join('')
    items.push(basePath)
    return items.join('')
  },
}
