'use strict'

/**
 * session configs
 */
export default {
  name: 'hrc',
  type: 'redis',
  secret: 'O8Y~MGJ#@#',
  timeout: 24 * 3600,
  cookie: { // cookie options
    length: 32,
    httponly: true
  },
  adapter: {
    file: {
      path: think.RUNTIME_PATH + '/session'
    },
    redis: {
      prefix: 'hrc_'
    }
  }
}
