/**
 * 配置服务
 * 负责加载和管理应用配置
 */

import { storage } from '../utils/helpers.js'

export class ConfigService {
  constructor() {
    this.config = {
      ui: {
        theme: 'light',
        language: 'zh-CN'
      },
      api: {
        baseURL: '/api',
        timeout: 10000
      },
      features: {
        aiAssistant: true,
        notifications: true
      }
    }
  }
  
  /**
   * 加载配置
   */
  async loadConfig() {
    try {
      // 从本地存储加载配置
      const savedConfig = storage.get('app-config')
      if (savedConfig) {
        this.config = { ...this.config, ...savedConfig }
      }
      
      console.log('配置加载完成:', this.config)
    } catch (error) {
      console.error('配置加载失败:', error)
      throw error
    }
  }
  
  /**
   * 保存配置
   */
  saveConfig() {
    try {
      storage.set('app-config', this.config)
      console.log('配置已保存')
    } catch (error) {
      console.error('配置保存失败:', error)
    }
  }
  
  /**
   * 获取配置项
   * @param {string} key - 配置键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 配置值
   */
  get(key, defaultValue = null) {
    const keys = key.split('.')
    let value = this.config
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return defaultValue
      }
    }
    
    return value
  }
  
  /**
   * 设置配置项
   * @param {string} key - 配置键名
   * @param {*} value - 配置值
   */
  set(key, value) {
    const keys = key.split('.')
    let target = this.config
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!(k in target) || typeof target[k] !== 'object') {
        target[k] = {}
      }
      target = target[k]
    }
    
    target[keys[keys.length - 1]] = value
    this.saveConfig()
  }
  
  /**
   * 重置配置
   */
  reset() {
    storage.remove('app-config')
    this.config = {
      ui: {
        theme: 'light',
        language: 'zh-CN'
      },
      api: {
        baseURL: '/api',
        timeout: 10000
      },
      features: {
        aiAssistant: true,
        notifications: true
      }
    }
    console.log('配置已重置')
  }
}