'use strict'

import Base from './base.js'
import fs from 'fs'
import path from 'path'
import imagemagick from 'imagemagick-native'
import util from '../../common/service/util'

let fs_readFile = think.promisify(fs.readFile, fs)
let fs_writeFile = think.promisify(fs.writeFile, fs)

async function get_filepath_on_not_find (width, height) {
  // 根据参数生成文件名
  const filepath = util.decode_sys_filepath('not_find', width, height)
  const exists = fs.existsSync(filepath)

  if (exists) {
    return filepath
  } else {
    const src_filepath = './img/not_find/not_find.png'
    let data = await fs_readFile(src_filepath)
    await fs_writeFile(filepath, imagemagick.convert({
      srcData: data,
      width: width,
      height: height,
      resizeStyle: 'fill', // aspectfill is the default, or 'aspectfit' or 'fill'
    }))
    return filepath
  }
}

export default class extends Base {
  // 上传文件的实例代码
  // indexAction () {
  //   return this.display()
  // }

  async downloadAction () {
    let id = this.get('id')
    let width = this.get('w') || 0
    let height = this.get('h') || 0
    let resize_style = this.get('rs') || 'aspectfill'
    let type = this.get('t') || 'png'

    // 先判断原图存在不存在
    const src_filename = util.encode_filename_v1('v1', id) // 其他参数都不传，就表示获取原图
    const src_filedir = util.get_filedir('appid', src_filename)
    const src_filepath = `${src_filedir}${path.sep}${src_filename}`

    const src_exists = fs.existsSync(src_filepath)

    if (src_exists) { // 存在
      const src_stat = fs.statSync(src_filepath)
      if (src_stat.isFile()) {
        const filename = util.encode_filename_v1('v1', id, type, width, height, resize_style)
        const filedir = util.get_filedir('appid', filename)
        const filepath = `${filedir}${path.sep}${filename}`

        const exists = fs.existsSync(filepath)
        if (exists) {
          return this.download(filepath, undefined, id)
        } else { // 目标图不存在
          let size = src_stat.size // 原图大小
          let quality = 100

          // 根据原图确定压缩比
          if (size > 1024 * 1024 * 4) quality = quality * 0.25
          else if (size > 1024 * 1024 * 2) quality = quality * 0.4
          else if (size > 1024 * 1024) quality = quality * 0.8
          else if (size > 1024 * 512) quality = quality * 0.9

          let src_data = await fs_readFile(src_filepath)

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

          await fs_writeFile(filepath, imagemagick.convert(options))
          return this.download(filepath, undefined, id)
        }
      } else {
        const filepath = await get_filepath_on_not_find(width, height)
        return this.download(filepath, undefined, id)
      }
    }
    else { // 原图不存在
      const filepath = await get_filepath_on_not_find(width, height)
      return this.download(filepath, undefined, id)
    }
  }

  async uploadAction () {
    // 处理跨域问题
    let method = this.http.method.toLowerCase()
    if (method === "options") {
      this.setCorsHeader()
      this.end()
      return
    }
    this.setCorsHeader()

    let file = think.extend({}, this.file('image'))

    var filepath = file.path

    if (!filepath) {
      return this.json({ errcode: 400, errmsg: 'no file upload' })
    }

    let srcData = await fs_readFile(filepath)
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

  setCorsHeader () {
    this.header('Access-Control-Allow-Origin', this.header('origin') || '*')
    this.header('Access-Control-Allow-Headers', 'x-requested-with, X-File-Name')
    this.header('Access-Control-Request-Method', 'GET,POST,PUT,DELETE')
    this.header('Access-Control-Allow-Credentials', 'true')
  }
}