import boom from '@hapi/boom'
import { check, param, validationResult } from 'express-validator'
import { db, User, UserAuth, ServiceUser } from '@/models'
import str from '@/util/str'
import Authenticator from '@/middlewares/passport'
import FirebaseAuth from '@/middlewares/firebase/auth'
import UserAcl from '@/middlewares/userAcl'
import config from '@/config/config'
const isFBEnabled = config.auth.firebase.isEnabled

export default {
  authenticate: (req, res, next) => {
    if (isFBEnabled) {
      FirebaseAuth.isAuthenticated(req, res, next)
    } else {
      // TODO: for passport auth
      //Authenticator.isAuthenticated(req, res, next)
    }
  },

  checkFetchUsersAcl: (req, res, next) => {
    UserAcl.checkFetchUsersAcl(req, res, next)
  },

  checkEditable: (req, res, next) => {
    UserAcl.checkEditable(req, res, next)
  },

  signOut: (req, res, next) => {
    Authenticator.signOut(req, res, next)
  },

  isAuthenticated: (req, res, next) => {
    if (isFBEnabled) {
      FirebaseAuth.isAuthenticated(req, res, next)
    } else {
      Authenticator.isAuthenticated(req, res, next)
    }
  },

  fetchUsers: async (req, res, next) => {
    try {
      const users = await User.findAll()
      return res.json(users)
    } catch (err) {
      return next(boom.badRequest(err))
    }
  },

  create: (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      //return next(boom.badData(errors.array().shift().msg))
      return res.status(422).json({ errors: errors.array() })
    }
    const email = req.body.email
    const password = str.hashing(req.body.password)
    try {
      db.sequelize.transaction(async (t) => {
        const user = await User.create({
          name: name,
          type: 'normal',
          isDeleted: false,
        })
        const userAuth = await UserAuth.create({
          userId: user.id,
          email: email,
          password: password,
        })
        return res.json({
          id: user.id,
          email: userAuth.email,
          name: user.name,
          type: user.type,
          uid: null,
          serviceCode: null,
        })
      })
    } catch (err) {
      return next(boom.badRequest(err))
    }
  },

  edit: (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    const id = req.params.userId
    const name = req.body.name
    try {
      const result = db.sequelize.transaction(async (t) => {
        const user = await User.update({
          name: name,
        }, {
          where: {id: id}
        })
        return res.json({
          id: user.id,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
      })
    } catch (err) {
      return next(boom.badRequest(err))
    }
  },

  createServiceUser: (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    const serviceCode = req.params.serviceCode
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

  getServiceUser: async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    const serviceCode = req.params.serviceCode
    const serviceUserId = req.params.serviceUserId
    try {
      const serviceUser = await ServiceUser.findByserviceUserId(serviceCode, serviceUserId)
      return res.json({
        id: serviceUser.userId,
        name: serviceUser.User.name,
        type: serviceUser.User.type,
        uid: serviceUserId,
        serviceCode: serviceCode,
      })
    } catch (err) {
      return next(boom.badRequest(err))
    }
  },

  validate: (method) => {
    switch (method) {
      case 'create':
        return [
          check('email')
            .isLength({ min: 1 }).withMessage('Email is required')
            .trim()
            //.normalizeEmail()
            .isEmail().withMessage('Email is not valid')
            .custom((value) => {
              return UserAuth.findByEmail(value)
                .then(userAuth => {
                  if (userAuth) {
                    return Promise.reject('This email is already in use');
                  }
                  return Promise.resolve(value);
                })
            }),
          check('password', 'Password is not valid')
            .trim()
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
          check('name', 'Your name is required')
            .trim()
            .isLength({ min: 1 }).withMessage('Name is required'),
        ]

      case 'edit':
        return [
          check('name', 'Name is required')
            .trim()
            .isLength({ min: 1 }).withMessage('Name is required'),
        ]

      case 'getServiceUser':
        return [
          param('serviceCode')
            .trim()
            .isLength({ min: 1 }).withMessage('ServiceCode is required'),
          param('serviceUserId')
            .trim()
            .isLength({ min: 1 }).withMessage('uid is required'),
        ]

      case 'createServiceUser':
        return [
          param('serviceCode')
            .trim()
            .isLength({ min: 1 }).withMessage('ServiceCode is required'),
          check('uid')
            .trim()
            .isLength({ min: 1 }).withMessage('uid is required'),
          check('name').trim(),
          check('type')
            .customSanitizer(value => {
              const defaut = 'normal'
              const accepts = ['normal', 'anonymous']
              if (!value) return defaut
              if (!accepts.includes(value)) return defaut
              return value
            }),
        ]

      case 'signin':
        return [
          check('email')
            .isLength({ min: 1 }).withMessage('Email is required')
            .trim()
            //.normalizeEmail()
            .isEmail().withMessage('Email is not valid'),
          check('password', 'Password is not valid')
            .trim()
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        ]
    }
  },
}

