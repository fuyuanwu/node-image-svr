'use strict'

import Base from './base.js'
import fs from 'fs'
import path from 'path'
import imagemagick from 'imagemagick-native'
import util from '../../common/service/util'

export default class extends Base {
  indexAction () {
    return this.display()
  }

  downloadAction () {
    let id = this.get('id')
    let width = this.get('w') || 0
    let height = this.get('h') || 0
    let resize_style = this.get('rs') || 'aspectfill'
    let type = this.get('t') || 'png'

    // const filename = util.encode_filename_v1('v1', id, type, width, height, resize_style)
    // const filepath = util.get_filedir('appid', filename)
    // let srcData = fs.readFileSync(filepath)

    // 先判断原图存在不存在
    const src_filename = util.encode_filename_v1('v1', id) // 其他参数都不传，就表示获取原图
    const src_filedir = util.get_filedir('appid', src_filename)
    const src_filepath = `${src_filedir}${path.sep}${src_filename}`

    try {
      const src_stat = fs.statSync(src_filepath)
      if (src_stat.isFile()) {
        const filename = util.encode_filename_v1('v1', id, type, width, height, resize_style)
        const filedir = util.get_filedir('appid', filename)
        const filepath = `${filedir}${path.sep}${filename}`

        try {
          const stat = fs.statSync(filepath)
          if (stat.isFile()) {
            return this.download(filepath, undefined, id)
          } else { // 目标图不存在
            return this.json({ errcode: 408, errmsg: 'id invalid.' })
          }
        } catch (e) { // 目标图不存在
          let size = src_stat.size // 原图大小
          let quality = 100

          // 根据原图确定压缩比
          if (size > 1024 * 4) quality = quality * 0.25
          else if (size > 1024 * 2) quality = quality * 0.4
          else if (size > 1024) quality = quality * 0.8
          else if (size > 512) quality = quality * 0.9

          let src_data = fs.readFileSync(src_filepath)

          imagemagick.identify({
            srcData: src_data
          }, (err, result) => {
            if (err) return

            const options = {
              srcData: src_data,
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
            return this.download(filepath, undefined, id)
          })
        }
      } else { // 原图不存在
        return this.json({ errcode: 408, errmsg: 'id invalid.' })
      }
    } catch (e) { // 原图不存在
      return this.json({ errcode: 408, errmsg: 'id invalid.' })
    }
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

    console.log(upload_filedir)
    const upload_filepath = `${upload_filedir}${path.sep}${filename}`

    // 文件上传后，需要将文件移动到项目其他地方，否则会在请求结束时删除掉该文件

    think.mkdir(upload_filedir)

    // 这里需要注意，只有同一个挂载点才能调用 rename，要移动到不同挂载点上面去的时候，需要用其他方法。
    fs.renameSync(filepath, upload_filepath)

    return this.json({ errcode: 0, id: md5Hex })
  }
}