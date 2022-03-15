import _ from 'radash'
import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import * as t from '../types'
import * as mappers from './mappers'

const TABLE_NAME = 'praxis_main'

const createDatabase = (dynamo: DynamoDBClient) => ({
  addLink: async (link: t.LinkRef): Promise<void> => {
    const linkRecord: t.LinkRefRecord = {
      ...link,
      HK: `A#LINK#${link.code}`,
      SK: 'T#LINK'
    }
    const put = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(linkRecord)
    })
    const [err] = await _.try(dynamo.send.bind(dynamo))(put)
    if (err) throw err
  },
  findLinkByCode: async (code: string): Promise<t.LinkRef> => {
    const get = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        HK: `A#LINK#${code}`,
        SK: `T#LINK`
      })
    })
    const [err, response] = await _.try(dynamo.send.bind(dynamo))(get)
    if (err) throw err
    if (!response.Item) return null
    const link = unmarshall(response.Item) as t.LinkRefRecord
    return mappers.LinkRefRecord.toUser(link)
  }
})

export type Database = ReturnType<typeof createDatabase>

export default createDatabase
