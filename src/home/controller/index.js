'use strict'

import Base from './base.js'
import fs from 'fs'
import imagemagick from 'imagemagick-native'
import crypto from 'crypto'
import _ from 'lodash'

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction () {
    let width = this.get('w') || 0
    let height = this.get('h') || 0
    let resize_style = this.get('rs') || 'aspectfill'
    let type = this.get('t') || 'png'

    const source = './img/8.jpg'

    fs.stat(source, function (err, stat) {
      if (err) return
      let size = stat.size
      let quality = 100

      // 根据原图确定压缩比
      if (size > 1024 * 4) quality = quality * 0.25
      else if (size > 1024 * 2) quality = quality * 0.4
      else if (size > 1024) quality = quality * 0.8
      else if (size > 512) quality = quality * 0.9

      let srcData = fs.readFileSync(source)
      let md5 = crypto.createHash('md5')
      md5.update(srcData)
      let md5Hex = md5.digest('hex')

      const encode_filename_v1 = [ 'v1', md5Hex, type, width, height, resize_style ].join('&') // encode_filename_v1
      const [ _v1_, _md5Hex_, _type_, _width_, _height_, _resize_style_ ] = encode_filename_v1.split('&') // deode_filename_v1
      console.log(_v1_, _md5Hex_, _type_, _width_, _height_, _resize_style_)

      const dist = `./img/${encode_filename_v1}`

      imagemagick.identify({
        srcData: srcData
      }, function (err, result) {
        if (err) return

        const options = {
          srcData: srcData,
          blur: 1,
          // resizeStyle: resize_style, // aspectfill is the default, or 'aspectfit' or 'fill'
          gravity: 'Center', // optional: position crop area when using 'aspectfill'
          format: type,
          quality: quality
        }

        if (width) options.width = width
        if (height) options.height = height
        if (resize_style) options.resizeStyle = resize_style

        fs.writeFileSync(dist, imagemagick.convert(options))
      })

    })

    return this.display()
  }
}