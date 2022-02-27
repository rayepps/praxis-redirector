

export interface LinkRef {

  /**
   * The domain of the link. If full url is https://hello.com/go?t=23
   * the domain will be hello.com
   */
  domain: string

  /**
   * The original full and unmodified url given
   */
  url: string

  /**
   * The uid for this link
   */
  code: string

  /**
   * The link generated with code included
   */
  link: string

  /**
   * A descriptive title for this link
   */
  title: string

  /**
   * Arbitrary object of data to store with the link. Will be
   * sent to analytics when link is followed by user
   */
  metadata: any

  /**
   * The class/group/type of link. Praxis creates company, training,
   * and event links.
   */
  class: string
}