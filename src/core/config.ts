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
  mongoUsername: get('MONGO_USER_NAME'),
  mongoPassword: get('MONGO_PASSWORD'),
  mongoInstanceName: get('MONGO_INSTANCE_NAME'),
  mongoSubdomain: get('MONGO_SUBDOMAIN'),
  logtailToken: get('LOGTAIL_TOKEN')
}

export type Config = typeof config

export default config
