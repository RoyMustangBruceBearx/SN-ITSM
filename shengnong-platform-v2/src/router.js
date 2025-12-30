/**
 * 路由管理器
 * 负责页面路由和组件渲染
 */

import { eventBus } from './utils/eventBus.js'

export class Router {
  constructor() {
    this.routes = new Map()
    this.currentRoute = null
    this.currentComponent = null
    this.container = null
    this.isNavigating = false // 添加导航状态标志
    
    this.init()
  }
  
  init() {
    // 监听路由变化
    window.addEventListener('hashchange', this.handleRouteChange.bind(this))
    window.addEventListener('popstate', this.handleRouteChange.bind(this))
    
    // 设置默认容器
    this.container = document.getElementById('app')
  }
  
  /**
   * 注册路由
   * @param {string} path - 路由路径
   * @param {Function|Object} component - 组件构造函数或组件对象
   * @param {Object} options - 路由选项
   */
  register(path, component, options = {}) {
    this.routes.set(path, {
      component,
      options,
      meta: options.meta || {}
    })
    console.log(`路由已注册: ${path}`)
  }
  
  /**
   * 检查路由是否准备就绪
   * @returns {boolean} 路由是否可用
   */
  isReady() {
    const ready = this.routes.size > 0
    console.log(`路由器状态检查: ${ready ? '已准备' : '未准备'} (已注册路由数: ${this.routes.size})`)
    return ready
  }

  /**
   * 导航到指定路由
   * @param {string} path - 目标路径
   * @param {Object} params - 路由参数
   */
  navigate(path, params = {}) {
    console.log(`尝试导航到: ${path}`)
    
    // 检查路由器是否准备就绪
    if (!this.isReady()) {
      console.error('路由器尚未初始化，无法导航')
      return
    }
    
    // 检查路由是否存在
    if (!this.routes.has(path)) {
      console.error(`路由不存在: ${path}，已注册的路由:`, Array.from(this.routes.keys()))
      return
    }
    
    // 防止导航到相同路径造成不必要的重新渲染
    const currentPath = this.getCurrentPath()
    if (path === currentPath) {
      console.log(`已在目标路径: ${path}`)
      return
    }
    
    // 更新URL
    window.history.pushState({ path, params }, '', `#${path}`)
    
    // 直接处理路由变化，不需要额外调用
    this.handleRouteChange()
  }
  
  /**
   * 替换当前路由
   * @param {string} path - 目标路径
   * @param {Object} params - 路由参数
   */
  replace(path, params = {}) {
    window.history.replaceState({ path, params }, '', `#${path}`)
    this.handleRouteChange()
  }
  
  /**
   * 返回上一页
   */
  back() {
    window.history.back()
  }
  
  /**
   * 前进到下一页
   */
  forward() {
    window.history.forward()
  }
  
  /**
   * 获取当前路径
   * @returns {string} 当前路径
   */
  getCurrentPath() {
    const hash = window.location.hash
    if (!hash || hash === '#') {
      return '/'
    }
    return hash.slice(1) // 移除 # 符号
  }
  
  /**
   * 获取路由参数
   * @returns {Object} 路由参数
   */
  getParams() {
    const state = window.history.state
    return state?.params || {}
  }
  
  /**
   * 处理路由变化
   */
  async handleRouteChange() {
    // 防止并发路由变化
    if (this.isNavigating) {
      console.warn('路由正在变化中，忽略重复请求')
      return
    }
    
    this.isNavigating = true
    
    try {
      const path = this.getCurrentPath()
      const route = this.routes.get(path)
      
      if (!route) {
        console.warn(`路由未找到: ${path}`)
        console.log('已注册的路由:', Array.from(this.routes.keys()))
        
        // 防止无限递归：如果当前已经是根路径，直接显示404页面
        if (path === '/' || path === '') {
          this.show404Page()
          return
        }
        
        // 只有在不是根路径时才重定向到根路径
        window.history.replaceState({ path: '/', params: {} }, '', '#/')
        // 直接处理根路径，而不是调用navigate()来避免递归
        const rootRoute = this.routes.get('/')
        if (rootRoute) {
          await this.renderComponent(rootRoute.component, rootRoute.options)
          this.currentRoute = '/'
        } else {
          this.show404Page()
        }
        return
      }
      
      // 销毁当前组件
      if (this.currentComponent && typeof this.currentComponent.destroy === 'function') {
        this.currentComponent.destroy()
      }
      
      // 触发路由变化前事件
      eventBus.emit('route:before-change', {
        from: this.currentRoute,
        to: path
      })
      
      // 渲染新组件
      await this.renderComponent(route.component, route.options)
      
      // 更新当前路由
      this.currentRoute = path
      
      // 触发路由变化后事件
      eventBus.emit('route:after-change', {
        from: this.currentRoute,
        to: path,
        component: this.currentComponent
      })
      
      // 触发通用路由变化事件
      eventBus.emit('route:change', {
        from: this.currentRoute,
        to: path
      })
      
    } catch (error) {
      console.error('路由渲染失败:', error)
      this.handleRouteError(error)
    } finally {
      this.isNavigating = false
    }
  }
  
  /**
   * 渲染组件
   * @param {Function|Object} Component - 组件
   * @param {Object} options - 选项
   */
  async renderComponent(Component, options = {}) {
    if (!this.container) {
      throw new Error('路由容器未找到')
    }
    
    // 显示加载状态
    if (options.loading !== false) {
      this.showLoading()
    }
    
    try {
      let component
      
      if (typeof Component === 'function') {
        // 构造函数形式
        component = new Component()
      } else if (Component && typeof Component.render === 'function') {
        // 对象形式
        component = Component
      } else {
        throw new Error('无效的组件类型')
      }
      
      // 等待组件初始化
      if (typeof component.init === 'function') {
        await component.init()
      }
      
      // 渲染组件
      if (typeof component.render === 'function') {
        await component.render(this.container)
      } else {
        throw new Error('组件缺少render方法')
      }
      
      this.currentComponent = component
      
    } finally {
      // 隐藏加载状态
      this.hideLoading()
    }
  }
  
  /**
   * 显示加载状态
   */
  showLoading() {
    if (!this.container) return
    
    this.container.innerHTML = `
      <div class="route-loading">
        <div class="loading-spinner"></div>
        <p>页面加载中...</p>
      </div>
    `
  }
  
  /**
   * 隐藏加载状态
   */
  hideLoading() {
    const loading = this.container?.querySelector('.route-loading')
    if (loading) {
      loading.remove()
    }
  }
  
  /**
   * 显示404页面
   */
  show404Page() {
    if (!this.container) return
    
    this.container.innerHTML = `
      <div class="route-404">
        <div class="error-icon">🔍</div>
        <h2>页面未找到</h2>
        <p>抱歉，您访问的页面不存在</p>
        <button onclick="window.location.hash = '#/'" class="home-btn">
          返回首页
        </button>
      </div>
    `
    
    this.currentRoute = null
    this.currentComponent = null
  }

  /**
   * 处理路由错误
   * @param {Error} error - 错误对象
   */
  handleRouteError(error) {
    console.error('路由错误:', error)
    
    if (this.container) {
      this.container.innerHTML = `
        <div class="route-error">
          <div class="error-icon">⚠️</div>
          <h2>页面加载失败</h2>
          <p>${error.message}</p>
          <button onclick="location.reload()" class="retry-btn">
            重新加载
          </button>
        </div>
      `
    }
    
    // 触发错误事件
    eventBus.emit('route:error', {
      path: this.getCurrentPath(),
      error
    })
  }
  
  /**
   * 启动路由器
   */
  start() {
    console.log('启动路由器，当前已注册路由:', Array.from(this.routes.keys()))
    // 处理初始路由
    this.handleRouteChange()
  }
  
  /**
   * 停止路由器
   */
  stop() {
    window.removeEventListener('hashchange', this.handleRouteChange)
    window.removeEventListener('popstate', this.handleRouteChange)
    
    if (this.currentComponent && typeof this.currentComponent.destroy === 'function') {
      this.currentComponent.destroy()
    }
  }
  
  /**
   * 添加路由守卫
   * @param {Function} guard - 守卫函数
   */
  addGuard(guard) {
    eventBus.on('route:before-change', guard)
  }
  
  /**
   * 移除路由守卫
   * @param {Function} guard - 守卫函数
   */
  removeGuard(guard) {
    eventBus.off('route:before-change', guard)
  }
}

// 创建全局路由实例
export const router = new Router()

// 导出便捷方法
export const navigate = (path, params) => router.navigate(path, params)
export const replace = (path, params) => router.replace(path, params)
export const back = () => router.back()
export const forward = () => router.forward()