/**
 * Module used to make request from one
 * function in the api to another function
 */
import _ from 'radash'
import axios from 'axios'
import config from './config'

// Keeping this minimal. Only adding
// function identifiers as needed
export type ApiFunction = 'graphcms.enrichEventOnChange' | 'graphcms.enrichTrainingOnChange' | 'linking.createLink'

export const fetch = async <K = any>(func: ApiFunction, data: any): Promise<K> => {
  const [service, functionName] = func.split('.')
  const [err, result] = await _.try(async () => {
    return axios({
      url: `${config.baseUrl}/${service}/${functionName}`,
      method: 'POST',
      data: JSON.stringify(data),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Api-Key': `Key ${config.apiKey}`
      }
    })
  })()
  if (err) throw err
  if (result.status > 399) throw new Error('Request to api failed')
  return result.data?.payload
}

export type PraxisApi = {
  fetch: typeof fetch
}

export const makeApi = (): PraxisApi => ({
  fetch
})

export default makeApi
