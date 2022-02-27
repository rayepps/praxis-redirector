import _ from 'radash'
import URI from 'urijs'
import { customAlphabet } from 'nanoid'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useApiKeyAuthentication } from '@exobase/auth'
import { useLambda } from '@exobase/lambda'
import makeMongo, { MongoClient } from '../../core/mongo'
import config from '../../core/config'
import * as t from '../../core/types'

interface Args {
  url: string
  title: string
  class: string
  metadata?: any
}

interface Services {
  mongo: MongoClient
}

interface Response {
  link: t.LinkRef
}

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 10)

async function createLink({ args, services }: Props<Args, Services>): Promise<Response> {
  const { mongo } = services
  const { url, title, metadata, class: cls } = args

  const [uerr, existingLink] = await mongo.findLinkByUrl({ url })
  if (uerr) {
    throw uerr
  }

  if (existingLink) {
    return {
      link: existingLink
    }
  }

  const code = nanoid()

  const link: t.LinkRef = {
    domain: new URI(url).domain(),
    url,
    code,
    link: `${config.host}/go/to?c=${code}`,
    title,
    metadata: metadata ?? {},
    class: cls
  }

  const [err] = await mongo.addLink(link)
  if (err) {
    throw err
  }

  return {
    link
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useApiKeyAuthentication(config.apiKey),
  useJsonArgs<Args>(yup => ({
    url: yup.string().required(),
    title: yup.string().required(),
    class: yup.string().required(),
    metadata: yup.mixed()
  })),
  useService<Services>({
    mongo: makeMongo()
  }),
  createLink
)
