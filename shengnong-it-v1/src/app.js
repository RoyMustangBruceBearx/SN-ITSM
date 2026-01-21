/**
 * 应用主类
 * 负责应用初始化、路由配置和全局状态管理
 */

import { Router } from './router.js'
import { HomePage } from './pages/HomePage.js'
import { AIAssistantPage } from './pages/AIAssistantPage.js'
import { ConfigService } from './services/configService.js'
import { eventBus } from './utils/eventBus.js'

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
      
      console.log('✅ 神农集团信息数字化平台初始化完成')
      
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
    
    // 监听导航请求
    eventBus.on('app:navigate', this.handleNavigationRequest.bind(this))
    
    // 监听全局键盘事件
    document.addEventListener('keydown', this.handleGlobalKeydown.bind(this))
    
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
   * 处理导航请求
   * @param {string} path - 目标路径
   */
  handleNavigationRequest(path) {
    console.log(`收到导航请求: ${path}`)
    this.router.navigate(path)
  }
  
  /**
   * 处理配置变化
   * @param {Object} config - 新配置
   */
  handleConfigChange(config) {
    console.log('配置已更新:', config)
  }
  
  /**
   * 处理路由变化
   * @param {Object} routeInfo - 路由信息
   */
  handleRouteChange(routeInfo) {
    console.log('路由变化:', routeInfo)
    this.updatePageTitle(routeInfo.to)
  }
  
  /**
   * 处理全局错误
   * @param {Error} error - 错误对象
   */
  handleError(error) {
    console.error('全局错误:', error)
    this.showError(error.message || '发生未知错误')
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
  }
  
  /**
   * 更新页面标题
   * @param {string} route - 路由路径
   */
  updatePageTitle(route) {
    const titles = {
      '/': '信息数字化平台',
      '/portal': '信息数字化平台',
      '/home': '信息数字化平台',
      '/ai-assistant': 'AI智能助手',
      '/ai': 'AI智能助手'
    }
    
    const title = titles[route] || '神农集团信息数字化平台'
    document.title = `${title} - www.ynsnjt.cn`
  }
  
  /**
   * 显示错误消息
   * @param {string} message - 消息内容
   */
  showError(message) {
    console.error(message)
    // 这里可以集成通知组件
  }
  
  /**
   * 销毁应用
   */
  destroy() {
    this.router.stop()
    document.removeEventListener('keydown', this.handleGlobalKeydown)
    eventBus.off('config:change', this.handleConfigChange)
    eventBus.off('route:change', this.handleRouteChange)
    eventBus.off('app:error', this.handleError)
    eventBus.off('app:navigate', this.handleNavigationRequest)
    
    this.isInitialized = false
    console.log('应用已销毁')
  }
}