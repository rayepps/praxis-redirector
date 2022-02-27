const get = <T = string>(name: string, defaultValue: T = null, cast: (v: any) => T = v => v): T => {
  const val = process.env[name]
  if (!val) return defaultValue
  return cast(val)
}

const config = {
  env: get('PRAXIS_ENV'),
  apiKey: get('API_KEY'),
  host: get('PRAXIS_REDIRECTOR_HOST'),
  segmentKey: get('SEGMENT_KEY'),
  coralogixKey: get('CORALOGIX_API_KEY'),
  coralogixUrl: get('CORALOGIX_URL'),
  coralogixApplicationName: get('CORALOGIX_APPLICATION_NAME'),
  coralogixSubsystemName: get('CORALOGIX_SUBSYSTEM_NAME'),
  coralogixLoggerName: get('CORALOGIX_LOGGER_NAME'),
  mongoUsername: get('MONGO_USER_NAME'),
  mongoPassword: get('MONGO_PASSWORD'),
  mongoInstanceName: get('MONGO_INSTANCE_NAME'),
  mongoSubdomain: get('MONGO_SUBDOMAIN')
}

export type Config = typeof config

export default config
