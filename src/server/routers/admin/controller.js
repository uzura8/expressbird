import boom from '@hapi/boom'
import { check, validationResult } from 'express-validator'
import admin from '@/middlewares/firebase/admin'
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


  getUser: async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const serviceCode = 'firebase'
    const id = req.params.userId
    try {
      const user = await User.findById(id)
      if (user == null) return next(boom.notFound('Requested id is invalid'))

      const serviceUser = await ServiceUser.findByUserId(id)
      if (serviceUser == null) return next(boom.notFound('Requested id is invalid'))

      const fbuser = await admin.auth().getUser(serviceUser.serviceUserId)
      if (fbuser == null) return next(boom.notFound('Requested id is invalid'))

      return res.json({
        id: id,
        email: fbuser.email,
        name: user.name,
        type: user.type,
        uid: fbuser.uid,
        serviceCode: serviceCode,
      })
    } catch (err) {
      return next(boom.badRequest(err))
    }
  },

  createUser: async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const serviceCode = 'firebase'
    const email = req.body.email
    const password = req.body.password
    const name = req.body.name
    const type = req.body.type
    try {
      const fbuser = await admin.auth().createUser({
        email: email,
        emailVerified: false,
        password: password,
        displayName: name,
        disabled: false
      })

      db.sequelize.transaction(async (t) => {
        let vals = {
          name: name,
          type: type,
          isDeleted: false,
        }
        const user = await User.create(vals)
        await ServiceUser.create({
          serviceCode: serviceCode,
          serviceUserId: fbuser.uid,
          userId: user.id,
        })
        return res.json({
          id: user.id,
          name: name,
          type: type,
          uid: fbuser.uid,
          serviceCode: serviceCode,
        })
      })
    } catch (err) {
      return next(boom.badRequest(err))
    }
  },

  editUser: async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const serviceCode = 'firebase'
    const id = req.params.userId
    const email = req.body.email
    const password = req.body.password
    const name = req.body.name
    const type = req.body.type
    try {
      const user = await User.findById(id)
      if (user == null) return next(boom.notFound())

      const serviceUser = await ServiceUser.findByUserId(id)
      if (serviceUser == null) return next(boom.notFound())

      const fbuser = await admin.auth().updateUser(serviceUser.serviceUserId ,{
        email: email,
        password: password,
        displayName: name,
      })

      db.sequelize.transaction(async (t) => {
        user.name = name
        user.type = type
        await user.save()

        return res.json({
          id: user.id,
          name: name,
          type: type,
          uid: fbuser.uid,
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
          check('email')
            .isLength({ min: 1 }).withMessage('Email is required')
            .trim()
            //.normalizeEmail()
            .isEmail().withMessage('Email is not valid'),
          check('password', 'Password is not valid')
            .trim()
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
          check('name', 'Your name is required')
            .trim()
            .isLength({ min: 1 }).withMessage('Name is required'),
          check('type')
            .customSanitizer(value => {
              const defaut = 'normal'
              const accepts = ['normal', 'admin']
              if (!value) return defaut
              if (!accepts.includes(value)) return defaut
              return value
            }),
        ]

      case 'editUser':
        return [
          check('email')
            .isLength({ min: 1 }).withMessage('Email is required')
            .trim()
            //.normalizeEmail()
            .isEmail().withMessage('Email is not valid'),
          check('password', 'Password is not valid')
            .trim()
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
          check('name', 'Your name is required')
            .trim()
            .isLength({ min: 1 }).withMessage('Name is required'),
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

