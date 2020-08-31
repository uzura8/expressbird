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

export default router

