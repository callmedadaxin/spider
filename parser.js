var _ = require('lodash')
var cheerio = require('cheerio')
cheerio.prototype.removeTagText = function() {
  var html = this.html()
  return html.replace(/<([\w\d]+)\b[^<]+?<\/\1>/g, (m) => {
    return ''
  })
}

function parser(data, map) {
  if (_.isObject(data)) {
    // 是json
    return _json(data, map)
  } else if (_.isString(data)) {
    var $ = cheerio.load(data, {
      decodeEntities: false
    })
    return _html($, map, $)
  }
}

function _json(json, map) {
  var result = {}
  _.each(map, (m, k) => {
    if (_.isString(m)) {
      result[k] = _.get(json, m)
    } else if (m.selector) {
      var h = m.handler
      m = m.selector
      if (m === '*' && _.isObject(h)) {
        var t = result[k] = []
        _.each(json, (val, key) => {
          t.push(_json(val, h))
        })
      } else {
        result[k] = _.get(json, m)
      }
    } else {
      return _json(json, m)
    }
  })
  return result
}

function _html($, map, $root) {
  var result = {}
  _.each(map, (val, key) => {
    var selector = val.selector
    var handler = val.handler
    if (selector.indexOf('!') !== -1) {
      // 处理 .item!attr:href情况
      selector = selector.split('!')
      handler = selector[1]
      selector = selector[0]
    }
    var rs
      // 选择器，生成dom节点对象
    var $nodes
    if ($.find) {
      // 按照数组格式
      $nodes = $.find(selector)
    } else {
      $nodes = $(selector)
    }
    // 开始处理数据和递归
    switch (typeof handler) {
      case 'string':
      case 'function':
        rs = _get(handler, $nodes, $root)
        break
      case 'object':
        if (_.isRegExp(handler)) {
          // 正则
          rs = _get(($n) => {
            var html = $n.html()
            return html.match(handler)
          }, $nodes, $root)
        } else {
          // 继续递归
          rs = _html($nodes, handler, $root)
        }
        break
      default:
        rs = _get('html', $nodes, $root)
        break
    }

    result[key] = rs
  })
  return result
}

function _get(handler, $node, $root) {
  if (!_.isFunction(handler)) {
    var h = handler.split(':') // attr:xxx

    handler = function($n, $) {
      var str = $n[h[0]](h[1])
      if (str) {
        return str.trim()
      } else return ''
    }
  }

  if ($node.length > 1) {
    var t = []
    $node.each(function(k, e) {
      t.push(handler($root(e, $node), $root))
    })
    return t
  } else {
    return handler($node, $root)
  }
}
module.exports = parser