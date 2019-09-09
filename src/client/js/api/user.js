import client from './client'
import util from '../util'

export default {
  create: (values) => {
    return new Promise((resolve, reject) => {
      const params = util.uri.convToPostParams(values, ['name', 'email', 'password'])
      client.post('users', params)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },

  get: (userId = '') => {
    return new Promise((resolve, reject) => {
      if (!userId) userId = 'me'
      client.get(`users/${userId}`)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  },

  authenticate: (values) => {
    return new Promise((resolve, reject) => {
      const params = util.uri.convToPostParams(values, ['email', 'password'])
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
