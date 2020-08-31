import boom from '@hapi/boom'
import { check, validationResult } from 'express-validator'
import { db, User, ServiceUser } from '@/models'
import FirebaseAuth from '@/middlewares/firebase/auth'
import AdminAcl from '@/middlewares/adminAcl'

export default {
  isAuthenticated: (req, res, next) => {
    FirebaseAuth.isAuthenticated(req, res, next)
  },

  checkEditable: (req, res, next) => {
    AdminAcl.checkEditable(req, res, next)
  },

  createUser: (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    const serviceCode = 'firebase'
    const serviceUserId = req.body.uid
    const name = req.body.name
    const type = req.body.type
    try {
      db.sequelize.transaction(async (t) => {
        const serviceUser = await ServiceUser.findByserviceUserId(serviceCode, serviceUserId)
        let userName, userId
        if (serviceUser) {
          userId = serviceUser.userId
          userName = serviceUser.User.name
        } else {
          let vals = {
            type: type,
            isDeleted: false,
          }
          if (name.length > 0) vals.name = name
          const user = await User.create(vals)
          await ServiceUser.create({
            serviceCode: serviceCode,
            serviceUserId: serviceUserId,
            userId: user.id,
          })
          userId = user.id
          if (user.name) userName = user.name
        }
        return res.json({
          id: userId,
          name: userName,
          type: type,
          uid: serviceUserId,
          serviceCode: serviceCode,
        })
      })
    } catch (err) {
      return next(boom.badRequest(err))
    }
  },

  validate: (method) => {
    switch (method) {
      case 'createUser':
        return [
          check('uid')
            .trim()
            .isLength({ min: 1 }).withMessage('uid is required'),
          check('name')
            .trim()
            .isLength({ min: 1 }).withMessage('name is required'),
          check('type')
            .customSanitizer(value => {
              const defaut = 'normal'
              const accepts = ['normal', 'admin']
              if (!value) return defaut
              if (!accepts.includes(value)) return defaut
              return value
            }),
        ]
    }
  },
}

