import Analytics from 'analytics-node'
import config from '../config'


export type { Analytics }

const makeAnalytics = () => new Analytics(config.segmentKey)

export default makeAnalytics