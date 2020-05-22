import * as admin from 'firebase-admin';
import s3 from '@/middlewares/aws/s3-admin'
import awsConfig from '@/config/aws-config'

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || awsConfig.s3.bucketName
const firebaseCredentialFile = process.env.AWS_S3_KEY_FIREBASE_CREDENTIAL || awsConfig.s3.keys.firebaseCredential

const params = {
  Bucket: AWS_S3_BUCKET_NAME,
  Key: firebaseCredentialFile,
}
s3.getObject(params, (err, data) => {
  if (err) {
    console.log(err, err.stack);
  } else {
    const config = JSON.parse(data.Body.toString())
    admin.initializeApp({ credential: admin.credential.cert(config) })
  }
})

export default admin
