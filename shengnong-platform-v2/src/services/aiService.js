/**
 * AI服务
 * 负责与AI API的通信和数据处理
 */

import { API_ENDPOINTS, ERROR_MESSAGES } from '../utils/constants.js'
import { eventBus } from '../utils/eventBus.js'
import { retry } from '../utils/helpers.js'

export class AIService {
  constructor(config = {}) {
    this.config = {
      baseUrl: 'http://47.236.87.251:3000/api',
      model: 'qwen2.5:7b',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 30000,
      maxRetries: 3,
      ...config
    }
    
    this.isConnected = false
    this.requestId = 0
  }
  
  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    console.log('AI服务配置已更新:', this.config)
  }
  
  /**
   * 检查连接状态
   * @returns {Promise<boolean>} 连接状态
   */
  async checkConnection() {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000
      })
      
      this.isConnected = response.ok
      return this.isConnected
      
    } catch (error) {
      console.error('连接检查失败:', error)
      this.isConnected = false
      return false
    }
  }
  
  /**
   * 发送消息
   * @param {string} message - 用户消息
   * @param {Object} options - 选项
   * @returns {Promise<string>} AI回复
   */
  async sendMessage(message, options = {}) {
    const {
      context = [],
      stream = true,
      onStream = null,
      onComplete = null,
      onError = null
    } = options
    
    try {
      // 构建请求数据
      const requestData = this.buildRequestData(message, context, { stream })
      
      // 发送请求
      if (stream && onStream) {
        return await this.sendStreamRequest(requestData, { onStream, onComplete, onError })
      } else {
        return await this.sendSyncRequest(requestData)
      }
      
    } catch (error) {
      console.error('发送消息失败:', error)
      
      if (onError) {
        onError(error)
      }
      
      eventBus.emit('ai:error', { error, message })
      throw error
    }
  }
  
  /**
   * 构建请求数据
   * @param {string} message - 用户消息
   * @param {Array} context - 上下文消息
   * @param {Object} options - 选项
   * @returns {Object} 请求数据
   */
  buildRequestData(message, context, options = {}) {
    const messages = [
      ...context,
      { role: 'user', content: message }
    ]
    
    return {
      model: this.config.model,
      messages,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      stream: options.stream || false,
      ...options
    }
  }
  
  /**
   * 发送流式请求
   * @param {Object} requestData - 请求数据
   * @param {Object} callbacks - 回调函数
   * @returns {Promise<string>} 完整回复
   */
  async sendStreamRequest(requestData, callbacks = {}) {
    const { onStream, onComplete, onError } = callbacks
    const requestId = ++this.requestId
    
    try {
      const response = await retry(async () => {
        const res = await fetch(`${this.config.baseUrl}${API_ENDPOINTS.CHAT}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : undefined
          },
          body: JSON.stringify(requestData),
          signal: AbortSignal.timeout(this.config.timeout)
        })
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        return res
      }, this.config.maxRetries)
      
      return await this.processStreamResponse(response, requestId, { onStream, onComplete, onError })
      
    } catch (error) {
      console.error('流式请求失败:', error)
      
      if (onError) {
        onError(error)
      }
      
      throw this.handleError(error)
    }
  }
  
  /**
   * 处理流式响应
   * @param {Response} response - 响应对象
   * @param {number} requestId - 请求ID
   * @param {Object} callbacks - 回调函数
   * @returns {Promise<string>} 完整回复
   */
  async processStreamResponse(response, requestId, callbacks = {}) {
    const { onStream, onComplete, onError } = callbacks
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let buffer = ''
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // 保留最后一行（可能不完整）
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.trim() === '') continue
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              // 流结束
              if (onComplete) {
                onComplete(fullContent)
              }
              
              eventBus.emit('ai:complete', {
                requestId,
                content: fullContent
              })
              
              return fullContent
            }
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              
              if (content) {
                fullContent += content
                
                if (onStream) {
                  onStream(content, fullContent)
                }
                
                eventBus.emit('ai:stream', {
                  requestId,
                  chunk: content,
                  fullContent
                })
              }
              
            } catch (parseError) {
              console.warn('解析流式数据失败:', parseError, data)
            }
          }
        }
      }
      
      // 如果没有收到[DONE]信号，也要触发完成事件
      if (onComplete) {
        onComplete(fullContent)
      }
      
      eventBus.emit('ai:complete', {
        requestId,
        content: fullContent
      })
      
      return fullContent
      
    } catch (error) {
      console.error('处理流式响应失败:', error)
      
      if (onError) {
        onError(error)
      }
      
      throw error
      
    } finally {
      reader.releaseLock()
    }
  }
  
  /**
   * 发送同步请求
   * @param {Object} requestData - 请求数据
   * @returns {Promise<string>} AI回复
   */
  async sendSyncRequest(requestData) {
    try {
      const response = await retry(async () => {
        const res = await fetch(`${this.config.baseUrl}${API_ENDPOINTS.CHAT}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : undefined
          },
          body: JSON.stringify({ ...requestData, stream: false }),
          signal: AbortSignal.timeout(this.config.timeout)
        })
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        return res
      }, this.config.maxRetries)
      
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      
      eventBus.emit('ai:complete', {
        requestId: ++this.requestId,
        content
      })
      
      return content
      
    } catch (error) {
      console.error('同步请求失败:', error)
      throw this.handleError(error)
    }
  }
  
  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @returns {Error} 处理后的错误
   */
  handleError(error) {
    let message = ERROR_MESSAGES.UNKNOWN_ERROR
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      message = '请求超时，请检查网络连接'
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      message = ERROR_MESSAGES.NETWORK_ERROR
    } else if (error.message.includes('HTTP 401')) {
      message = 'API密钥无效，请检查配置'
    } else if (error.message.includes('HTTP 429')) {
      message = '请求过于频繁，请稍后重试'
    } else if (error.message.includes('HTTP 500')) {
      message = ERROR_MESSAGES.API_ERROR
    } else if (error.message) {
      message = error.message
    }
    
    const processedError = new Error(message)
    processedError.originalError = error
    
    return processedError
  }
  
  /**
   * 取消请求
   * @param {number} requestId - 请求ID
   */
  cancelRequest(requestId) {
    // 这里可以实现请求取消逻辑
    console.log(`取消请求: ${requestId}`)
    eventBus.emit('ai:cancel', { requestId })
  }
  
  /**
   * 获取模型列表
   * @returns {Promise<Array>} 模型列表
   */
  async getModels() {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : undefined
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.data || []
      
    } catch (error) {
      console.error('获取模型列表失败:', error)
      return []
    }
  }
  
  /**
   * 验证API配置
   * @returns {Promise<boolean>} 验证结果
   */
  async validateConfig() {
    try {
      await this.checkConnection()
      
      if (!this.isConnected) {
        return false
      }
      
      // 发送测试消息
      const testMessage = '你好'
      await this.sendMessage(testMessage, { stream: false })
      
      return true
      
    } catch (error) {
      console.error('配置验证失败:', error)
      return false
    }
  }
  
  /**
   * 获取使用统计
   * @returns {Object} 使用统计
   */
  getUsageStats() {
    // 这里可以实现使用统计逻辑
    return {
      totalRequests: 0,
      totalTokens: 0,
      averageResponseTime: 0
    }
  }
}