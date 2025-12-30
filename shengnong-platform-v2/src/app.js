/**
 * 应用主类
 * 负责应用初始化、路由配置和全局状态管理
 */

import { Router } from './router.js'
import { HomePage } from './pages/HomePage.js'
import { AIAssistantPage } from './pages/AIAssistantPage.js'
import { MindMapPage } from './pages/MindMapPage.js'
import { FloorPlanPage } from './pages/FloorPlanPage.js'
import { ConfigService } from './services/configService.js'
import { eventBus } from './utils/eventBus.js'
import { notificationManager } from './utils/notificationManager.js'

export class App {
  constructor() {
    this.router = new Router()
    this.configService = new ConfigService()
    this.isInitialized = false
  }
  
  /**
   * 初始化应用
   */
  async init() {
    try {
      // 加载配置
      await this.loadConfig()
      
      // 设置路由
      this.setupRoutes()
      
      // 绑定全局事件
      this.bindGlobalEvents()
      
      // 移除加载动画
      this.removeLoadingScreen()
      
      // 启动路由
      this.router.start()
      
      this.isInitialized = true
      
      // 触发应用初始化完成事件
      eventBus.emit('app:initialized')
      
      console.log('✅ 应用初始化完成，路由器已准备就绪')
      
    } catch (error) {
      console.error('应用初始化失败:', error)
      this.showError('应用初始化失败，请刷新页面重试')
      throw error
    }
  }
  
  /**
   * 加载应用配置
   */
  async loadConfig() {
    try {
      await this.configService.loadConfig()
      console.log('✓ 配置加载完成')
    } catch (error) {
      console.warn('配置加载失败，使用默认配置:', error)
    }
  }
  
  /**
   * 设置路由配置
   */
  setupRoutes() {
    console.log('开始注册路由...')
    
    // 注册页面路由
    this.router.register('/', HomePage)
    this.router.register('/portal', HomePage)
    this.router.register('/home', HomePage)
    this.router.register('/ai-assistant', AIAssistantPage)
    this.router.register('/ai', AIAssistantPage)
    this.router.register('/mindmap', MindMapPage)
    this.router.register('/mind', MindMapPage)
    this.router.register('/floorplan', FloorPlanPage)
    this.router.register('/floor', FloorPlanPage)
    
    console.log('✓ 路由配置完成，已注册路由:', Array.from(this.router.routes.keys()))
  }
  
  /**
   * 绑定全局事件
   */
  bindGlobalEvents() {
    // 监听配置变化
    eventBus.on('config:change', this.handleConfigChange.bind(this))
    
    // 监听路由变化
    eventBus.on('route:change', this.handleRouteChange.bind(this))
    
    // 监听错误事件
    eventBus.on('app:error', this.handleError.bind(this))
    
    // 监听通知事件
    eventBus.on('notification:show', this.handleNotification.bind(this))
    
    // 监听导航请求
    eventBus.on('app:navigate', this.handleNavigationRequest.bind(this))
    
    // 监听全局键盘事件
    document.addEventListener('keydown', this.handleGlobalKeydown.bind(this))
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this))
    
    // 监听网络状态变化
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
    
    console.log('✓ 全局事件绑定完成')
  }
  
  /**
   * 移除加载屏幕
   */
  removeLoadingScreen() {
    const loading = document.querySelector('.loading')
    if (loading) {
      loading.style.opacity = '0'
      setTimeout(() => {
        loading.remove()
      }, 300)
    }
  }
  
  /**
   * 手动导航 (用于调试)
   * @param {string} path - 目标路径
   */
  navigateTo(path) {
    console.log(`手动导航请求: ${path}`)
    this.handleNavigationRequest(path)
  }

  /**
   * 获取应用状态 (用于调试)
   * @returns {Object} 应用状态信息
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      routerReady: this.router.isReady(),
      registeredRoutes: Array.from(this.router.routes.keys()),
      currentRoute: this.router.currentRoute,
      appReady: this.isAppReady()
    }
  }

  /**
   * 检查应用是否已初始化
   * @returns {boolean} 应用是否已初始化
   */
  isAppReady() {
    return this.isInitialized && this.router.isReady()
  }

  /**
   * 处理导航请求
   * @param {string} path - 目标路径
   * @param {number} retryCount - 重试次数
   */
  handleNavigationRequest(path, retryCount = 0) {
    console.log(`收到导航请求: ${path} (重试次数: ${retryCount})`)
    
    const maxRetries = 10
    if (retryCount >= maxRetries) {
      console.error(`导航失败，已达到最大重试次数: ${path}`)
      this.showError('页面导航失败，请刷新页面重试')
      return
    }
    
    if (!this.isAppReady()) {
      console.warn('应用尚未完全准备就绪，延迟导航')
      setTimeout(() => {
        this.handleNavigationRequest(path, retryCount + 1)
      }, 200)
      return
    }
    
    console.log(`执行导航到: ${path}`)
    this.router.navigate(path)
  }

  /**
   * 处理配置变化
   * @param {Object} config - 新配置
   */
  handleConfigChange(config) {
    console.log('配置已更新:', config)
    
    // 更新主题
    if (config.ui?.theme) {
      this.updateTheme(config.ui.theme)
    }
    
    // 更新语言
    if (config.ui?.language) {
      this.updateLanguage(config.ui.language)
    }
  }
  
  /**
   * 处理路由变化
   * @param {Object} routeInfo - 路由信息
   */
  handleRouteChange(routeInfo) {
    console.log('路由变化:', routeInfo)
    
    // 更新页面标题
    this.updatePageTitle(routeInfo.to)
    
    // 记录页面访问
    this.trackPageView(routeInfo.to)
  }
  
  /**
   * 处理通知事件
   * @param {Object} data - 通知数据
   */
  handleNotification(data) {
    const { message, type = 'info', duration = 3000 } = data
    notificationManager.show(message, type, duration)
  }
  
  /**
   * 处理全局错误
   * @param {Error} error - 错误对象
   */
  handleError(error) {
    console.error('全局错误:', error)
    
    // 显示错误提示
    this.showError(error.message || '发生未知错误')
    
    // 错误上报 (如果需要)
    // this.reportError(error)
  }
  
  /**
   * 处理全局键盘事件
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleGlobalKeydown(event) {
    // Alt + H: 回到首页
    if (event.altKey && event.key === 'h') {
      event.preventDefault()
      this.router.navigate('/')
    }
    
    // Alt + A: AI助手
    if (event.altKey && event.key === 'a') {
      event.preventDefault()
      this.router.navigate('/ai-assistant')
    }
    
    // Alt + M: 思维导图
    if (event.altKey && event.key === 'm') {
      event.preventDefault()
      this.router.navigate('/mindmap')
    }
    
    // F11: 全屏切换
    if (event.key === 'F11') {
      event.preventDefault()
      this.toggleFullscreen()
    }
  }
  
  /**
   * 处理窗口大小变化
   */
  handleResize() {
    // 触发全局resize事件
    eventBus.emit('window:resize', {
      width: window.innerWidth,
      height: window.innerHeight
    })
  }
  
  /**
   * 处理网络连接
   */
  handleOnline() {
    console.log('网络已连接')
    eventBus.emit('network:online')
    this.showSuccess('网络连接已恢复')
  }
  
  /**
   * 处理网络断开
   */
  handleOffline() {
    console.log('网络已断开')
    eventBus.emit('network:offline')
    this.showWarning('网络连接已断开，部分功能可能受限')
  }
  
  /**
   * 更新主题
   * @param {string} theme - 主题名称
   */
  updateTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    console.log(`主题已切换为: ${theme}`)
  }
  
  /**
   * 更新语言
   * @param {string} language - 语言代码
   */
  updateLanguage(language) {
    document.documentElement.setAttribute('lang', language)
    console.log(`语言已切换为: ${language}`)
  }
  
  /**
   * 更新页面标题
   * @param {string} route - 路由路径
   */
  updatePageTitle(route) {
    const titles = {
      '/': '系统门户',
      '/portal': '系统门户',
      '/home': '系统门户',
      '/ai-assistant': 'AI智能助手',
      '/ai': 'AI智能助手',
      '/mindmap': '思维导图',
      '/mind': '思维导图',
      '/floorplan': '平面图',
      '/floor': '平面图'
    }
    
    const title = titles[route] || '神农集团数字化平台'
    document.title = `${title} - 神农集团数字化平台`
  }
  
  /**
   * 记录页面访问
   * @param {string} route - 路由路径
   */
  trackPageView(route) {
    // 这里可以集成统计分析工具
    console.log(`页面访问: ${route}`)
  }
  
  /**
   * 切换全屏模式
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }
  
  /**
   * 显示成功消息
   * @param {string} message - 消息内容
   */
  showSuccess(message) {
    eventBus.emit('toast:show', { type: 'success', message })
  }
  
  /**
   * 显示警告消息
   * @param {string} message - 消息内容
   */
  showWarning(message) {
    eventBus.emit('toast:show', { type: 'warning', message })
  }
  
  /**
   * 显示错误消息
   * @param {string} message - 消息内容
   */
  showError(message) {
    eventBus.emit('toast:show', { type: 'error', message })
  }
  
  /**
   * 销毁应用
   */
  destroy() {
    // 停止路由
    this.router.stop()
    
    // 移除事件监听
    document.removeEventListener('keydown', this.handleGlobalKeydown)
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    
    // 清理事件总线
    eventBus.off('config:change', this.handleConfigChange)
    eventBus.off('route:change', this.handleRouteChange)
    eventBus.off('app:error', this.handleError)
    eventBus.off('notification:show', this.handleNotification)
    eventBus.off('app:navigate', this.handleNavigationRequest)
    
    this.isInitialized = false
    console.log('应用已销毁')
  }
}