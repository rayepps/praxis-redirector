import _ from 'radash'
import * as uuid from 'uuid'
import type { Props, Response } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useQueryArgs, useService } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'
import makeMongo, { MongoClient } from '../../core/mongo'
import makeAnalytics, { Analytics } from '../../core/analytics'

interface Args {
  c: string
}

interface Services {
  mongo: MongoClient
  analytics: Analytics
}

async function redirectToLink({ args, services, response }: Props<Args, Services>): Promise<Response> {
  const { mongo, analytics } = services
  const { c: code } = args

  const [err, link] = await mongo.findLinkByCode({ code })
  if (err) {
    // TODO: Not sure how to handle this because this endpoint will
    // be called by browser and will expect a document in return
    // not json
    console.error('Failed to lookup link by code', { err })
    return
  }

  if (!link) {
    console.warn('No link found for redirection', { code })
    return
  }

  analytics.track({
    event: 'link.follow',
    anonymousId: uuid.v4(),
    properties: {
      domain: link.domain,
      url: link.url,
      code: link.code,
      link: link.link,
      title: link.title,
      metadata: link.metadata,
      class: link.class
    }
  })

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
    mongo: makeMongo(),
    analytics: makeAnalytics()
  }),
  redirectToLink
)
