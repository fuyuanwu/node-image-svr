'use strict'
/**
 * Created by fuyuanwu on 2016/7/29.
 */
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

export default class {
  /**
   * 对字符按下标截取3位后按16进制转换为10进制然后除3取整返回
   * @param str
   * @param index
   * @returns {Number}
   */
  static str_hashstr_hash (str, index) {
    let c = str.substr(index, 3)
    let d = parseInt(c, 16) / 4
    return parseInt(d)
  }

  /**
   * 创建多层目录
   * @param p
   * @param mode
   * @param made
   * @returns {*}
   */
  static mkdirs (p, mode, made) {
    if (mode === undefined) {
      mode = 776 & (~process.umask())
    }
    if (!made) made = null

    if (typeof mode === 'string') mode = parseInt(mode, 8)
    p = path.resolve(p)

    try {
      fs.mkdirSync(p, mode)
      made = made || p
    }
    catch (err0) {

      switch (err0.code) {
        case 'ENOENT' :
          made = mkdirs(path.dirname(p), mode, made)
          mkdirs(p, mode, made)
          break

        default:
          let stat
          try {
            stat = fs.statSync(p)
          }
          catch (err1) {
            throw err0
          }
          if (!stat.isDirectory()) throw err0
          break
      }
    }

    return made
  }

  /**
   * 生成文件路径
   * @param appid
   * @param filename
   */
  static get_filepath (appid, filename) {
    let dir1 = this.str_hash(filename, 2)
    let dir2 = this.str_hash(filename, 5)

    let config = think.config('upload')
    let root_path = config.path
    return `${appid}${path.sep}${root_path}${path.sep}${dir1}${path.sep}${dir2}`
  }

  static encode_filename_v1 (version = 'v1', md5Hex, type, width, height, resize_style) {
    return [ 'v1', md5Hex, type, width, height, resize_style ].join('&')
  }

  static deode_filename_v1 (encode_filename_v1) {
    return [ _v1_, _md5Hex_, _type_, _width_, _height_, _resize_style_ ] = encode_filename_v1.split('&')
  }

  static md5Hex (data){
    let md5 = crypto.createHash('md5')
    md5.update(data)
    return md5.digest('hex')
  }
}
