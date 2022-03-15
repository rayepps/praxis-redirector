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

  if (!code) {
    console.warn('Tried redirect without c= query string')
    return {
      ...response,
      status: 302, // Moved Temporarily
      headers: {
        Location: 'https://praxisco.us/err/lost?err=missing-redirect-code'
      }
    }
  }

  const m = await mongo()
  const [err, link] = await m.findLinkByCode({ code })
  if (err) {
    // TODO: Not sure how to handle this because this endpoint will
    // be called by browser and will expect a document in return
    // not json
    console.error('Failed to lookup link by code', { err })
    return {
      ...response,
      status: 302, // Moved Temporarily
      headers: {
        Location: 'https://praxisco.us/err/lost?err=server-error'
      }
    }
  }

  if (!link) {
    console.warn('No link found for redirection', { code })
    return {
      ...response,
      status: 302, // Moved Temporarily
      headers: {
        Location: 'https://praxisco.us/err/lost?err=link-not-found'
      }
    }
  }

  await new Promise((res) => {
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
    }, (err) => {
      if (err) console.error(err)
      res(null)
    })
  })

  return {
    ...response,
    status: 302, // Moved Temporarily
    headers: {
      Location: link.url
    }
  }
}

export default _.compose(
  useLogger(),
  useLambda(),
  useQueryArgs<Args>(yup => ({
    c: yup.string()
  })),
  useService<Services>({
    mongo: makeMongo(),
    analytics: makeAnalytics()
  }),
  redirectToLink
)
