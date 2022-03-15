import _ from 'radash'
import { v4 as uuid } from 'uuid'
import { Logtail } from '@logtail/node'
import config from '../config'
import type { ApiFunction, Props } from '@exobase/core'

declare global {
  var _logtailLogger: Logtail
}

type AnyFunc = (...args: any[]) => any

const getLogger = () => {
  if (!global._logtailLogger) {
    global._logtailLogger = new Logtail(config.logtailToken, {
      batchSize: 10,
      batchInterval: 15
    })
  }
  return global._logtailLogger
}

export const initLogger = () => {
  const logger = getLogger()
  const queue: Record<string, Promise<any>> = {}

  const intercept = (consoleFunc: AnyFunc, logtailFunc: AnyFunc): AnyFunc => {
    if ((consoleFunc as any).__hook === 'log.override') {
      return consoleFunc
    }
    function logOverride(...args: any[]) {
      const id = uuid()
      queue[id] = logtailFunc.apply(logger, args).then(() => delete queue[id])
      consoleFunc.apply(console, args)
    }
    logOverride.__hook = 'log.override'
    return logOverride
  }

  console.log = intercept(console.log, logger.log)
  console.error = intercept(console.error, logger.error)
  console.warn = intercept(console.warn, logger.warn)
  console.debug = intercept(console.debug, logger.debug)

  return {
    pending: () => Object.values(queue)
  }
}

/**
 * By exobase definitions this is a wierd hook because
 * its not a root hook or standard hook. Its used as a
 * root hook but only inits the logger and passes on the
 * next function which is the real root hook.
 * 
 * Now calling this an init hook :)
 */
export const useLogger = () => (func: ApiFunction) => {
  const logger = config.env !== 'local' ? initLogger() : null
  return async (props: Props) => {
    const [err, result] = await _.try(func)(props)
    const pending = logger?.pending() ?? []
    if (pending.length > 0) {
      await (Promise as any).allSettled(pending)
    }
    if (err) throw err
    return result
  }
}
