import * as t from '../model/types'
import type { ObjectId } from 'mongodb'


export interface MongoDocument {
  _id: ObjectId
}

export type LinkRefDocument = MongoDocument & t.LinkRef