import * as t from '../types'

// These currently look boring. Its likely that
// we will run into cases where we want to store
// data in the record in a special -- either less
// or more explicity -- way.

export interface LinkRefRecord extends t.LinkRef {
    HK: string
    SK: String
}
