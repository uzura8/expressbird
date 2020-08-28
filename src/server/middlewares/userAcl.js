import config from '@/config/config'
import boom from '@hapi/boom'
import { db, User } from '@/models'

export default {
  checkEditable: async (req, res, next) => {
    const user = req.user
    const isAdmin = user != null && user.type == 'admin'
    const reqUser = await User.findById(req.params.userId)
      .catch(err => {
        return next(boom.badImplementation(err))
      })
    if (!reqUser) {
      return next(boom.notFound('Requested id is invalid'))
    }
    if (isAdmin) {
      req.user = reqUser
      return next()
    }
    if (reqUser != null && reqUser.id == user.id) {
      req.user = reqUser
      return next()
    }
    return next(boom.forbidden('You have no permission'))
  },
}

