import express from 'express'
import controller from './controller'

const router = express.Router()

router.get(
  '/firebase',
  controller.getFirebaseSdkConfig,
)

export default router

