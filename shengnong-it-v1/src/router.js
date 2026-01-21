/**
 * 简单的前端路由器
 * 支持基于hash的路由和页面组件管理
 */

import { eventBus } from './utils/eventBus.js'

export class Router {
  constructor() {
    this.routes = new Map()
    this.currentRoute = null
    this.currentComponent = null
    this.container = null
    this.ready = false
  }
  
  /**
   * 注册路由
   * @param {string} path - 路由路径
   * @param {Class} component - 页面组件类
   */
  register(path, component) {
    this.routes.set(path, component)
    console.log(`路由已注册: ${path}`)
  }
  
  /**
   * 启动路由器
   */
  start() {
    this.container = document.getElementById('app')
    if (!this.container) {
      throw new Error('找不到应用容器元素 #app')
    }
    
    // 监听hash变化
    window.addEventListener('hashchange', this.handleHashChange.bind(this))
    window.addEventListener('popstate', this.handlePopState.bind(this))
    
    this.ready = true
    
    // 处理初始路由
    this.handleRoute()
    
    console.log('路由器已启动')
  }
  
  /**
   * 停止路由器
   */
  stop() {
    window.removeEventListener('hashchange', this.handleHashChange)
    window.removeEventListener('popstate', this.handlePopState)
    this.ready = false
  }
  
  /**
   * 检查路由器是否准备就绪
   */
  isReady() {
    return this.ready
  }
  
  /**
   * 导航到指定路径
   * @param {string} path - 目标路径
   */
  navigate(path) {
    if (!this.ready) {
      console.warn('路由器尚未准备就绪')
      return
    }
    
    // 更新URL
    if (path === '/') {
      window.location.hash = ''
    } else {
      window.location.hash = path
    }
  }
  
  /**
   * 处理hash变化
   */
  handleHashChange() {
    this.handleRoute()
  }
  
  /**
   * 处理浏览器前进后退
   */
  handlePopState() {
    this.handleRoute()
  }
  
  /**
   * 处理路由
   */
  handleRoute() {
    const hash = window.location.hash
    const path = hash ? hash.substring(1) : '/'
    
    console.log(`处理路由: ${path}`)
    
    // 查找匹配的路由
    const ComponentClass = this.routes.get(path)
    
    if (!ComponentClass) {
      console.warn(`未找到路由: ${path}`)
      this.show404()
      return
    }
    
    // 销毁当前组件
    if (this.currentComponent && typeof this.currentComponent.destroy === 'function') {
      this.currentComponent.destroy()
    }
    
    // 创建新组件实例
    try {
      this.currentComponent = new ComponentClass()
      
      // 渲染组件
      if (typeof this.currentComponent.render === 'function') {
        this.currentComponent.render(this.container)
      }
      
      // 初始化组件
      if (typeof this.currentComponent.init === 'function') {
        this.currentComponent.init()
      }
      
      // 更新当前路由
      const previousRoute = this.currentRoute
      this.currentRoute = path
      
      // 触发路由变化事件
      eventBus.emit('route:change', {
        from: previousRoute,
        to: path,
        component: this.currentComponent
      })
      
      console.log(`路由切换成功: ${path}`)
      
    } catch (error) {
      console.error(`路由组件创建失败: ${path}`, error)
      this.showError(error)
    }
  }
  
  /**
   * 显示404页面
   */
  show404() {
    this.container.innerHTML = `
      <div class="route-404">
        <div class="error-icon">🔍</div>
        <h2>页面未找到</h2>
        <p>抱歉，您访问的页面不存在</p>
        <button class="home-btn" onclick="location.hash = ''">
          <i class="fas fa-home"></i> 返回首页
        </button>
      </div>
    `
  }
  
  /**
   * 显示错误页面
   * @param {Error} error - 错误对象
   */
  showError(error) {
    this.container.innerHTML = `
      <div class="route-error">
        <div class="error-icon">⚠️</div>
        <h2>页面加载失败</h2>
        <p>页面组件加载时发生错误</p>
        <div class="error-details">
          <code>${error.message}</code>
        </div>
        <button class="retry-btn" onclick="location.reload()">
          <i class="fas fa-redo"></i> 重新加载
        </button>
      </div>
    `
  }
}