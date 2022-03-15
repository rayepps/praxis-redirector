import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import makeDatabaseClient from './client'
import config from '../config'

const makeDatabase = () => {
  return makeDatabaseClient(
    new DynamoDBClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.dynamoAccessKeyId,
        secretAccessKey: config.dynamoSecretAccessKey
      }
    })
  )
}

export { Database } from './client'

export default makeDatabase
