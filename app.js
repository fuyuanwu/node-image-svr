'use strict'
/**
 * Created by fuyuanwu on 2016/7/28.
 */

var fs = require('fs')
var imagemagick = require('imagemagick')

fs.writeFileSync('./img/after_resize.jpg', imagemagick.convert({
  srcData: fs.readFileSync('./img/8.jpg'),
  blur: 5,
  width: 100,
  height: 100,
  resizeStyle: 'aspectfill', // is the default, or 'aspectfit' or 'fill'
  gravity: 'Center', // optional: position crop area when using 'aspectfill'
  format: 'PNG',
  quality: 100 // (best) to 1 (worst)
}))