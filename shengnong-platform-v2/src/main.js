/**
 * 神农集团数字化平台 - 主入口文件
 * 应用初始化和启动
 */

import './styles/main.css'
import { App } from './app.js'

console.log('🌾 神农集团数字化平台 v2.0 启动中...')

// 初始化应用
const app = new App()

// 启动应用
app.init().then(() => {
  console.log('✅ 应用启动完成')
  
  // 在开发环境下暴露app实例到全局作用域以便调试
  if (typeof window !== 'undefined') {
    window.app = app
    console.log('💡 开发提示: 可通过 window.app 访问应用实例')
  }
}).catch(error => {
  console.error('❌ 应用启动失败:', error)
})

// 开发环境热更新
if (import.meta.hot) {
  import.meta.hot.accept()
}