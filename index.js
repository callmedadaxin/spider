var _ = require('lodash')
var request = require('request')
var parser = require('./parser')
var iconv = require('iconv-lite')
var cheerio = require('cheerio')
var async = require('async')
var moment = require('moment')

function fetchData(opts) {
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

        var $ = loadHtml(body);
        resolve($)
      } else {
        reject(error)
      }
    }
    request(opts)
  })
}

function loadHtml(data) {
  return cheerio.load(data, {
    decodeEntities: false
  })
}

//延时抓取
function asyncGetData(urls, proccessData = data => data, limit = 3, timestep = 2000) {
  var results = [];

  return new Promise((resolve, reject) => {
    async.eachLimit(urls, limit, (url, callback) => {
      fetchData({
        url,
        decoding: 'gb2312'
      }).then($ => {
        results.push(proccessData($));

        //打印信息
        var time = moment().format('HH:MM:ss');
        console.log(`${url}===>success, ${time}`)

        setTimeout(callback, timestep);
      })
    }, _ => {
      resolve(results);
    })
  })
}

fetchData({
  url: 'http://www.dytt8.net/index.htm',
  decoding: 'gb2312'
}).then($ => {
  var list = $('.co_content2 ul a'),
    hrefList = [];

  list.each(function(index, el) {
    hrefList.push('http://www.dytt8.net' + $(el).attr('href'));
  });

  hrefList.length = 5;

  return hrefList;
}).then(list => {
  return asyncGetData(list, $ => {
    var result = [];

    var title = $('.title_all h1').text(),
      url = $('#Zoom table td a').text();

    result.push({
      title: title,
      url: url
    })

    return result;
  });
}).then(r => {
  console.log(r);
})