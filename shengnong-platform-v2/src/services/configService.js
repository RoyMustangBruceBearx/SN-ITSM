/**
 * 配置服务
 * 负责应用配置的加载、保存和管理
 */

import { DEFAULT_CONFIG } from '../utils/constants.js'
import { mergeObjects, deepClone } from '../utils/helpers.js'
import { eventBus } from '../utils/eventBus.js'

export class ConfigService {
  constructor() {
    this.config = deepClone(DEFAULT_CONFIG)
    this.storageKey = 'shengnong_config'
  }
  
  /**
   * 加载配置
   */
  async loadConfig() {
    try {
      const savedConfig = localStorage.getItem(this.storageKey)
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig)
        this.config = mergeObjects(deepClone(DEFAULT_CONFIG), parsed)
      }
      
      // 验证配置
      this.validateConfig()
      
      console.log('配置加载完成:', this.config)
      
    } catch (error) {
      console.error('配置加载失败:', error)
      this.config = deepClone(DEFAULT_CONFIG)
    }
  }
  
  /**
   * 保存配置
   * @param {Object} newConfig - 新配置
   */
  async saveConfig(newConfig) {
    try {
      // 合并配置
      this.config = mergeObjects(this.config, newConfig)
      
      // 验证配置
      this.validateConfig()
      
      // 保存到本地存储
      localStorage.setItem(this.storageKey, JSON.stringify(this.config))
      
      // 触发配置变化事件
      eventBus.emit('config:change', this.config)
      
      console.log('配置保存成功:', this.config)
      
    } catch (error) {
      console.error('配置保存失败:', error)
      throw error
    }
  }
  
  /**
   * 获取配置
   * @param {string} key - 配置键（可选）
   * @returns {any} 配置值
   */
  getConfig(key) {
    if (!key) {
      return deepClone(this.config)
    }
    
    const keys = key.split('.')
    let value = this.config
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return undefined
      }
    }
    
    return deepClone(value)
  }
  
  /**
   * 设置配置
   * @param {string} key - 配置键
   * @param {any} value - 配置值
   */
  async setConfig(key, value) {
    const keys = key.split('.')
    let target = this.config
    
    // 导航到目标对象
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!target[k] || typeof target[k] !== 'object') {
        target[k] = {}
      }
      target = target[k]
    }
    
    // 设置值
    target[keys[keys.length - 1]] = value
    
    // 保存配置
    await this.saveConfig({})
  }
  
  /**
   * 重置配置
   * @param {string} key - 要重置的配置键（可选，不传则重置全部）
   */
  async resetConfig(key) {
    if (key) {
      const defaultValue = this.getDefaultValue(key)
      await this.setConfig(key, defaultValue)
    } else {
      this.config = deepClone(DEFAULT_CONFIG)
      await this.saveConfig({})
    }
  }
  
  /**
   * 获取默认配置值
   * @param {string} key - 配置键
   * @returns {any} 默认值
   */
  getDefaultValue(key) {
    const keys = key.split('.')
    let value = DEFAULT_CONFIG
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return undefined
      }
    }
    
    return deepClone(value)
  }
  
  /**
   * 验证配置
   */
  validateConfig() {
    // AI配置验证
    if (this.config.ai) {
      if (!this.config.ai.baseUrl || typeof this.config.ai.baseUrl !== 'string') {
        this.config.ai.baseUrl = DEFAULT_CONFIG.ai.baseUrl
      }
      
      if (!this.config.ai.model || typeof this.config.ai.model !== 'string') {
        this.config.ai.model = DEFAULT_CONFIG.ai.model
      }
      
      if (typeof this.config.ai.maxTokens !== 'number' || this.config.ai.maxTokens <= 0) {
        this.config.ai.maxTokens = DEFAULT_CONFIG.ai.maxTokens
      }
      
      if (typeof this.config.ai.temperature !== 'number' || 
          this.config.ai.temperature < 0 || this.config.ai.temperature > 2) {
        this.config.ai.temperature = DEFAULT_CONFIG.ai.temperature
      }
    }
    
    // UI配置验证
    if (this.config.ui) {
      const validThemes = ['light', 'dark', 'auto']
      if (!validThemes.includes(this.config.ui.theme)) {
        this.config.ui.theme = DEFAULT_CONFIG.ui.theme
      }
      
      const validLanguages = ['zh-CN', 'en-US']
      if (!validLanguages.includes(this.config.ui.language)) {
        this.config.ui.language = DEFAULT_CONFIG.ui.language
      }
      
      const validViewModes = ['grid', 'list']
      if (!validViewModes.includes(this.config.ui.viewMode)) {
        this.config.ui.viewMode = DEFAULT_CONFIG.ui.viewMode
      }
    }
  }
  
  /**
   * 导出配置
   * @returns {string} 配置JSON字符串
   */
  exportConfig() {
    return JSON.stringify(this.config, null, 2)
  }
  
  /**
   * 导入配置
   * @param {string} configJson - 配置JSON字符串
   */
  async importConfig(configJson) {
    try {
      const importedConfig = JSON.parse(configJson)
      await this.saveConfig(importedConfig)
    } catch (error) {
      console.error('配置导入失败:', error)
      throw new Error('配置格式无效')
    }
  }
  
  /**
   * 获取AI配置
   * @returns {Object} AI配置
   */
  getAIConfig() {
    return this.getConfig('ai')
  }
  
  /**
   * 设置AI配置
   * @param {Object} aiConfig - AI配置
   */
  async setAIConfig(aiConfig) {
    await this.setConfig('ai', aiConfig)
  }
  
  /**
   * 获取UI配置
   * @returns {Object} UI配置
   */
  getUIConfig() {
    return this.getConfig('ui')
  }
  
  /**
   * 设置UI配置
   * @param {Object} uiConfig - UI配置
   */
  async setUIConfig(uiConfig) {
    await this.setConfig('ui', uiConfig)
  }
  
  /**
   * 检查配置是否已修改
   * @returns {boolean} 是否已修改
   */
  isConfigModified() {
    const defaultConfigStr = JSON.stringify(DEFAULT_CONFIG)
    const currentConfigStr = JSON.stringify(this.config)
    return defaultConfigStr !== currentConfigStr
  }
  
  /**
   * 获取配置版本
   * @returns {string} 配置版本
   */
  getConfigVersion() {
    return this.config.storage?.version || '1.0.0'
  }
  
  /**
   * 迁移配置（用于版本升级）
   * @param {string} fromVersion - 源版本
   * @param {string} toVersion - 目标版本
   */
  async migrateConfig(fromVersion, toVersion) {
    console.log(`配置迁移: ${fromVersion} -> ${toVersion}`)
    
    // 这里可以添加具体的迁移逻辑
    // 例如：重命名配置项、添加新的默认值等
    
    // 更新版本号
    await this.setConfig('storage.version', toVersion)
  }
}