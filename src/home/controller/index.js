'use strict'

import Base from './base.js'
import fs from 'fs'
import path from 'path'
import imagemagick from 'imagemagick-native'
import util from '../../common/service/util'

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction () {
    let id = this.get('id')
    let width = this.get('w') || 0
    let height = this.get('h') || 0
    let resize_style = this.get('rs') || 'aspectfill'
    let type = this.get('t') || 'png'

    const filename = util.encode_filename_v1('v1', id, type, width, height, resize_style)
    const filepath = util.get_filedir('appid', filename)
    let srcData = fs.readFileSync(filepath)

    fs.stat(filepath, function (err, stat) {
      if (err) return
      let size = stat.size
      let quality = 100

      // 根据原图确定压缩比
      if (size > 1024 * 4) quality = quality * 0.25
      else if (size > 1024 * 2) quality = quality * 0.4
      else if (size > 1024) quality = quality * 0.8
      else if (size > 512) quality = quality * 0.9

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

        fs.writeFileSync(filepath, imagemagick.convert(options))
      })

    })

    return this.display()
  }

  uploadAction () {
    let file = think.extend({}, this.file('image'))

    var filepath = file.path;

    if (!filepath) {
      return this.json({ errcode: 400, errmsg: 'no file upload' })
    }

    let srcData = fs.readFileSync(filepath)
    let md5Hex = util.md5Hex(srcData)
    const filename = util.encode_filename_v1('v1', md5Hex)
    const upload_filedir = util.get_filedir('appid', filename)
    const upload_filepath = `${upload_filedir}${path.sep}${filename}`

    // 文件上传后，需要将文件移动到项目其他地方，否则会在请求结束时删除掉该文件

    think.mkdir(upload_filedir)

    // 这里需要注意，只有同一个挂载点才能调用 rename，要移动到不同挂载点上面去的时候，需要用其他方法。
    fs.renameSync(filepath, upload_filepath)

    return this.json({ errcode: 0, id: md5Hex })
  }
}