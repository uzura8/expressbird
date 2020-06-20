import AWS from 'aws-sdk'
import awsConfig from '@/config/aws-config'

const AWS_S3_REGION = process.env.AWS_S3_REGION || process.env.AWS_DEFAULT_REGION || awsConfig.s3.region
AWS.config.update({region: AWS_S3_REGION});

const s3 = new AWS.S3();

export default s3


