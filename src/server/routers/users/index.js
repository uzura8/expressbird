import express from 'express'
import controller from './controller'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ page:'users' })
})

router.get(
  '/check',
  controller.isAuthenticated,
  (req, res) => {
    res.json(req.user)
  }
)

router.post(
  '/signin',
  controller.validate('signin'),
  controller.authenticate
)

router.get(
  '/signout',
  controller.signOut
)

router.post(
  '/services/:serviceCode',
  controller.validate('createServiceUser'),
  controller.createServiceUser
)

router.get(
  '/services/:serviceCode/:serviceUserId',
  controller.validate('getServiceUser'),
  controller.isAuthenticated,
  controller.getServiceUser
)

router.get(
  '/:userId',
  controller.isAuthenticated,
  (req, res) => {
    res.json({ params:req.params })
  }
)

router.post(
  '/',
  controller.validate('create'),
  controller.create
)

router.post(
  '/:userId',
  controller.isAuthenticated,
  controller.validate('edit'),
  controller.checkEditable,
  controller.edit
)

export default router

