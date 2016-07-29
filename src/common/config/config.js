'use strict'
/**
 * config
 */
export default {
  host: '0.0.0.0', // 127.0.0.1 表示只监听本机
  port: '3000',
  default_module: 'home', // 设置默认模块
  default_controller: 'index',
  default_action: 'index',
  deny_module_list: [], // 禁用 xxx 模块
  route_on: false
}
