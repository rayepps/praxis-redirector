import _ from 'radash'
import URI from 'urijs'
import type { Props } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useJsonArgs, useService } from '@exobase/hooks'
import { useApiKeyAuthentication } from '@exobase/auth'
import { useLambda } from '@exobase/lambda'
import makeDatabase, { Database } from '../../core/db'
import config from '../../core/config'
import * as t from '../../core/types'
import { createLinkCode } from '../../core/model'

interface Args {
  url: string
  title: string
  class: string
  metadata?: any
}

interface Services {
  db: Database
}

interface Response {
  link: t.LinkRef
}

async function createLink({ args, services }: Props<Args, Services>): Promise<Response> {
  const { db } = services
  const { url: providedUrl, title, metadata, class: cls } = args

  const url = providedUrl.startsWith('https://') ? providedUrl : `https://${providedUrl}`

  const code = createLinkCode(url)

  const existingLink = await db.findLinkByCode(code)
  if (existingLink) {
    console.log('Using existing link instead of creating new')
    return {
      link: existingLink
    }
  }

  const link: t.LinkRef = {
    domain: new URI(url).domain(),
    url,
    code,
    link: `${config.host}/go/to?c=${code}`,
    title,
    metadata: metadata ?? {},
    class: cls
  }

  await db.addLink(link)

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
    db: makeDatabase()
  }),
  createLink
)
