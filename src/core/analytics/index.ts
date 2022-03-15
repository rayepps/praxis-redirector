import Analytics from 'analytics-node'
import config from '../config'


export type { Analytics }

/**
 * Because we only send 1 analytic event per request we
 * want to essentially skip the internal analytic buffer
 * and flush/send every event when its queued.
 * 
 * If we don't... warm lambda invocations will timeout
 * while the analytics buffer waits 10+ seconds for more
 * events before it flushes.
 */
const makeAnalytics = () => new Analytics(config.segmentKey, {
  flushAt: 1,
  flushInterval: 1
})

export default makeAnalytics