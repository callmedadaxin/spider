自用抓数据

## api

### fetchData(Object opt)
获取数据,返回处理好的cheerio对象，跟jquery写法类似，可直接使用

```
spider.fetchData({
  url: 'http://www.dytt8.net/index.htm',
  decoding: 'gb2312'
}).then($ => {
  return $('.co_content2').html();
})
```

### asyncGetData(Object opt, Function proccessData, Mumber limit, Number timestep)
支持延时获取数据

proccessData 数据处理函数
limit 请求并发数 | default:3
timestep 请求等待时间 | default: 2000

### fetchProxy(Number page)
抓取代理，自动检查是否可用
从http://www.kuaidaili.com/proxylist/

page 第几页

//TODO
### savePictures
图片类型，直接写盘等操作


