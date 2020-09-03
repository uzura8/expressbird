import client from './client'
import uri from '@/util/uri'
import common from '@/util/common'

export default {
  create: (values) => {
    return new Promise((resolve, reject) => {
      const params = uri.convToPostParams(values, ['name', 'email', 'password'])
      client.post('users', params)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },

  edit: (id, vals, token = null) => {
    let params = new URLSearchParams()
    if ('name' in vals && vals.name != null) params.append('name', vals.name)
    if ('type' in vals && vals.type != null) params.append('type', vals.type)
    if (common.isEmpty(vals)) throw new Error('No value')

    return new Promise((resolve, reject) => {
      let options = {}
      if (token) options.headers = { Authorization: token }
      client.post(`users/${id}`, params, options)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },

  createServiceUser: (serviceCode, serviceUserId, vals) => {
    let postVals = Object.assign({}, vals);
    postVals.uid = serviceUserId
    return new Promise((resolve, reject) => {
      const params = uri.convToPostParams(postVals, ['uid'])
      client.post(`users/services/${serviceCode}`, params)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },

  get: (userId = '', token = null) => {
    let options = {}
    if (token) options.headers = { Authorization: token }
    return new Promise((resolve, reject) => {
      //if (!userId) userId = 'me'
      client.get(`users/${userId}`, options)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },

  getServiceUser: (serviceCode, serviceUserId, token = null) => {
    let options = {}
    if (token) options.headers = { Authorization: token }
    return new Promise((resolve, reject) => {
      client.get(`users/services/${serviceCode}/${serviceUserId}`, options)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },

  authenticate: (values) => {
    return new Promise((resolve, reject) => {
      const params = uri.convToPostParams(values, ['email', 'password'])
      client.post('users/signin', params)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },

  check: () => {
    return new Promise((resolve, reject) => {
      client.get('users/check')
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },

  signOut: () => {
    return new Promise((resolve, reject) => {
      client.get('users/signout')
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },
}
