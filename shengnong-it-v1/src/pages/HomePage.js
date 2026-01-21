/**
 * 首页组件 - 神农集团信息数字化平台
 * 基于 www.ynsnjt.cn 内容定制
 */

import { PLATFORM_SYSTEMS, SYSTEM_LIST, HISTORY_SYSTEMS, SYSTEM_CATEGORIES, SYSTEM_INFO, CONTACT_INFO, SYSTEM_LIST_TYPES, LIST_CONFIG } from '../utils/constants.js'
import { eventBus } from '../utils/eventBus.js'
import { debounce } from '../utils/helpers.js'

export class HomePage {
  constructor() {
    // 当前清单类型 - 默认显示系统清单
    this.currentListType = SYSTEM_LIST_TYPES.SYSTEM
    
    // 系统数据
    this.allSystems = {
      [SYSTEM_LIST_TYPES.PLATFORM]: [...PLATFORM_SYSTEMS],
      [SYSTEM_LIST_TYPES.SYSTEM]: [...SYSTEM_LIST],
      [SYSTEM_LIST_TYPES.HISTORY]: [...HISTORY_SYSTEMS]
    }
    
    this.systems = [...this.allSystems[this.currentListType]]
    this.filteredSystems = [...this.systems]
    this.currentViewMode = 'grid'
    this.searchQuery = ''
    this.statsTimer = null
    this.aiSidebarOpen = false
    
    this.container = null
    this.searchInput = null
    
    // 防抖搜索
    this.debouncedSearch = debounce(this.filterSystems.bind(this), 300)
  }
  
  /**
   * 初始化组件
   */
  async init() {
    this.bindEvents()
  }
  
  /**
   * 渲染组件
   * @param {HTMLElement} container - 容器元素
   */
  render(container) {
    this.container = container
    
    container.innerHTML = `
      <div class="container">
        <!-- 融合的头部和控制面板 -->
        <div class="unified-header">
          <!-- 顶部信息区域 -->
          <div class="header-content">
            <h1><i class="fas fa-building"></i> ${SYSTEM_INFO.name}</h1>
            
            <div class="stats-bar">
              <div class="stat-item">
                <i class="fas fa-user-friends"></i>
                <span>在线用户: <span id="onlineUsers">89</span></span>
              </div>
              <div class="stat-item">
                <i class="fas fa-chart-bar"></i>
                <span>今日访问: <span id="todayVisits">1256</span></span>
              </div>
              <div class="stat-item">
                <i class="fas fa-globe-americas"></i>
                <span>总访问量: <span id="totalVisits">856789</span></span>
              </div>
              <div class="stat-item">
                <i class="fas fa-heartbeat"></i>
                <span>系统状态: <span style="color: #228B22; font-weight: 600;">正常</span></span>
              </div>
            </div>
          </div>

          <!-- 清单切换标签 -->
          <div class="list-tabs">
            <button class="tab-btn ${this.currentListType === SYSTEM_LIST_TYPES.SYSTEM ? 'active' : ''}" 
                    data-list-type="${SYSTEM_LIST_TYPES.SYSTEM}">
              <i class="fas fa-list"></i> 系统
            </button>
            <button class="tab-btn ${this.currentListType === SYSTEM_LIST_TYPES.PLATFORM ? 'active' : ''}" 
                    data-list-type="${SYSTEM_LIST_TYPES.PLATFORM}">
              <i class="fas fa-layer-group"></i> 平台
            </button>
            ${this.currentListType === SYSTEM_LIST_TYPES.HISTORY ? `
            <button class="tab-btn active" data-list-type="${SYSTEM_LIST_TYPES.HISTORY}">
              <i class="fas fa-history"></i> 历史系统
            </button>
            ` : ''}
          </div>
          
          <!-- 搜索和视图控制 -->
          <div class="search-and-view">
            <div class="search-box">
              <input type="text"
                     placeholder="搜索系统、功能..."
                     id="searchInput">
              <button id="searchBtn"><i class="fas fa-search"></i></button>
            </div>
            <div class="view-controls">
              <button class="view-btn active" id="gridBtn" title="网格视图">
                <i class="fas fa-th-large"></i>
              </button>
              <button class="view-btn" id="listBtn" title="列表视图">
                <i class="fas fa-list-ul"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 系统列表 -->
        <div class="systems-container" id="systemsContainer">
          <div class="systems-grid" id="systemsGrid">
            <!-- 系统卡片将通过JavaScript动态生成 -->
          </div>
          <div class="no-results" id="noResults" style="display: none;">
            <i class="fas fa-search-minus"></i>
            <h3>未找到相关系统</h3>
            <p>请尝试其他关键词</p>
          </div>
        </div>

        <!-- 页脚 -->
        <footer class="footer">
          <div class="footer-info">
            <div class="footer-item">
              <i class="fas fa-industry"></i>
              <span>${SYSTEM_INFO.department}</span>
            </div>
            <div class="footer-item">
              <i class="fas fa-phone-volume"></i>
              <span>技术支持: ${CONTACT_INFO.phone}</span>
            </div>
            <div class="footer-item">
              <i class="fas fa-envelope-open-text"></i>
              <span>${CONTACT_INFO.email}</span>
            </div>
            <div class="footer-item">
              <i class="fas fa-clock"></i>
              <span>最后更新: <span id="lastUpdateTime"></span></span>
            </div>
          </div>
          <p>&copy; <span id="currentYear"></span> ${SYSTEM_INFO.company} | 版权所有 | ${SYSTEM_INFO.icp}</p>
        </footer>
      </div>

      <!-- AI助手浮动按钮 -->
      <div class="ai-assistant">
        <button class="ai-button" id="aiButton">
          <div class="pig-emoji">🤖</div>
          <div class="ai-bubble">我是IT助手</div>
        </button>
      </div>

      <!-- AI对话侧边栏容器 -->
      <div id="aiSidebarContainer"></div>
    `
    
    // 获取DOM元素引用
    this.getDOMReferences()
    
    // 绑定DOM事件
    this.bindDOMEvents()
    
    // 渲染系统列表
    this.renderSystems()
    
    // 启动统计更新
    this.startStatsUpdate()
    
    // 更新最后更新时间
    this.updateLastUpdateTime()
  }
  
  /**
   * 获取DOM元素引用
   */
  getDOMReferences() {
    this.searchInput = this.container.querySelector('#searchInput')
    this.systemsGrid = this.container.querySelector('#systemsGrid')
    this.noResults = this.container.querySelector('#noResults')
    this.systemsContainer = this.container.querySelector('#systemsContainer')
  }
  
  /**
   * 绑定DOM事件
   */
  bindDOMEvents() {
    // 清单切换事件
    const tabBtns = this.container.querySelectorAll('.tab-btn')
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const listType = e.currentTarget.dataset.listType
        this.switchList(listType)
      })
    })
    
    // 搜索事件
    this.searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value
      this.debouncedSearch()
    })
    
    this.searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.filterSystems()
      }
    })
    
    // 搜索按钮
    this.container.querySelector('#searchBtn')?.addEventListener('click', () => {
      this.filterSystems()
    })
    
    // 视图切换
    this.container.querySelector('#gridBtn')?.addEventListener('click', () => {
      this.setViewMode('grid')
    })
    
    this.container.querySelector('#listBtn')?.addEventListener('click', () => {
      this.setViewMode('list')
    })
    
    // AI助手按钮
    this.container.querySelector('#aiButton')?.addEventListener('click', () => {
      this.toggleAISidebar()
    })
  }
  
  /**
   * 切换系统清单
   * @param {string} listType - 清单类型
   */
  switchList(listType) {
    if (this.currentListType === listType) return
    
    this.currentListType = listType
    this.systems = [...this.allSystems[listType]]
    this.filteredSystems = [...this.systems]
    
    // 清空搜索
    if (this.searchInput) {
      this.searchInput.value = ''
      this.searchQuery = ''
    }
    
    // 重新渲染页面
    this.render(this.container)
  }
  
  /**
   * 绑定全局事件
   */
  bindEvents() {
    eventBus.on('app:initialized', () => {
      console.log('应用初始化完成')
    })
  }
  
  /**
   * 获取系统卡片的渐变色
   * @param {number} index - 系统索引
   * @param {string} category - 系统分类
   * @returns {string} 渐变色CSS
   */
  getSystemGradient(index, category) {
    const gradients = [
      'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
      'linear-gradient(135deg, rgba(240, 147, 251, 0.3) 0%, rgba(245, 87, 108, 0.3) 100%)',
      'linear-gradient(135deg, rgba(79, 172, 254, 0.3) 0%, rgba(0, 242, 254, 0.3) 100%)',
      'linear-gradient(135deg, rgba(67, 233, 123, 0.3) 0%, rgba(56, 249, 215, 0.3) 100%)',
      'linear-gradient(135deg, rgba(250, 112, 154, 0.3) 0%, rgba(254, 225, 64, 0.3) 100%)',
      'linear-gradient(135deg, rgba(168, 237, 234, 0.4) 0%, rgba(254, 214, 227, 0.4) 100%)',
      'linear-gradient(135deg, rgba(255, 154, 158, 0.3) 0%, rgba(254, 207, 239, 0.3) 100%)',
      'linear-gradient(135deg, rgba(255, 236, 210, 0.4) 0%, rgba(252, 182, 159, 0.4) 100%)',
      'linear-gradient(135deg, rgba(161, 140, 209, 0.3) 0%, rgba(251, 194, 235, 0.3) 100%)',
      'linear-gradient(135deg, rgba(250, 208, 196, 0.4) 0%, rgba(255, 209, 255, 0.4) 100%)',
      'linear-gradient(135deg, rgba(255, 234, 167, 0.4) 0%, rgba(250, 177, 160, 0.4) 100%)',
      'linear-gradient(135deg, rgba(116, 185, 255, 0.3) 0%, rgba(9, 132, 227, 0.3) 100%)',
      'linear-gradient(135deg, rgba(253, 121, 168, 0.3) 0%, rgba(253, 203, 110, 0.3) 100%)',
      'linear-gradient(135deg, rgba(108, 92, 231, 0.3) 0%, rgba(162, 155, 254, 0.3) 100%)',
      'linear-gradient(135deg, rgba(0, 184, 148, 0.3) 0%, rgba(0, 206, 201, 0.3) 100%)'
    ]
    
    // 根据分类和索引选择渐变色
    const categoryIndex = Object.keys(SYSTEM_CATEGORIES).indexOf(category)
    const gradientIndex = (categoryIndex * 3 + index) % gradients.length
    return gradients[gradientIndex]
  }
  
  /**
   * 渲染系统列表
   */
  renderSystems(filteredSystems = null) {
    const systemsToRender = filteredSystems || this.systems
    
    this.systemsGrid.innerHTML = ''
    
    if (systemsToRender.length === 0) {
      this.noResults.style.display = 'block'
      return
    } else {
      this.noResults.style.display = 'none'
    }
    
    systemsToRender.forEach((system, index) => {
      const systemCard = document.createElement('div')
      systemCard.className = 'system-card'
      systemCard.onclick = () => this.openSystem(system)
      
      const category = SYSTEM_CATEGORIES[system.category] || { name: '其他', color: '#999999' }
      const isHistoryEntry = system.isHistoryEntry
      const statusColor = system.status === '正常运行' ? '#27ae60' : 
                         system.status === '维护中' ? '#f39c12' :
                         system.status === '部分运行' ? '#e67e22' : '#e74c3c'
      
      // 获取渐变色
      const gradient = this.getSystemGradient(index, system.category)
      
      systemCard.innerHTML = `
        <button class="favorite-btn ${system.favorited ? 'favorited' : ''}"
                onclick="event.stopPropagation()">
          <i class="fas fa-star"></i>
        </button>
        ${isHistoryEntry ? '<div class="history-badge"><i class="fas fa-arrow-right"></i></div>' : ''}
        <div class="system-content">
          <div class="system-icon" style="color: ${category.color}">
            <i class="${system.icon}"></i>
          </div>
          <h3 class="system-title">${system.name}</h3>
          <p class="system-desc">${system.description}</p>
          <div class="system-category" style="background-color: ${category.color}20; color: ${category.color}">
            <i class="${category.icon}"></i>
            <span>${category.name}</span>
          </div>
          <div class="system-status" style="color: ${statusColor}">
            <i class="fas fa-circle"></i>
            <span>${system.status}</span>
          </div>
        </div>
      `
      
      // 绑定收藏按钮事件
      const favoriteBtn = systemCard.querySelector('.favorite-btn')
      favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.toggleFavorite(system.id)
      })
      
      this.systemsGrid.appendChild(systemCard)
    })
  }
  
  /**
   * 筛选系统
   */
  filterSystems() {
    const searchQuery = this.searchInput.value.toLowerCase().trim()
    
    if (!searchQuery) {
      this.renderSystems()
      return
    }
    
    const filteredSystems = this.systems.filter(system =>
      system.name.toLowerCase().includes(searchQuery) ||
      system.description.toLowerCase().includes(searchQuery) ||
      SYSTEM_CATEGORIES[system.category]?.name.toLowerCase().includes(searchQuery)
    )
    
    this.renderSystems(filteredSystems)
  }
  
  /**
   * 切换收藏状态
   */
  toggleFavorite(systemId) {
    const system = this.systems.find(s => s.id === systemId)
    if (system) {
      system.favorited = !system.favorited
      this.updateFavorites()
      this.renderSystems()
    }
  }
  
  /**
   * 更新收藏列表
   */
  updateFavorites() {
    const favorites = this.systems.filter(s => s.favorited).map(s => s.id)
    console.log('收藏列表更新:', favorites)
  }
  
  /**
   * 打开系统
   */
  openSystem(system) {
    this.recordAccess(system)
    
    // 如果是历史系统入口，切换到历史系统清单
    if (system.isHistoryEntry) {
      this.switchList(SYSTEM_LIST_TYPES.HISTORY)
      return
    }
    
    if (system.url && system.url !== '#') {
      window.open(system.url, '_blank')
    } else {
      alert(`即将打开 ${system.name}`)
    }
  }
  
  /**
   * 记录访问
   */
  recordAccess(system) {
    const accessLog = {
      systemId: system.id,
      systemName: system.name,
      timestamp: new Date(),
      userAgent: navigator.userAgent
    }
    
    console.log('访问记录:', accessLog)
    
    // 更新访问统计
    const todayVisitsEl = this.container.querySelector('#todayVisits')
    const totalVisitsEl = this.container.querySelector('#totalVisits')
    
    if (todayVisitsEl) {
      todayVisitsEl.textContent = parseInt(todayVisitsEl.textContent) + 1
    }
    if (totalVisitsEl) {
      totalVisitsEl.textContent = parseInt(totalVisitsEl.textContent) + 1
    }
  }
  
  /**
   * 设置视图模式
   */
  setViewMode(mode) {
    this.currentViewMode = mode
    const gridBtn = this.container.querySelector('#gridBtn')
    const listBtn = this.container.querySelector('#listBtn')
    
    if (mode === 'list') {
      this.systemsContainer.classList.add('list-view')
      gridBtn.classList.remove('active')
      listBtn.classList.add('active')
    } else {
      this.systemsContainer.classList.remove('list-view')
      gridBtn.classList.add('active')
      listBtn.classList.remove('active')
    }
  }
  
  /**
   * 启动统计更新
   */
  startStatsUpdate() {
    this.statsTimer = setInterval(() => {
      const onlineUsersEl = this.container.querySelector('#onlineUsers')
      const todayVisitsEl = this.container.querySelector('#todayVisits')
      const totalVisitsEl = this.container.querySelector('#totalVisits')
      
      if (onlineUsersEl) {
        const currentUsers = parseInt(onlineUsersEl.textContent)
        const change = Math.floor(Math.random() * 6) - 3
        onlineUsersEl.textContent = Math.max(50, currentUsers + change)
      }
      
      if (Math.random() > 0.8) {
        if (todayVisitsEl) {
          todayVisitsEl.textContent = parseInt(todayVisitsEl.textContent) + 1
        }
        if (totalVisitsEl) {
          totalVisitsEl.textContent = parseInt(totalVisitsEl.textContent) + 1
        }
      }
    }, 15000)
  }
  
  /**
   * 更新最后更新时间
   */
  updateLastUpdateTime() {
    const now = new Date()
    const timeStr = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    const lastUpdateTimeEl = this.container.querySelector('#lastUpdateTime')
    if (lastUpdateTimeEl) {
      lastUpdateTimeEl.textContent = timeStr
    }
    
    // 更新版权年份
    const currentYearEl = this.container.querySelector('#currentYear')
    if (currentYearEl) {
      currentYearEl.textContent = now.getFullYear()
    }
  }
  
  /**
   * AI助手功能
   */
  toggleAISidebar() {
    if (this.aiSidebarOpen) {
      this.closeAISidebar()
    } else {
      this.openAISidebar()
    }
  }
  
  /**
   * 打开AI侧边栏
   */
  openAISidebar() {
    if (this.aiSidebarOpen) return
    
    const aiSidebar = document.createElement('div')
    aiSidebar.className = 'ai-sidebar'
    aiSidebar.id = 'aiSidebar'
    
    aiSidebar.innerHTML = `
      <div class="ai-header">
        <div class="ai-avatar">
          <div class="avatar-icon">🤖</div>
          <div class="ai-info">
            <h3>IT智能助手</h3>
            <div class="status">在线中</div>
          </div>
        </div>
        <button id="closeAISidebarBtn" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="ai-content">
        <div class="welcome-message">
          <div class="welcome-icon">🤖</div>
          <h3>IT智能助手</h3>
          <p>您好！我是神农集团IT智能助手<br>很高兴为您服务！</p>
          
          <div class="quick-actions">
            <button class="action-btn" onclick="alert('系统状态查询功能开发中')">
              <i class="fas fa-heartbeat"></i> 系统状态
            </button>
            <button class="action-btn" onclick="alert('技术支持功能开发中')">
              <i class="fas fa-headset"></i> 技术支持
            </button>
            <button class="action-btn" id="openAIWindowBtn">
              <i class="fas fa-external-link-alt"></i> 独立窗口
            </button>
          </div>
          
          <div class="help-tip">
            <strong>提示：</strong>您可以向我咨询IT系统相关问题
          </div>
        </div>
      </div>
    `
    
    // 绑定事件
    setTimeout(() => {
      aiSidebar.querySelector('#closeAISidebarBtn')?.addEventListener('click', () => {
        this.closeAISidebar()
      })
      
      aiSidebar.querySelector('#openAIWindowBtn')?.addEventListener('click', () => {
        this.openAIWindow()
      })
    }, 100)
    
    this.container.querySelector('#aiSidebarContainer').appendChild(aiSidebar)
    
    // 显示侧边栏
    setTimeout(() => {
      aiSidebar.classList.add('show')
    }, 50)
    
    this.aiSidebarOpen = true
  }
  
  /**
   * 关闭AI侧边栏
   */
  closeAISidebar() {
    const aiSidebar = this.container.querySelector('#aiSidebar')
    
    if (aiSidebar) {
      aiSidebar.classList.remove('show')
      setTimeout(() => {
        aiSidebar.remove()
      }, 400)
    }
    
    this.aiSidebarOpen = false
  }
  
  /**
   * 打开AI独立窗口
   */
  openAIWindow() {
    console.log('请求导航到AI助手页面')
    eventBus.emit('app:navigate', '/ai-assistant')
  }
  
  /**
   * 销毁组件
   */
  destroy() {
    // 清理定时器
    if (this.statsTimer) {
      clearInterval(this.statsTimer)
    }
    
    // 移除事件监听
    eventBus.off('navigate')
    
    // 清空容器
    if (this.container) {
      this.container.innerHTML = ''
    }
  }
}