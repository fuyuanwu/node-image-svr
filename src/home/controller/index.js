'use strict';

import Base from './base.js';
import fs from 'fs';
import imagemagick from 'imagemagick-native';
import crypto from 'crypto';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction () {
    const source = './img/8.jpg'
    const dist = './img/after_resize.png'

    fs.stat('./img/8.jpg', function (err, stat) {
      if (err) return
      let size = stat.size
      let quality = 100

      // 根据原图确定压缩比
      if (size > 1024 * 4) quality = quality * 0.25
      else if (size > 1024 * 2) quality = quality * 0.4
      else if (size > 1024) quality = quality * 0.8
      else if (size > 512) quality = quality * 0.9

      let srcData = fs.readFileSync(source)
      let md5sum = crypto.createHash('md5');

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

    return this.display();
  }
}