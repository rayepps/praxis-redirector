import _ from 'radash'
import * as uuid from 'uuid'
import type { Props, Response } from '@exobase/core'
import { useLogger } from '../../core/hooks/useLogger'
import { useQueryArgs, useService } from '@exobase/hooks'
import { useLambda } from '@exobase/lambda'
import makeAnalytics, { Analytics } from '../../core/analytics'
import makeDatabase, { Database } from '../../core/db'

interface Args {
  c: string
}

interface Services {
  db: Database
  analytics: Analytics
}

async function redirectToLink({ args, services, response }: Props<Args, Services>): Promise<Response> {
  const { db, analytics } = services
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

  const link = await db.findLinkByCode(code)

  if (!link) {
    console.warn(`Could not find link for given code(${code})`)
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
      properties: link
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
    db: makeDatabase(),
    analytics: makeAnalytics()
  }),
  redirectToLink
)
