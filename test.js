'use strict'
/**
 * Created by fuyuanwu on 2016/8/8.
 */
var fs = require('fs')
var imagemagick = require('imagemagick-native')

fs.writeFileSync('222.gif', imagemagick.convert({
  srcData: fs.readFileSync('111.gif'),
  quality: 60
}));