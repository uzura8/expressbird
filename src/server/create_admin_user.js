import config from '@/config/config'
import cli from '@/util/cli'
import { db, User, UserAuth, ServiceUser } from '@/models'

import * as admin from 'firebase-admin';
import s3 from '@/middlewares/aws/s3-admin'
import awsConfig from '@/config/aws-config'
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || awsConfig.s3.bucketName
const firebaseCredentialFile = process.env.AWS_S3_KEY_FIREBASE_CREDENTIAL || awsConfig.s3.keys.firebaseCredential

if (process.argv.length < 5) {
  console.error('Invalid argument')
  process.exit(1)
}

const email = process.argv[2]
const password = process.argv[3]
const userName = process.argv[4]

const createUser = function(name, email = '', password = '', serviceCode = '', serviceUserId = '') {
  db.sequelize.transaction(async (t) => {
    let results = {}
    try {
      const user = await User.create({
        name: name,
        type: 'admin',
        isDeleted: false,
      })
      results.user = user

      if (email && password) {
        const userAuth = await UserAuth.create({
          userId: user.id,
          email: email,
          password: password,
        })
        results.userAuth = userAuth
      }
      if (serviceCode && serviceUserId) {
        const serviceUser = await ServiceUser.create({
          serviceCode: serviceCode,
          serviceUserId: serviceUserId,
          userId: user.id,
        })
        results.serviceUser = serviceUser
      }
      console.log('Create admin user')
      process.exit(1)
    } catch (err) {
      cli.handleError(err)
    }
  })
}

try {
  if (config.auth.firebase.isEnabled) {
    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: firebaseCredentialFile,
    }
    s3.getObject(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        const firebaseConfig = JSON.parse(data.Body.toString())
        admin.initializeApp({ credential: admin.credential.cert(firebaseConfig) })
        admin.auth().createUser({
          email: email,
          emailVerified: false,
          password: password,
          displayName: userName,
          disabled: false
        })
          .then(async (userRecord) => {
            await createUser(userName, '', '', 'firebase', userRecord.uid)
          })
          .catch((err) => {
            cli.handleError('Error creating new user:', err)
          })
      }
    })
  } else {
    createUser(userName, email, password)
  }
} catch (err) {
  cli.handleError(err)
}

