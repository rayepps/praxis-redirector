import _ from 'radash'
import * as Mongo from 'mongodb'
// import { ObjectId } from 'mongodb'
import * as t from '../types'
import * as mappers from './mappers'

type Collection = 'links'

const addItem =
  <TDocument, TModel>({
    db,
    collection,
    toDocument
  }: {
    db: Mongo.Db
    collection: Collection
    toDocument: (model: TModel) => TDocument
  }) =>
  async (model: TModel): Promise<[Error, TModel]> => {
    const record: TDocument = toDocument(model)
    const [err] = await _.try(() => {
      return db.collection<TDocument>(collection).insertOne(record as any)
    })()
    if (err) return [err, null]
    return [null, model]
  }

const findItem =
  <TModel, TArgs, TDocument>({
    db,
    collection,
    toQuery,
    toModel
  }: {
    db: Mongo.Db
    collection: Collection
    toQuery: (args: TArgs) => Mongo.Filter<TDocument>
    toModel: (record: TDocument, args?: TArgs) => TModel
  }) =>
  async (args: TArgs): Promise<[Error, TModel]> => {
    const query = toQuery(args)
    const [err, record] = await _.try(() => {
      return db.collection<TDocument>(collection).findOne(query) as Promise<TDocument>
    })()
    if (err) return [err, null]
    return [null, toModel(record, args)]
  }

// const findManyItems = <TModel, TArgs, TDocument>({
//   getDb,
//   collection,
//   toQuery,
//   toOptions,
//   toModel
// }: {
//   getDb: () => Promise<Mongo.Db>,
//   collection: Collection,
//   toQuery: (args: TArgs) => any,
//   toOptions?: (args: TArgs) => Mongo.FindOptions<Mongo.Document>,
//   toModel: (record: TDocument) => TModel
// }) => async (args: TArgs): Promise<[Error, TModel[]]> => {
//   const db = await getDb()
//   const cursor = db.collection<TDocument>(collection).find(toQuery(args), toOptions?.(args))
//   const [err2, records] = await _.try(() => cursor.toArray() as Promise<TDocument[]>)()
//   if (err2) return [err2, null]
//   return [null, records.map(toModel)]
// }

// const updateOne = <TDocument extends t.MongoDocument, TPatch>({
//   getDb,
//   collection,
//   toQuery,
//   toUpdate
// }: {
//   getDb: () => Promise<Mongo.Db>,
//   collection: Collection,
//   toQuery: (patch: TPatch) => Mongo.Filter<TDocument>
//   toUpdate: (patch: TPatch) => Partial<TDocument> | Mongo.UpdateFilter<TDocument>
// }) => async (patch: TPatch): Promise<[Error, void]> => {
//   const db = await getDb()
//   const [err] = await _.try(() => {
//     return db.collection<TDocument>(collection).updateOne(toQuery(patch), toUpdate(patch), {})
//   })()
//   if (err) return [err, null]
//   return [null, null]
// }

const createMongoClient = (client: Mongo.MongoClient) => {
  const clientPromise = client.connect()
  return async () => {
    const db = (await clientPromise).db('main')
    return {
      //
      // LINKS
      //
      addLink: addItem({
        db,
        collection: 'links',
        toDocument: (lr: t.LinkRef): t.LinkRefDocument => ({
          ...lr,
          _id: undefined // _id will be set my mongo
        })
      }),
      findLinkByCode: findItem({
        db,
        collection: 'links',
        toQuery: ({ code }: { code: string }) => ({
          code
        }),
        toModel: mappers.LinkRef.fromRecord
      }),
      findLinkByUrl: findItem({
        db,
        collection: 'links',
        toQuery: ({ url }: { url: string }) => ({
          url
        }),
        toModel: mappers.LinkRef.fromRecord
      })
    }
  }
}

export default createMongoClient
export type MongoClient = ReturnType<typeof createMongoClient>
