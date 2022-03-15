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
  logtailToken: get('LOGTAIL_TOKEN'),
  dynamoAccessKeyId: get('DYNAMO_ACCESS_KEY_ID'),
  dynamoSecretAccessKey: get('DYNAMO_SECRET_ACCESS_KEY')
}

export type Config = typeof config

export default config
