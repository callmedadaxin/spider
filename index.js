var fs = require('fs');
var spider = require('./spider.js');
var path = require('path');

// var total = 10,
//   proxys = [];

// function fetchProxy(page = 1, total) {
//   return spider.fetchProxy(page).then(r => {
//     console.log('fifish fetch page: ' + page);

//     proxys = proxys.concat(r);

//     if (page < total) {
//       return fetchProxy(++page, total);
//     } else {
//       return proxys
//     }
//   })
// }

// spider.fetchProxy().then(proxys => {
spider.fetchData({
  url: 'http://www.dytt8.net/index.htm',
  decoding: 'gb2312'
}).then($ => {
  var list = $('.co_content2 ul a'),
    hrefList = [];

  list.each(function(index, el) {
    hrefList.push('http://www.dytt8.net' + $(el).attr('href'));
  });

  hrefList = hrefList.filter(item => item.url !== '');

  hrefList.length = 50;

  return hrefList;
}).then(list => {
  // var proxyIndex = parseInt(Math.random() * proxys.length) || 0;

  // var proxy = proxys[proxyIndex];
  var proxy = {
    ip: '124.207.82.166',
    port: '8008',
    name: '北京市  鹏博士宽带'
  };

  proxy = `http://${proxy.ip}:${proxy.port}`;

  return spider.asyncGetData({
    urls: list,
    decoding: 'gb2312',
    proxy: proxy
  }, $ => {
    var title = $('.title_all h1 font').html(),
      url = $('#Zoom table td a').html();

    return {
      title: title,
      url: url
    };
  });
}).then(r => {
  console.log('finish');
  fs.writeFile(path.join(__dirname, './film.json'), JSON.stringify(r), r => {
    console.log('写入完成');
  });
}).catch(e => {
  console.log(e);
  console.log('出错啦');
})

// })