import _ from 'radash'
import { Logtail } from '@logtail/node'
import config from '../config'

declare global {
  var _logtailLogger: Logtail
}

type AnyFunc = (...args: any[]) => any

const getLogger = () => {
  if (!global._logtailLogger) {
    global._logtailLogger = new Logtail(config.logtailToken)
  }
  return global._logtailLogger
}

export const initLogger = () => {
  const logger = getLogger()

  const intercept = (consoleFunc: AnyFunc, logtailFunc: AnyFunc): AnyFunc => {
    if ((consoleFunc as any).__hook === 'log.override') {
      return consoleFunc
    }
    function logOverride(...args: any[]) {
      logtailFunc.apply(logger, args)
      consoleFunc.apply(console, args)
    }
    logOverride.__hook = 'log.override'
    return logOverride
  }

  console.log = intercept(console.log, logger.log)
  console.error = intercept(console.error, logger.error)
  console.warn = intercept(console.warn, logger.warn)
  console.debug = intercept(console.debug, logger.debug)
}

/**
 * By exobase definitions this is a wierd hook because
 * its not a root hook or standard hook. Its used as a
 * root hook but only inits the logger and passes on the
 * next function which is the real root hook.
 */
export const useLogger = () => (func: AnyFunc) => {
  // if (config.env !== 'local') {
  initLogger()
  // }
  return func
}
