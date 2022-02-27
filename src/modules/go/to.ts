import _ from 'radash'
import type { Props, Response } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useQueryArgs, useService } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'
import makeMongo, { MongoClient } from '../../core/mongo'

interface Args {
  c: string
}

interface Services {
  mongo: MongoClient
}

async function redirectToLink({ args, services, response }: Props<Args, Services>): Promise<Response> {
  const { mongo } = services
  const { c: code } = args

  const [err, link] = await mongo.findLinkByCode({ code })
  if (err) {
    // TODO: Not sure how to handle this because this endpoint will
    // be called by browser and will expect a document in return
    // not json
    return
  }

  return {
    ...response,
    status: 301, // Moved Permanently
    headers: {
      Location: link.url
    }
  }  
}

export default _.compose(
  useLogger(),
  useLambda(),
  useQueryArgs<Args>(yup => ({
    c: yup.string().required()  
  })),
  useService<Services>({
    mongo: makeMongo()
  }),
  redirectToLink
)
