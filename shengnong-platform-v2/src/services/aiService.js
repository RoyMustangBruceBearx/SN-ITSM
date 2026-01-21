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
      apiKey: '',
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
    // 构建消息数组
    const messages = [
      ...context,
      { role: 'user', content: message }
    ]
    
    // 构建请求数据，遵循 OpenWebUI API 规范
    const requestData = {
      model: this.config.model,  // 使用配置中的模型ID
      messages,
      stream: options.stream !== false,  // 默认使用流式
      ...options
    }
    
    // 添加可选参数（如果配置中有）
    if (this.config.maxTokens) {
      requestData.max_tokens = this.config.maxTokens
    }
    
    if (this.config.temperature !== undefined) {
      requestData.temperature = this.config.temperature
    }
    
    // 支持其他 OpenWebUI 参数
    if (options.top_p !== undefined) {
      requestData.top_p = options.top_p
    }
    
    if (options.frequency_penalty !== undefined) {
      requestData.frequency_penalty = options.frequency_penalty
    }
    
    if (options.presence_penalty !== undefined) {
      requestData.presence_penalty = options.presence_penalty
    }
    
    if (options.stop) {
      requestData.stop = options.stop
    }
    
    // 支持 RAG 功能（文件和知识库）
    if (options.files && Array.isArray(options.files)) {
      requestData.files = options.files
    }
    
    console.log('构建请求数据:', {
      model: requestData.model,
      messagesCount: messages.length,
      stream: requestData.stream,
      hasFiles: !!requestData.files
    })
    
    return requestData
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
        const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: this.getHeaders(),
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
        
        if (done) {
          console.log('流式响应结束，总内容长度:', fullContent.length)
          break
        }
        
        // 解码数据块
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // 保留最后一行（可能不完整）
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine === '') continue
          
          // 处理 SSE 格式：data: {...}
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6).trim()
            
            // 检查是否是结束信号
            if (data === '[DONE]') {
              console.log('收到 [DONE] 信号')
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
              
              // 支持多种响应格式
              let content = null
              
              // OpenWebUI/OpenAI 格式：choices[0].delta.content
              if (parsed.choices?.[0]?.delta?.content) {
                content = parsed.choices[0].delta.content
              }
              // 备用格式：choices[0].message.content
              else if (parsed.choices?.[0]?.message?.content) {
                content = parsed.choices[0].message.content
              }
              // 直接内容格式
              else if (parsed.content) {
                content = parsed.content
              }
              // Ollama 格式：response
              else if (parsed.response) {
                content = parsed.response
              }
              
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
              
              // 检查是否完成（某些 API 使用 done 字段）
              if (parsed.done === true) {
                console.log('收到 done=true 信号')
                if (onComplete) {
                  onComplete(fullContent)
                }
                
                eventBus.emit('ai:complete', {
                  requestId,
                  content: fullContent
                })
                
                return fullContent
              }
              
            } catch (parseError) {
              console.warn('解析流式数据失败:', parseError.message)
              console.debug('原始数据:', data)
            }
          }
          // 处理非 SSE 格式的 JSON 行
          else if (trimmedLine.startsWith('{')) {
            try {
              const parsed = JSON.parse(trimmedLine)
              
              let content = null
              if (parsed.choices?.[0]?.delta?.content) {
                content = parsed.choices[0].delta.content
              } else if (parsed.response) {
                content = parsed.response
              }
              
              if (content) {
                fullContent += content
                
                if (onStream) {
                  onStream(content, fullContent)
                }
              }
              
              if (parsed.done === true) {
                if (onComplete) {
                  onComplete(fullContent)
                }
                return fullContent
              }
              
            } catch (parseError) {
              console.warn('解析 JSON 行失败:', parseError.message)
            }
          }
        }
      }
      
      // 如果没有收到明确的结束信号，也要触发完成事件
      if (fullContent && onComplete) {
        console.log('流结束但未收到结束信号，触发完成事件')
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
        const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ ...requestData, stream: false }),
          signal: AbortSignal.timeout(this.config.timeout)
        })
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error('API 错误响应:', errorText)
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        return res
      }, this.config.maxRetries)
      
      const data = await response.json()
      console.log('同步请求响应:', data)
      
      // 支持多种响应格式提取内容
      let content = ''
      
      // OpenWebUI/OpenAI 格式：choices[0].message.content
      if (data.choices?.[0]?.message?.content) {
        content = data.choices[0].message.content
      }
      // 备用格式：choices[0].text
      else if (data.choices?.[0]?.text) {
        content = data.choices[0].text
      }
      // 直接内容格式
      else if (data.content) {
        content = data.content
      }
      // Ollama 格式：response
      else if (data.response) {
        content = data.response
      }
      // 消息格式
      else if (data.message?.content) {
        content = data.message.content
      }
      
      if (!content) {
        console.warn('无法从响应中提取内容:', data)
        throw new Error('API 返回的响应格式不正确')
      }
      
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
    
    // 超时错误
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      message = '请求超时，请检查网络连接或增加超时时间'
    }
    // 网络错误
    else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      message = ERROR_MESSAGES.NETWORK_ERROR + '，请检查API地址是否正确'
    }
    // HTTP 状态码错误
    else if (error.message.includes('HTTP 400')) {
      message = '请求参数错误，请检查模型ID和其他配置'
    }
    else if (error.message.includes('HTTP 401')) {
      message = 'API密钥无效或已过期，请重新配置'
    }
    else if (error.message.includes('HTTP 403')) {
      message = '访问被拒绝，请检查API密钥权限'
    }
    else if (error.message.includes('HTTP 404')) {
      message = 'API端点不存在，请检查API地址配置'
    }
    else if (error.message.includes('HTTP 429')) {
      message = '请求过于频繁，请稍后重试'
    }
    else if (error.message.includes('HTTP 500')) {
      message = ERROR_MESSAGES.API_ERROR + '，服务器内部错误'
    }
    else if (error.message.includes('HTTP 502')) {
      message = '网关错误，API服务可能暂时不可用'
    }
    else if (error.message.includes('HTTP 503')) {
      message = '服务暂时不可用，请稍后重试'
    }
    // 其他错误
    else if (error.message) {
      message = error.message
    }
    
    const processedError = new Error(message)
    processedError.originalError = error
    processedError.timestamp = new Date().toISOString()
    
    // 记录详细错误信息
    console.error('AI服务错误:', {
      message,
      originalError: error.message,
      stack: error.stack,
      timestamp: processedError.timestamp
    })
    
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
   * 发送带文件的消息（RAG功能）
   * @param {string} message - 用户消息
   * @param {Array} files - 文件列表 [{type: 'file'|'collection', id: string}]
   * @param {Object} options - 选项
   * @returns {Promise<string>} AI回复
   */
  async sendMessageWithFiles(message, files, options = {}) {
    return this.sendMessage(message, {
      ...options,
      files
    })
  }
  
  /**
   * 发送带知识库的消息
   * @param {string} message - 用户消息
   * @param {string} collectionId - 知识库ID
   * @param {Object} options - 选项
   * @returns {Promise<string>} AI回复
   */
  async sendMessageWithCollection(message, collectionId, options = {}) {
    return this.sendMessage(message, {
      ...options,
      files: [{ type: 'collection', id: collectionId }]
    })
  }
  
  /**
   * 获取请求头
   * @returns {Object} 请求头
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }
    
    return headers
  }
  
  /**
   * 验证 API 连接并获取模型列表
   * @param {string} baseUrl - API 地址
   * @param {string} apiKey - API 密钥
   * @returns {Promise<Object>} {success: boolean, models: Array, error: string}
   */
  async validateAndGetModels(baseUrl, apiKey) {
    try {
      console.log('验证API连接:', baseUrl)
      
      const response = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        signal: AbortSignal.timeout(10000)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('API返回的模型数据:', data)
      
      // 提取id和name，返回格式化的模型列表
      let models = []
      if (data.data && Array.isArray(data.data)) {
        models = data.data.map(model => ({
          id: model.id,
          name: model.name || model.id
        }))
      } else if (Array.isArray(data)) {
        models = data.map(model => ({
          id: model.id,
          name: model.name || model.id
        }))
      }
      
      console.log('解析后的模型列表:', models)
      
      if (models.length === 0) {
        return {
          success: false,
          models: [],
          error: 'API返回的模型列表为空'
        }
      }
      
      return {
        success: true,
        models,
        error: null
      }
      
    } catch (error) {
      console.error('验证API连接失败:', error)
      
      let errorMessage = '连接失败'
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = '连接超时，请检查API地址是否正确'
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = '网络错误，无法连接到API服务器'
      } else if (error.message.includes('HTTP 401')) {
        errorMessage = 'API密钥无效，请检查密钥是否正确'
      } else if (error.message.includes('HTTP 403')) {
        errorMessage = '访问被拒绝，请检查API密钥权限'
      } else if (error.message.includes('HTTP 404')) {
        errorMessage = 'API地址不正确，未找到模型接口'
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = 'API服务器错误'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return {
        success: false,
        models: [],
        error: errorMessage
      }
    }
  }
  
  /**
   * 获取模型列表
   * @returns {Promise<Array>} 模型列表 [{id, name}]
   */
  async getModels() {
    try {
      console.log('正在从API获取模型列表:', `${this.config.baseUrl}/models`)
      
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: 'GET',
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('API返回的模型数据:', data)
      
      // 提取id和name，返回格式化的模型列表
      if (data.data && Array.isArray(data.data)) {
        const models = data.data.map(model => ({
          id: model.id,
          name: model.name || model.id
        }))
        console.log('解析后的模型列表:', models)
        return models
      }
      
      // 如果data本身就是数组
      if (Array.isArray(data)) {
        const models = data.map(model => ({
          id: model.id,
          name: model.name || model.id
        }))
        console.log('解析后的模型列表:', models)
        return models
      }
      
      console.warn('API返回的数据格式不正确')
      return []
      
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