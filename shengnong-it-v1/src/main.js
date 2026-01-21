/**
 * 神农集团信息数字化平台 - 应用入口
 * 基于 www.ynsnjt.cn 内容定制
 */

import { App } from './app.js'
import './styles/main.css'

// 创建应用实例
const app = new App()

// 初始化应用
app.init().catch(error => {
  console.error('应用启动失败:', error)
  
  // 显示错误信息
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.innerHTML = `
      <div class="error-screen">
        <div class="error-content">
          <i class="fas fa-exclamation-triangle error-icon"></i>
          <h2>应用启动失败</h2>
          <p>请刷新页面重试，如问题持续存在请联系技术支持</p>
          <button onclick="location.reload()" class="retry-btn">
            <i class="fas fa-redo"></i> 重新加载
          </button>
        </div>
      </div>
    `
  }
})

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
})

// 开发环境下暴露应用实例到全局
if (import.meta.env.DEV) {
  window.app = app
  console.log('开发模式：应用实例已暴露到 window.app')
}