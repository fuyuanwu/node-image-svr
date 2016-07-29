'use strict'
/**
 * Created by fuyuanwu on 2016/7/28.
 */

var fs = require('fs')
var imagemagick = require('imagemagick-native')
var crypto = require("crypto");

var source = './img/8.jpg'
var dist = './img/after_resize.png'

fs.stat('./img/8.jpg', function (err, stat) {
  if (err) return
  var size = stat.size
  var quality = 100

  // 根据原图确定压缩比
  if (size > 1024 * 4) {
    quality = quality * 0.25
  } else if (size > 1024 * 2) {
    quality = quality * 0.4
  } else if (size > 1024) {
    quality = quality * 0.8
  } else if (size > 512) {
    quality = quality * 0.9
  }

  var srcData = fs.readFileSync(source)

  var md5sum = crypto.createHash('md5');

  imagemagick.identify({
    srcData: srcData
  }, function (err, result) {
    if (err) return
    console.log(result)
  })

  fs.writeFileSync(dist, imagemagick.convert({
    srcData: srcData,
    blur: 1,
    width: 500,
    height: 500,
    resizeStyle: 'aspectfill', // aspectfill is the default, or 'aspectfit' or 'fill'
    gravity: 'Center', // optional: position crop area when using 'aspectfill'
    format: 'PNG',
    quality: quality
  }))
})
