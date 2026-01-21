/**
 * AI助手页面组件
 */

import { eventBus } from '../utils/eventBus.js'

export class AIAssistantPage {
  constructor() {
    this.container = null
  }
  
  /**
   * 初始化组件
   */
  async init() {
    console.log('AI助手页面初始化')
  }
  
  /**
   * 渲染组件
   * @param {HTMLElement} container - 容器元素
   */
  render(container) {
    this.container = container
    
    container.innerHTML = `
      <div class="ai-assistant-page">
        <div class="ai-header">
          <button class="back-btn" id="backBtn">
            <i class="fas fa-arrow-left"></i> 返回首页
          </button>
          <h1><i class="fas fa-robot"></i> IT智能助手</h1>
        </div>
        
        <div class="ai-main">
          <div class="welcome-section">
            <div class="ai-avatar-large">🤖</div>
            <h2>IT智能助手</h2>
            <p>我是神农集团的IT智能助手，可以为您提供系统咨询和技术支持</p>
            
            <div class="feature-grid">
              <div class="feature-card">
                <i class="fas fa-heartbeat"></i>
                <h3>系统监控</h3>
                <p>实时监控系统运行状态</p>
              </div>
              <div class="feature-card">
                <i class="fas fa-question-circle"></i>
                <h3>问题解答</h3>
                <p>解答IT系统使用问题</p>
              </div>
              <div class="feature-card">
                <i class="fas fa-tools"></i>
                <h3>技术支持</h3>
                <p>提供技术支持和指导</p>
              </div>
              <div class="feature-card">
                <i class="fas fa-chart-line"></i>
                <h3>数据分析</h3>
                <p>分析系统使用数据</p>
              </div>
            </div>
            
            <div class="coming-soon">
              <h3>🚧 功能开发中</h3>
              <p>AI助手功能正在开发中，敬请期待！</p>
            </div>
          </div>
        </div>
      </div>
    `
    
    // 绑定事件
    this.bindEvents()
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    const backBtn = this.container.querySelector('#backBtn')
    backBtn?.addEventListener('click', () => {
      eventBus.emit('app:navigate', '/')
    })
  }
  
  /**
   * 销毁组件
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = ''
    }
  }
}