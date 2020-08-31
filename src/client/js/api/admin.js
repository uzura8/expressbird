import client from './client'
import uri from '@/util/uri'

export default {
  createUser: (serviceCode, vals, token) => {
    return new Promise((resolve, reject) => {
      const params = uri.convToPostParams(vals, ['uid', 'name', 'type'])
      const options = { headers: { Authorization: token } }
      client.post('admin/users', params, options)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },
}
