import express from 'express'
import controller from './controller'

const router = express.Router()

router.post(
  '/users',
  controller.isAuthenticated,
  controller.validate('createUser'),
  controller.checkEditable,
  controller.createUser
)

router.get(
  '/users/:userId',
  controller.isAuthenticated,
  controller.checkEditable,
  controller.getUser
)

router.post(
  '/users/:userId',
  controller.isAuthenticated,
  controller.validate('editUser'),
  controller.checkEditable,
  controller.editUser
)

export default router

