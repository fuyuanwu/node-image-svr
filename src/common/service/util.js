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
  static str_hash (str, index) {
    let c = str.substr(index, 3)
    let d = parseInt(c, 16) / 4
    return parseInt(d)
  }

  /**
   * 生成文件目录
   * @param appid
   * @param filename
   */
  static get_filedir (appid, filename) {
    let dir1 = this.str_hash(filename, 3)
    let dir2 = this.str_hash(filename, 6)

    let config = think.config('upload')
    let root_path = config.path
    return `${root_path}${path.sep}${appid}${path.sep}${dir1}${path.sep}${dir2}`
  }

  static encode_filename_v1 (version = 'v1', md5Hex, type = 'png', width = 0, height = 0, resize_style = 'aspectfill') {
    return [ 'v1', md5Hex, type, width, height, resize_style ].join('&')
  }

  static decode_sys_filepath (type = 'not_find', width = '', height = '') {
    const filename = [ 'v1', type, width, height ].join('&')
    let config = think.config('upload')
    let root_path = config.path
    return `${root_path}${path.sep}${type}${path.sep}${filename}`
  }

  static deode_filename_v1 (encode_filename_v1) {
    return [ _v1_, _md5Hex_, _type_, _width_, _height_, _resize_style_ ] = encode_filename_v1.split('&')
  }

  static md5Hex (data) {
    let md5 = crypto.createHash('md5')
    md5.update(data)
    return md5.digest('hex')
  }
}
