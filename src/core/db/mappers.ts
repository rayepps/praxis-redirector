import * as t from '../types'

export class LinkRefRecord {
  static toUser(record: t.LinkRefRecord): t.LinkRef {
    return {
      domain: record.domain,
      url: record.url,
      code: record.code,
      link: record.link,
      title: record.title,
      metadata: record.metadata,
      class: record.class
    }
  }
}
