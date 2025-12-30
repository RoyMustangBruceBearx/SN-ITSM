/**
 * AI助手页面组件
 * 智能对话和咨询功能
 */

import { eventBus } from '../utils/eventBus.js'
import { AIService } from '../services/aiService.js'
import { ConfigService } from '../services/configService.js'
import { debounce, generateId, formatTime } from '../utils/helpers.js'

export class AIAssistantPage {
  constructor() {
    this.container = null
    this.aiService = null
    this.configService = null
    this.messages = []
    this.isStreaming = false
    this.currentStreamHandler = null
    this.maxHistory = 10
    this.apiSettingsOpen = false
  }
  
  async init() {
    console.log('AI助手页面初始化')
    
    // 初始化服务
    this.configService = new ConfigService()
    await this.configService.loadConfig()
    
    this.aiService = new AIService(this.configService.getConfig('ai'))
    
    // 监听配置变化
    eventBus.on('config:change', this.handleConfigChange.bind(this))
  }
  
  render(container) {
    this.container = container
    
    container.innerHTML = `
      <div class="ai-assistant-page">
        <!-- API设置按钮 -->
        <button class="settings-btn" title="API设置">
          <i class="fas fa-cog"></i>
        </button>

        <!-- API设置面板 -->
        <div class="api-settings" id="apiSettings">
          <h4>API 配置</h4>
          <label for="apiUrl">API地址</label>
          <input type="text" id="apiUrl" placeholder="http://47.236.87.251:3000/api">

          <label for="modelSelect">模型选择</label>
          <select id="modelSelect">
            <option value="qwen2.5:7b">Qwen2.5 7B</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="llama2">Llama 2</option>
          </select>

          <label for="maxTokens">最大令牌数</label>
          <input type="number" id="maxTokens" value="4000" min="100" max="8000">

          <label for="temperature">创造性 (0-1)</label>
          <input type="number" id="temperature" value="0.7" min="0" max="1" step="0.1">

          <button id="saveSettingsBtn">保存设置</button>
        </div>

        <div class="ai-chat-module">
          <div class="ai-chat-area" id="aiChatArea">
            <div class="chat-message">
              <div class="message-avatar ai">🐷</div>
              <div>
                <div class="message-content ai">
                  您好！我是神农晓问，您的专属智能农牧助手！🐷✨<br><br>
                  我可以为您提供专业的农牧业咨询服务，包括生产管理、智慧养殖、数据分析等各个方面的问题。
                </div>
                <div class="message-time">刚刚</div>
              </div>
            </div>
          </div>

          <div class="ai-input-area">
            <div class="quick-replies" id="quickReplies">
              <div class="quick-reply">生产管理系统怎么使用？</div>
              <div class="quick-reply">智慧养殖有哪些功能？</div>
              <div class="quick-reply">如何进行数据分析？</div>
              <div class="quick-reply">系统操作帮助</div>
            </div>
            <div class="input-container">
              <textarea class="ai-input"
                        id="aiInput"
                        placeholder="输入您的问题..."
                        rows="1"></textarea>
              <button class="send-button" id="sendButton">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    
    this.bindEvents()
    this.loadSettings()
  }
  
  bindEvents() {
    if (!this.container) return
    
    // 设置按钮
    const settingsBtn = this.container.querySelector('.settings-btn')
    settingsBtn?.addEventListener('click', () => this.toggleAPISettings())
    
    // 保存设置按钮
    const saveBtn = this.container.querySelector('#saveSettingsBtn')
    saveBtn?.addEventListener('click', () => this.saveSettings())
    
    // 输入框事件
    const input = this.container.querySelector('#aiInput')
    input?.addEventListener('input', (e) => this.autoResize(e.target))
    input?.addEventListener('keypress', (e) => this.handleKeyPress(e))
    
    // 发送按钮
    const sendBtn = this.container.querySelector('#sendButton')
    sendBtn?.addEventListener('click', () => this.sendMessage())
    
    // 快速回复
    const quickReplies = this.container.querySelectorAll('.quick-reply')
    quickReplies.forEach(reply => {
      reply.addEventListener('click', () => {
        const message = reply.textContent
        this.setInputValue(message)
        this.sendMessage()
      })
    })
    
    // 点击外部关闭设置
    document.addEventListener('click', (e) => this.handleOutsideClick(e))
    
    // 全局键盘事件
    document.addEventListener('keydown', (e) => this.handleGlobalKeyPress(e))
  }
  
  handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      this.sendMessage()
    }
  }
  
  handleGlobalKeyPress(event) {
    // Ctrl+K 聚焦输入框
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault()
      const input = this.container?.querySelector('#aiInput')
      input?.focus()
    }
    
    // Ctrl+L 清空对话
    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault()
      if (confirm('确定要清空所有对话吗？')) {
        this.clearMessages()
      }
    }
    
    // Escape 键处理
    if (event.key === 'Escape') {
      if (this.isStreaming && this.aiService) {
        this.aiService.abort?.()
        this.showNotification('对话已取消', 'info')
      } else if (this.apiSettingsOpen) {
        this.closeAPISettings()
      }
    }
  }
  
  handleOutsideClick(event) {
    const apiSettings = this.container?.querySelector('#apiSettings')
    const settingsBtn = this.container?.querySelector('.settings-btn')
    
    if (this.apiSettingsOpen && 
        apiSettings && !apiSettings.contains(event.target) && 
        settingsBtn && !settingsBtn.contains(event.target)) {
      this.closeAPISettings()
    }
  }
  
  toggleAPISettings() {
    this.apiSettingsOpen ? this.closeAPISettings() : this.openAPISettings()
  }
  
  openAPISettings() {
    const apiSettings = this.container?.querySelector('#apiSettings')
    if (apiSettings) {
      apiSettings.classList.add('show')
      this.apiSettingsOpen = true
    }
  }
  
  closeAPISettings() {
    const apiSettings = this.container?.querySelector('#apiSettings')
    if (apiSettings) {
      apiSettings.classList.remove('show')
      this.apiSettingsOpen = false
    }
  }
  
  async saveSettings() {
    try {
      const apiUrl = this.container?.querySelector('#apiUrl')?.value?.trim()
      const model = this.container?.querySelector('#modelSelect')?.value
      const maxTokens = parseInt(this.container?.querySelector('#maxTokens')?.value)
      const temperature = parseFloat(this.container?.querySelector('#temperature')?.value)
      
      if (!apiUrl) {
        throw new Error('请输入API地址')
      }
      
      const aiConfig = {
        baseUrl: apiUrl,
        model,
        maxTokens,
        temperature
      }
      
      await this.configService.setConfig('ai', aiConfig)
      
      // 更新AI服务配置
      if (this.aiService) {
        this.aiService.updateConfig(aiConfig)
      }
      
      this.closeAPISettings()
      this.showNotification('API设置已保存！', 'success')
      
    } catch (error) {
      this.showNotification(error.message, 'error')
    }
  }
  
  loadSettings() {
    const config = this.configService?.getConfig('ai')
    if (!config) return
    
    const elements = {
      '#apiUrl': config.baseUrl,
      '#modelSelect': config.model,
      '#maxTokens': config.maxTokens,
      '#temperature': config.temperature
    }
    
    Object.entries(elements).forEach(([selector, value]) => {
      const element = this.container?.querySelector(selector)
      if (element && value !== undefined) {
        element.value = value
      }
    })
  }
  
  async sendMessage() {
    const input = this.container?.querySelector('#aiInput')
    const message = input?.value?.trim()
    
    if (!message || this.isStreaming) return
    
    try {
      // 添加用户消息
      this.addMessage('user', message)
      this.clearInput()
      
      // 显示输入状态
      this.setStreamingState(true)
      const typingIndicator = this.showTypingIndicator()
      
      // 发送消息到AI服务
      let fullResponse = ''
      
      await this.aiService.sendMessage(message, {
        context: this.getContextForAPI(),
        onStream: (chunk) => {
          if (!this.currentStreamHandler) {
            this.hideTypingIndicator()
            const messageElement = this.createStreamingMessage()
            this.currentStreamHandler = new StreamHandler(messageElement)
          }
          this.currentStreamHandler.addChunk(chunk)
        },
        onComplete: (response) => {
          fullResponse = response
          this.addMessage('assistant', response)
          
          if (this.currentStreamHandler) {
            this.currentStreamHandler.finishTyping()
            this.currentStreamHandler = null
          }
        },
        onError: (error) => {
          this.hideTypingIndicator()
          this.showErrorMessage(error.message, () => {
            this.retryLastMessage()
          })
        }
      })
      
    } catch (error) {
      this.hideTypingIndicator()
      this.showErrorMessage(error.message, () => {
        this.retryLastMessage()
      })
    } finally {
      this.setStreamingState(false)
    }
  }
  
  addMessage(role, content) {
    const message = {
      id: generateId('msg'),
      role,
      content,
      timestamp: new Date()
    }
    
    this.messages.push(message)
    this.trimContext()
    
    this.addMessageToUI(message)
    
    return message
  }
  
  addMessageToUI(message) {
    const chatArea = this.container?.querySelector('#aiChatArea')
    if (!chatArea) return
    
    const messageDiv = document.createElement('div')
    messageDiv.className = 'chat-message' + (message.role === 'user' ? ' user' : '')
    messageDiv.setAttribute('data-message-id', message.id)
    
    const timeStr = formatTime(message.timestamp, 'HH:mm')
    
    if (message.role === 'user') {
      messageDiv.innerHTML = `
        <div class="message-avatar user">👤</div>
        <div>
          <div class="message-content user">${message.content}</div>
          <div class="message-time">${timeStr}</div>
        </div>
      `
    } else {
      messageDiv.innerHTML = `
        <div class="message-avatar ai">🐷</div>
        <div>
          <div class="message-content ai">${this.formatMessage(message.content)}</div>
          <div class="message-time">${timeStr}</div>
        </div>
      `
    }
    
    chatArea.appendChild(messageDiv)
    this.scrollToBottom()
  }
  
  createStreamingMessage() {
    const chatArea = this.container?.querySelector('#aiChatArea')
    if (!chatArea) return null
    
    const messageDiv = document.createElement('div')
    messageDiv.className = 'chat-message'
    
    const timeStr = formatTime(new Date(), 'HH:mm')
    
    messageDiv.innerHTML = `
      <div class="message-avatar ai">🐷</div>
      <div>
        <div class="message-content ai" id="streamingMessage"></div>
        <div class="message-time">${timeStr}</div>
      </div>
    `
    
    chatArea.appendChild(messageDiv)
    this.scrollToBottom()
    
    return messageDiv.querySelector('#streamingMessage')
  }
  
  showTypingIndicator() {
    const chatArea = this.container?.querySelector('#aiChatArea')
    if (!chatArea) return null
    
    const typingDiv = document.createElement('div')
    typingDiv.className = 'chat-message typing-message'
    typingDiv.innerHTML = `
      <div class="message-avatar ai">🐷</div>
      <div>
        <div class="typing-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="typing-text">神农晓问正在思考...</span>
        </div>
      </div>
    `
    
    chatArea.appendChild(typingDiv)
    this.scrollToBottom()
    return typingDiv
  }
  
  hideTypingIndicator() {
    const typingMessage = this.container?.querySelector('.typing-message')
    typingMessage?.remove()
  }
  
  showErrorMessage(errorMessage, retryCallback) {
    const chatArea = this.container?.querySelector('#aiChatArea')
    if (!chatArea) return
    
    const errorDiv = document.createElement('div')
    errorDiv.className = 'chat-message error-message-container'
    errorDiv.innerHTML = `
      <div class="message-avatar ai">🐷</div>
      <div>
        <div class="message-error">
          <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${errorMessage}</span>
            <button class="retry-btn">
              <i class="fas fa-redo"></i> 重试
            </button>
          </div>
        </div>
      </div>
    `
    
    const retryBtn = errorDiv.querySelector('.retry-btn')
    retryBtn?.addEventListener('click', retryCallback)
    
    chatArea.appendChild(errorDiv)
    this.scrollToBottom()
  }
  
  retryLastMessage() {
    // 移除错误消息
    const errorMessages = this.container?.querySelectorAll('.error-message-container')
    errorMessages?.forEach(msg => msg.remove())
    
    // 重试最后一条用户消息
    const lastUserMessage = this.messages[this.messages.length - 1]
    if (lastUserMessage && lastUserMessage.role === 'user') {
      this.messages.pop()
      this.setInputValue(lastUserMessage.content)
      this.sendMessage()
    }
  }
  
  setStreamingState(isStreaming) {
    this.isStreaming = isStreaming
    const sendButton = this.container?.querySelector('#sendButton')
    if (sendButton) {
      sendButton.disabled = isStreaming
      sendButton.innerHTML = isStreaming ? 
        '<i class="fas fa-spinner fa-spin"></i>' : 
        '<i class="fas fa-paper-plane"></i>'
    }
  }
  
  setInputValue(value) {
    const input = this.container?.querySelector('#aiInput')
    if (input) {
      input.value = value
      this.autoResize(input)
    }
  }
  
  clearInput() {
    const input = this.container?.querySelector('#aiInput')
    if (input) {
      input.value = ''
      input.style.height = 'auto'
    }
  }
  
  autoResize(textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
  
  scrollToBottom() {
    const chatArea = this.container?.querySelector('#aiChatArea')
    if (chatArea) {
      chatArea.scrollTop = chatArea.scrollHeight
    }
  }
  
  formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px;">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre style="background: rgba(0,0,0,0.05); padding: 8px; border-radius: 6px; margin: 8px 0; overflow-x: auto;"><code>$1</code></pre>')
      .replace(/\n/g, '<br>')
  }
  
  clearMessages() {
    this.messages = []
    const chatArea = this.container?.querySelector('#aiChatArea')
    if (chatArea) {
      // 只保留欢迎消息
      const welcomeMessage = chatArea.querySelector('.chat-message')
      chatArea.innerHTML = ''
      if (welcomeMessage) {
        chatArea.appendChild(welcomeMessage)
      }
    }
  }
  
  trimContext() {
    while (this.messages.length > this.maxHistory * 2) {
      this.messages.shift()
    }
  }
  
  getContextForAPI() {
    return [
      {
        role: 'system',
        content: '你是神农集团的智能农牧助手"神农晓问"，专门为用户提供农牧业生产、管理、技术等方面的专业咨询和系统操作指导。请用中文回答，语气要友好专业。'
      },
      ...this.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]
  }
  
  handleConfigChange(config) {
    if (config.ai && this.aiService) {
      this.aiService.updateConfig(config.ai)
    }
  }
  
  showNotification(message, type = 'info') {
    eventBus.emit('notification:show', { message, type })
  }
  
  destroy() {
    // 清理事件监听器
    eventBus.off('config:change', this.handleConfigChange.bind(this))
    
    // 中止正在进行的请求
    if (this.aiService) {
      this.aiService.abort?.()
    }
    
    // 清理DOM
    if (this.container) {
      this.container.innerHTML = ''
    }
  }
}

// 流式处理器类
class StreamHandler {
  constructor(messageElement) {
    this.messageElement = messageElement
    this.displayedText = ''
    this.pendingText = ''
    this.isTyping = false
    this.typeSpeed = 20
  }
  
  addChunk(chunk) {
    this.pendingText += chunk
    if (!this.isTyping) {
      this.startTypingEffect()
    }
  }
  
  startTypingEffect() {
    this.isTyping = true
    this._typeNextChar()
  }
  
  _typeNextChar() {
    if (this.pendingText.length === 0) {
      this.isTyping = false
      return
    }
    
    const charsToAdd = Math.min(2, this.pendingText.length)
    const chars = this.pendingText.slice(0, charsToAdd)
    this.pendingText = this.pendingText.slice(charsToAdd)
    
    this.displayedText += chars
    if (this.messageElement) {
      this.messageElement.innerHTML = this._formatMessage(this.displayedText)
    }
    
    setTimeout(() => this._typeNextChar(), this.typeSpeed)
  }
  
  finishTyping() {
    if (this.pendingText.length > 0) {
      this.displayedText += this.pendingText
      this.pendingText = ''
      if (this.messageElement) {
        this.messageElement.innerHTML = this._formatMessage(this.displayedText)
      }
    }
    this.isTyping = false
  }
  
  _formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px;">$1</code>')
      .replace(/\n/g, '<br>')
  }
}