import config from '@/config/config'
import str from './str'
import common from './common'

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

  absUri: (path) => {
    const validPath = str.ltrimChar(path, '/')
    const domain = config.domain ? config.domain : window.location.host
    if (common.isEmpty(domain)) return

    const port = config.port ? ':' + config.port: ''
    const basePath = config.baseUrl
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
