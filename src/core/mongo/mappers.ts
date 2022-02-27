import * as t from '../types'
import _ from 'radash'

export class LinkRef {
  static fromRecord(document: t.LinkRefDocument): t.LinkRef {
    return document as t.LinkRef
  }
}
