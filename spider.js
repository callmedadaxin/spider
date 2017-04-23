var _ = require('lodash')
var request = require('request')
var parser = require('./parser')
var iconv = require('iconv-lite')

function spider(opts, handlerMap) {
  if (_.isString(opts)) {
    opts = {
      url: opts
    }
  }

  opts.encoding = null

  return new Promise((resolve, reject) => {
    opts.callback = function(error, response, body) {
      if (!error) {
        body = iconv.decode(body, opts.decoding || 'utf8')
          // 处理json
        try {
          body = JSON.parse(body)
        } catch (e) {}
        var data = parser(body, handlerMap)

        resolve(data, response)
      } else {
        reject(error)
      }
    }
    request(opts)
  })
}
module.exports = spider