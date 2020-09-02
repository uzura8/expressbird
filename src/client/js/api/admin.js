import client from './client'
import uri from '@/util/uri'

export default {
  createUser: (serviceCode, vals, token) => {
    return new Promise((resolve, reject) => {
      const params = uri.convToPostParams(vals, ['email', 'password', 'name', 'type'])
      const options = { headers: { Authorization: token } }
      client.post('admin/users', params, options)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },

  getUser: (userId = '', token = null) => {
    return new Promise((resolve, reject) => {
      let options = {}
      if (token) options.headers = { Authorization: token }
      client.get(`admin/users/${userId}`, options)
        .then((res) => {
          resolve(res.data)
        })
        .catch(err => {
          reject(err)
        })
    })
  },

  editUser: (id, serviceCode, vals, token) => {
    let params = new URLSearchParams()
    if ('email' in vals && vals.email != null) params.append('email', vals.email)
    if ('password' in vals && vals.password != null) params.append('password', vals.password)
    if ('name' in vals && vals.name != null) params.append('name', vals.name)
    if ('type' in vals && vals.type != null) params.append('type', vals.type)

    return new Promise((resolve, reject) => {
      const options = { headers: { Authorization: token } }
      client.post(`admin/users/${id}`, params, options)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },
}

