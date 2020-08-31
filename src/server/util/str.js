import crypto from 'crypto'

export default {
  hashing: (data) => {
    const shasum = crypto.createHash('sha1')
    shasum.update(data)
    return shasum.digest('hex')
  },
}

