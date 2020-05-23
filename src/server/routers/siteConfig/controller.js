import boom from '@hapi/boom'
import s3 from '@/middlewares/aws/s3-admin'
import awsConfig from '@/config/aws-config'

export default {
  getFirebaseSdkConfig: (req, res, next) => {
    const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || awsConfig.s3.bucketName
    const firebaseAppSdkConfigFile = process.env.AWS_S3_KEY_FIREBASE_APP_SDK_CONFIG || awsConfig.s3.keys.firebaseAppSdkConfig
    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: firebaseAppSdkConfigFile,
    }

    s3.getObject(params, (err, data) => {
      if (err) {
        console.log(err, err.stack)
        return next(boom.badImplementation(err))
      } else {
        const config = JSON.parse(data.Body.toString())
        return res.json(config)
      }
    })
  }
}

