import * as uuid from 'uuid'

export const createLinkCode = (url: string) => {
  return uuid.v5(`px.link.${url}`, uuid.v5.DNS)
}

export default {
  createLinkCode
}