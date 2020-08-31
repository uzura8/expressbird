import boom from '@hapi/boom'

export default {
  checkEditable: async (req, res, next) => {
    const user = req.user
    const isAdmin = user != null && user.type == 'admin'
    if (isAdmin) {
      return next()
    }
    return next(boom.forbidden('You have no permission'))
  },
}

