var _ = require('lodash')
var request = require('request')
var parser = require('./parser')
var iconv = require('iconv-lite')
var cheerio = require('cheerio')
var async = require('async')
var moment = require('moment')

var spider = {
  page: 1,
  fetchData(opts) {
    if (_.isString(opts)) {
      opts = {
        url: opts
      }
    }

    opts.encoding = null

    return new Promise((resolve, reject) => {
      opts.callback = (error, response, body) => {
        if (!error) {
          body = iconv.decode(body, opts.decoding || 'utf8')
            // 处理json
          try {
            body = JSON.parse(body)
          } catch (e) {}

          resolve(this._loadHtml(body))
        } else {
          reject(error)
        }
      }
      request(opts)
    })
  },

  asyncGetData(opt, proccessData = data => data, limit = 3, timestep = 2000) {
    var results = [];

    if (Object.prototype.toString.call(opt) === "[object Array]") {
      opt = {
        urls: opt
      }
    }

    return new Promise((resolve, reject) => {
      async.eachLimit(opt.urls, limit, (url, callback) => {
        opt.url = url;

        return this.fetchData(opt).then($ => {
          results.push(proccessData($));

          //打印信息
          var time = moment().format('HH:MM:ss');
          console.log(`${url}===>success, ${time}`)

          setTimeout(callback, timestep);
        }).catch(e => {
          var time = moment().format('HH:MM:ss');
          console.log(`${url}===>fail, ${time}`)

          callback();
        })
      }, _ => {
        resolve(results);
      })
    })
  },

  fetchProxy(page = 1) {
    return this.fetchData('http://www.kuaidaili.com/proxylist/' + page).then($ => {
      var aTr = $('#index_free_list tbody tr'),
        res = [];

      aTr.each(function(index, el) {

        var children = $(el).find('td');

        res.push({
          ip: $(children[0]).html(),
          port: $(children[1]).html(),
          name: $(children[5]).html()
        });
      });

      return this._checkProxy(res);
    })
  },

  _loadHtml(data) {
    return cheerio.load(data, {
      decodeEntities: false
    })
  },

  _checkProxy(proxys) {
    var success = [];

    var reqs = proxys.map(proxy => {
      return this.fetchData({
        url: 'http://www.dytt8.net/index.htm',
        proxy: `http://${proxy.ip}:${proxy.port}`,
        decoding: 'gb2312',
        timeout: 5e3
      }).then(_ => {
        success.push(proxy);
      }).catch(e => void(0));
    })

    return Promise.all(reqs).then(r => {
      return success;
    })
  }
}

module.exports = spider;