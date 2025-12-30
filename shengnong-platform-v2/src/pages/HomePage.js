/**
 * 首页组件
 * 完全复刻原始snITSM.html的界面效果
 */

import { SYSTEMS, SYSTEM_CATEGORIES } from '../utils/constants.js'
import { eventBus } from '../utils/eventBus.js'
import { debounce } from '../utils/helpers.js'

export class HomePage {
  constructor() {
    this.systems = [
      {
        id: 1,
        name: '生产管理平台',
        description: '畜禽养殖生产过程监控、数据统计分析',
        icon: 'fas fa-chart-area',
        status: '正常运行',
        url: '#',
        favorited: false
      },
      {
        id: 2,
        name: '智慧养殖系统',
        description: '环境监控、自动投喂、健康管理',
        icon: 'fas fa-home',
        status: '正常运行',
        url: '#',
        favorited: true
      },
      {
        id: 3,
        name: '饲料管理系统',
        description: '饲料配方、库存管理、质量追溯',
        icon: 'fas fa-seedling',
        status: '正常运行',
        url: '#',
        favorited: false
      },
      {
        id: 4,
        name: '兽医服务平台',
        description: '动物健康监测、疫病防控、诊疗记录',
        icon: 'fas fa-user-md',
        status: '正常运行',
        url: '#',
        favorited: false
      },
      {
        id: 5,
        name: '智慧物流系统',
        description: '运输调度、路径优化、货物跟踪',
        icon: 'fas fa-shipping-fast',
        status: '正常运行',
        url: '#',
        favorited: true
      },
      {
        id: 6,
        name: '食品安全追溯',
        description: '从养殖到餐桌的全链条质量追溯',
        icon: 'fas fa-shield-virus',
        status: '正常运行',
        url: '#',
        favorited: false
      },
      {
        id: 7,
        name: '财务管理系统',
        description: '成本核算、收支管理、财务分析',
        icon: 'fas fa-coins',
        status: '正常运行',
        url: '#',
        favorited: false
      },
      {
        id: 8,
        name: '人力资源平台',
        description: '员工管理、考勤统计、薪酬计算',
        icon: 'fas fa-user-tie',
        status: '正常运行',
        url: '#',
        favorited: false
      },
      {
        id: 9,
        name: '环保监测系统',
        description: '污染物监测、环保数据上报、治理效果',
        icon: 'fas fa-leaf',
        status: '正常运行',
        url: '#',
        favorited: false
      },
      {
        id: 10,
        name: 'BI数据分析',
        description: '数据可视化、经营分析、决策支持',
        icon: 'fas fa-chart-pie',
        status: '正常运行',
        url: '#',
        favorited: false
      },
      {
        id: 11,
        name: '采购管理平台',
        description: '供应商管理、采购流程、合同管理',
        icon: 'fas fa-handshake',
        status: '正常运行',
        url: '#',
        favorited: false
      },
      {
        id: 12,
        name: '移动办公OA',
        description: '审批流程、文档管理、移动办公',
        icon: 'fas fa-mobile-alt',
        status: '正常运行',
        url: '#',
        favorited: false
      }
    ]
    
    this.filteredSystems = [...this.systems]
    this.currentViewMode = 'grid'
    this.searchQuery = ''
    this.statsTimer = null
    this.aiSidebarOpen = false
    this.isFullscreen = false
    
    this.container = null
    this.searchInput = null
    
    // 防抖搜索
    this.debouncedSearch = debounce(this.filterSystems.bind(this), 300)
  }
  
  /**
   * 初始化组件
   */
  async init() {
    // 绑定事件
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
        <!-- 头部区域 -->
        <header class="header">
          <h1><i class="fas fa-piggy-bank"></i> 神农集团数字化平台</h1>
          <p class="subtitle">现代农牧业 · 智慧管理 · 数字未来</p>
          <div class="stats-bar">
            <div class="stat-item">
              <i class="fas fa-user-friends"></i>
              <span>在线用户: <span id="onlineUsers">156</span></span>
            </div>
            <div class="stat-item">
              <i class="fas fa-chart-bar"></i>
              <span>今日访问: <span id="todayVisits">2847</span></span>
            </div>
            <div class="stat-item">
              <i class="fas fa-globe-americas"></i>
              <span>总访问量: <span id="totalVisits">1256789</span></span>
            </div>
            <div class="stat-item">
              <i class="fas fa-heartbeat"></i>
              <span>系统状态: <span style="color: #228B22; font-weight: 600;">正常</span></span>
            </div>
          </div>
        </header>

        <!-- 控制面板 -->
        <div class="control-panel">
          <div class="search-box">
            <input type="text"
                   placeholder="搜索系统、功能..."
                   id="searchInput">
            <button id="searchBtn"><i class="fas fa-search-plus"></i></button>
          </div>
          <div class="view-controls">
            <button class="view-btn active" id="gridBtn">
              <i class="fas fa-th-large"></i> 网格
            </button>
            <button class="view-btn" id="listBtn">
              <i class="fas fa-list-ul"></i> 列表
            </button>
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
              <span>神农集团卓越运营</span>
            </div>
            <div class="footer-item">
              <i class="fas fa-phone-volume"></i>
              <span>技术支持: 400-626-8888</span>
            </div>
            <div class="footer-item">
              <i class="fas fa-envelope-open-text"></i>
              <span>it@ynsnjt.com</span>
            </div>
            <div class="footer-item">
              <i class="fas fa-clock"></i>
              <span>最后更新: <span id="lastUpdateTime"></span></span>
            </div>
          </div>
          <p>&copy; 2025 神农集团数字化平台 | 版权所有 | 滇ICP备11003474号-3</p>
        </footer>
      </div>

      <!-- AI助手浮动按钮 -->
      <div class="ai-assistant">
        <button class="ai-button" id="aiButton">
          <div class="pig-emoji">🐷</div>
          <div class="ai-bubble">我是神农晓问 🐷</div>
        </button>
      </div>

      <!-- 全屏遮罩层 -->
      <div class="fullscreen-overlay" id="fullscreenOverlay"></div>

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
    
    // ESC键退出全屏
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isFullscreen) {
        this.toggleFullscreen()
      }
    })
  }
  
  /**
   * 绑定全局事件
   */
  bindEvents() {
    // 监听应用级事件
    eventBus.on('app:initialized', () => {
      console.log('应用初始化完成')
    })
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
    
    systemsToRender.forEach(system => {
      const systemCard = document.createElement('div')
      systemCard.className = 'system-card'
      systemCard.onclick = () => this.openSystem(system)
      
      systemCard.innerHTML = `
        <button class="favorite-btn ${system.favorited ? 'favorited' : ''}"
                onclick="event.stopPropagation()">
          <i class="fas fa-star"></i>
        </button>
        <div class="system-content">
          <div class="system-icon">
            <i class="${system.icon}"></i>
          </div>
          <h3 class="system-title">${system.name}</h3>
          <p class="system-desc">${system.description}</p>
          <div class="system-status">
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
      system.description.toLowerCase().includes(searchQuery)
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
        const change = Math.floor(Math.random() * 10) - 5
        onlineUsersEl.textContent = Math.max(100, currentUsers + change)
      }
      
      if (Math.random() > 0.7) {
        if (todayVisitsEl) {
          todayVisitsEl.textContent = parseInt(todayVisitsEl.textContent) + 1
        }
        if (totalVisitsEl) {
          totalVisitsEl.textContent = parseInt(totalVisitsEl.textContent) + 1
        }
      }
    }, 10000)
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
    
    // 创建AI侧边栏
    const aiSidebar = document.createElement('div')
    aiSidebar.className = 'ai-sidebar'
    aiSidebar.id = 'aiSidebar'
    
    // 创建控制头部
    const headerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 20px; border-bottom: 1px solid rgba(0,0,0,0.1); background: linear-gradient(135deg, rgba(255, 105, 180, 0.1), rgba(255, 20, 147, 0.05));">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #FF69B4, #FF1493); display: flex; align-items: center; justify-content: center; font-size: 20px; border: 2px solid rgba(255, 255, 255, 0.8); box-shadow: 0 2px 8px rgba(255, 20, 147, 0.3);">🐷</div>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">神农晓问 🐷</h3>
            <div style="font-size: 12px; color: #10b981; margin-top: 2px;">在线中</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="fullscreenBtn" title="全屏/退出全屏" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.05); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">
            <i class="fas fa-expand"></i>
          </button>
          <button id="openAIWindowBtn" title="独立窗口" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.05); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">
            <i class="fas fa-external-link-alt"></i>
          </button>
          <button id="closeAISidebarBtn" title="关闭" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.05); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280;">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `
    
    // AI助手内容区域
    const contentHTML = `
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 40px; text-align: center; color: #6b7280;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #FF69B4, #FF1493); display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 20px; border: 3px solid rgba(255, 255, 255, 0.8); box-shadow: 0 4px 12px rgba(255, 20, 147, 0.3);">🐷</div>
        <h3 style="margin-bottom: 15px; color: #1f2937;">神农晓问</h3>
        <p style="margin-bottom: 20px; line-height: 1.5; color: #6b7280;">您好！我是神农集团的智能助手<br>很高兴为您服务！</p>
        
        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 200px;">
          <button id="startChatBtn" style="padding: 12px 20px; background: linear-gradient(135deg, #FF69B4, #FF1493); color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 14px; transition: all 0.2s ease;">
            <i class="fas fa-comments"></i> 开始对话
          </button>
          <button id="openAIWindowBtn2" style="padding: 12px 20px; background: #6b7280; color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 14px; transition: all 0.2s ease;">
            <i class="fas fa-external-link-alt"></i> 独立窗口
          </button>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; font-size: 12px; color: #1e40af;">
          <strong>提示：</strong>您可以向我咨询农牧业相关问题
        </div>
      </div>
    `
    
    aiSidebar.innerHTML = headerHTML + contentHTML
    
    // 绑定按钮事件
    setTimeout(() => {
      aiSidebar.querySelector('#fullscreenBtn')?.addEventListener('click', () => {
        this.toggleFullscreen()
      })
      
      aiSidebar.querySelector('#openAIWindowBtn')?.addEventListener('click', () => {
        this.openAIWindow()
      })
      
      aiSidebar.querySelector('#openAIWindowBtn2')?.addEventListener('click', () => {
        this.openAIWindow()
      })
      
      aiSidebar.querySelector('#closeAISidebarBtn')?.addEventListener('click', () => {
        this.closeAISidebar()
      })
      
      aiSidebar.querySelector('#startChatBtn')?.addEventListener('click', () => {
        console.log('在侧边栏中启动聊天')
        this.loadChatInterface(aiSidebar)
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
    const overlay = this.container.querySelector('#fullscreenOverlay')
    
    if (aiSidebar) {
      aiSidebar.classList.remove('show')
      setTimeout(() => {
        aiSidebar.remove()
      }, 400)
    }
    
    if (overlay.classList.contains('show')) {
      overlay.classList.remove('show')
    }
    
    this.aiSidebarOpen = false
    this.isFullscreen = false
  }
  
  /**
   * 切换全屏
   */
  toggleFullscreen() {
    const aiSidebar = this.container.querySelector('#aiSidebar')
    const overlay = this.container.querySelector('#fullscreenOverlay')
    const fullscreenBtn = this.container.querySelector('#fullscreenBtn')
    
    if (!aiSidebar) return
    
    this.isFullscreen = !this.isFullscreen
    
    if (this.isFullscreen) {
      // 进入全屏
      overlay.classList.add('show')
      aiSidebar.classList.add('fullscreen')
      if (fullscreenBtn) {
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>'
        fullscreenBtn.title = '退出全屏'
      }
    } else {
      // 退出全屏
      overlay.classList.remove('show')
      aiSidebar.classList.remove('fullscreen')
      if (fullscreenBtn) {
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>'
        fullscreenBtn.title = '全屏'
      }
    }
  }
  
  /**
   * 在侧边栏中加载聊天界面
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  loadChatInterface(aiSidebar) {
    // 完全替换整个侧边栏内容，只保留头部
    const headerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 20px; border-bottom: 1px solid rgba(0,0,0,0.1); background: linear-gradient(135deg, rgba(255, 105, 180, 0.1), rgba(255, 20, 147, 0.05));">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #FF69B4, #FF1493); display: flex; align-items: center; justify-content: center; font-size: 20px; border: 2px solid rgba(255, 255, 255, 0.8); box-shadow: 0 2px 8px rgba(255, 20, 147, 0.3);">🐷</div>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">神农晓问 🐷</h3>
            <div style="font-size: 12px; color: #10b981; margin-top: 2px;">正在对话中</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="fullscreenBtn" title="全屏/退出全屏" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.05); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">
            <i class="fas fa-expand"></i>
          </button>
          <button id="openAIWindowBtn" title="独立窗口" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.05); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">
            <i class="fas fa-external-link-alt"></i>
          </button>
          <button id="closeAISidebarBtn" title="关闭" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.05); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280;">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `
    
    // 创建聊天界面HTML
    const chatHTML = `
      <div class="ai-chat-module" style="height: calc(100vh - 81px); display: flex; flex-direction: column;">
        <div class="ai-chat-area" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; min-height: 0;">
          <div class="chat-message">
            <div class="message-avatar ai" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #FF69B4, #FF1493); color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid rgba(255, 255, 255, 0.8);">🐷</div>
            <div style="flex: 1; margin-left: 8px;">
              <div class="message-content ai" style="background: rgba(249, 250, 251, 0.8); color: #374151; padding: 10px 14px; border-radius: 16px; border-top-left-radius: 6px; font-size: 13px; line-height: 1.4;">
                您好！我是神农晓问 🐷<br>
                我可以为您提供农牧业咨询和系统操作指导。
              </div>
              <div class="message-time" style="font-size: 10px; color: #9ca3af; margin-top: 3px; text-align: center;">刚刚</div>
            </div>
          </div>
        </div>

        <div class="ai-input-area" style="padding: 12px 15px 15px; border-top: 1px solid rgba(0, 0, 0, 0.08); background: rgba(255, 255, 255, 0.95); flex-shrink: 0;">
          <div class="quick-replies" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
            <div class="quick-reply" style="padding: 4px 10px; background: rgba(255, 20, 147, 0.1); border: 1px solid rgba(255, 20, 147, 0.2); border-radius: 14px; font-size: 11px; color: #FF1493; cursor: pointer; transition: all 0.2s ease;">生产管理</div>
            <div class="quick-reply" style="padding: 4px 10px; background: rgba(255, 20, 147, 0.1); border: 1px solid rgba(255, 20, 147, 0.2); border-radius: 14px; font-size: 11px; color: #FF1493; cursor: pointer; transition: all 0.2s ease;">智慧养殖</div>
            <div class="quick-reply" style="padding: 4px 10px; background: rgba(255, 20, 147, 0.1); border: 1px solid rgba(255, 20, 147, 0.2); border-radius: 14px; font-size: 11px; color: #FF1493; cursor: pointer; transition: all 0.2s ease;">数据分析</div>
            <div class="quick-reply" style="padding: 4px 10px; background: rgba(255, 20, 147, 0.1); border: 1px solid rgba(255, 20, 147, 0.2); border-radius: 14px; font-size: 11px; color: #FF1493; cursor: pointer; transition: all 0.2s ease;">系统帮助</div>
          </div>
          <div class="input-container" style="display: flex; gap: 8px; align-items: flex-end;">
            <textarea class="ai-input" placeholder="输入您的问题..." rows="1" style="flex: 1; min-height: 36px; max-height: 100px; padding: 8px 14px; border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 18px; font-size: 13px; resize: none; outline: none; font-family: inherit; background: rgba(255, 255, 255, 0.9);"></textarea>
            <button class="send-button" style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #FF69B4, #FF1493); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    `
    
    // 完全替换侧边栏内容
    aiSidebar.innerHTML = headerHTML + chatHTML
    
    // 重新绑定头部按钮事件
    this.bindHeaderEvents(aiSidebar)
    
    // 绑定聊天界面事件
    this.bindChatEvents(aiSidebar)
    
    // 聚焦到输入框
    setTimeout(() => {
      const input = aiSidebar.querySelector('.ai-input')
      if (input) {
        input.focus()
      }
    }, 100)
  }

  /**
   * 绑定头部按钮事件
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  bindHeaderEvents(aiSidebar) {
    aiSidebar.querySelector('#backToWelcomeBtn')?.addEventListener('click', () => {
      this.resetToWelcomeScreen(aiSidebar)
    })
    
    aiSidebar.querySelector('#fullscreenBtn')?.addEventListener('click', () => {
      this.toggleFullscreen()
    })
    
    aiSidebar.querySelector('#openAIWindowBtn')?.addEventListener('click', () => {
      this.openAIWindow()
    })
    
    aiSidebar.querySelector('#closeAISidebarBtn')?.addEventListener('click', () => {
      this.closeAISidebar()
    })
  }

  /**
   * 重置到欢迎界面
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  resetToWelcomeScreen(aiSidebar) {
    // 关闭当前侧边栏
    this.closeAISidebar()
    
    // 重新打开欢迎界面
    setTimeout(() => {
      this.openAISidebar()
    }, 300)
  }

  /**
   * 绑定聊天界面事件
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  bindChatEvents(aiSidebar) {
    const input = aiSidebar.querySelector('.ai-input')
    const sendButton = aiSidebar.querySelector('.send-button')
    const chatArea = aiSidebar.querySelector('.ai-chat-area')
    
    // 自动调整输入框高度
    const autoResize = (textarea) => {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
    
    // 输入框事件
    input?.addEventListener('input', (e) => {
      autoResize(e.target)
    })
    
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage(aiSidebar)
      }
    })
    
    // 发送按钮事件
    sendButton?.addEventListener('click', () => {
      this.sendMessage(aiSidebar)
    })
    
    // 快捷回复事件
    const quickReplies = aiSidebar.querySelectorAll('.quick-reply')
    quickReplies.forEach(reply => {
      reply.addEventListener('click', () => {
        input.value = reply.textContent + '怎么使用？'
        autoResize(input)
        this.sendMessage(aiSidebar)
      })
      
      // 悬停效果
      reply.addEventListener('mouseenter', () => {
        reply.style.background = 'rgba(255, 20, 147, 0.2)'
        reply.style.transform = 'translateY(-1px)'
      })
      
      reply.addEventListener('mouseleave', () => {
        reply.style.background = 'rgba(255, 20, 147, 0.1)'
        reply.style.transform = 'translateY(0)'
      })
    })
  }

  /**
   * 发送消息
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  sendMessage(aiSidebar) {
    const input = aiSidebar.querySelector('.ai-input')
    const chatArea = aiSidebar.querySelector('.ai-chat-area')
    const message = input.value.trim()
    
    if (!message) return
    
    // 添加用户消息
    const userMessageHTML = `
      <div class="chat-message user" style="display: flex; flex-direction: row-reverse; gap: 8px; align-items: flex-start;">
        <div class="message-avatar user" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #4A90E2, #2563eb); color: white; display: flex; align-items: center; justify-content: center; font-size: 14px;">👤</div>
        <div style="flex: 1; margin-right: 8px;">
          <div class="message-content user" style="background: linear-gradient(135deg, #4A90E2, #2563eb); color: white; padding: 10px 14px; border-radius: 16px; border-top-right-radius: 6px; font-size: 13px; line-height: 1.4; max-width: 250px; margin-left: auto;">${message}</div>
          <div class="message-time" style="font-size: 10px; color: #9ca3af; margin-top: 3px; text-align: center;">${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    `
    
    chatArea.insertAdjacentHTML('beforeend', userMessageHTML)
    
    // 清空输入框
    input.value = ''
    input.style.height = 'auto'
    
    // 滚动到底部
    chatArea.scrollTop = chatArea.scrollHeight
    
    // 显示AI正在输入的提示
    setTimeout(() => {
      this.showAIResponse(aiSidebar, message)
    }, 500)
  }

  /**
   * 显示AI回复
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   * @param {string} userMessage - 用户消息
   */
  showAIResponse(aiSidebar, userMessage) {
    const chatArea = aiSidebar.querySelector('.ai-chat-area')
    
    // 先显示输入中提示
    const typingHTML = `
      <div class="chat-message typing" style="display: flex; gap: 8px; align-items: flex-start;">
        <div class="message-avatar ai" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #FF69B4, #FF1493); color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid rgba(255, 255, 255, 0.8);">🐷</div>
        <div style="flex: 1; margin-left: 8px;">
          <div class="typing-indicator" style="background: rgba(249, 250, 251, 0.8); padding: 12px 16px; border-radius: 18px; border-top-left-radius: 6px; display: flex; align-items: center; gap: 8px;">
            <div class="typing-dots" style="display: flex; gap: 4px;">
              <span style="width: 6px; height: 6px; background: #9ca3af; border-radius: 50%; animation: typingDot 1.4s infinite;"></span>
              <span style="width: 6px; height: 6px; background: #9ca3af; border-radius: 50%; animation: typingDot 1.4s infinite 0.2s;"></span>
              <span style="width: 6px; height: 6px; background: #9ca3af; border-radius: 50%; animation: typingDot 1.4s infinite 0.4s;"></span>
            </div>
            <span style="font-size: 12px; color: #6b7280;">神农晓问正在思考...</span>
          </div>
        </div>
      </div>
    `
    
    chatArea.insertAdjacentHTML('beforeend', typingHTML)
    chatArea.scrollTop = chatArea.scrollHeight
    
    // 添加CSS动画
    if (!document.querySelector('#typing-animation')) {
      const style = document.createElement('style')
      style.id = 'typing-animation'
      style.textContent = `
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.4; transform: scale(1); }
          30% { opacity: 1; transform: scale(1.2); }
        }
      `
      document.head.appendChild(style)
    }
    
    // 模拟AI回复（2秒后）
    setTimeout(() => {
      // 移除输入中提示
      const typingMessage = chatArea.querySelector('.typing')
      if (typingMessage) {
        typingMessage.remove()
      }
      
      // 生成AI回复
      const aiResponse = this.generateAIResponse(userMessage)
      
      const aiMessageHTML = `
        <div class="chat-message">
          <div class="message-avatar ai" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #FF69B4, #FF1493); color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid rgba(255, 255, 255, 0.8);">🐷</div>
          <div style="flex: 1; margin-left: 8px;">
            <div class="message-content ai" style="background: rgba(249, 250, 251, 0.8); color: #374151; padding: 10px 14px; border-radius: 16px; border-top-left-radius: 6px; font-size: 13px; line-height: 1.4;">${aiResponse}</div>
            <div class="message-time" style="font-size: 10px; color: #9ca3af; margin-top: 3px; text-align: center;">${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      `
      
      chatArea.insertAdjacentHTML('beforeend', aiMessageHTML)
      chatArea.scrollTop = chatArea.scrollHeight
    }, 2000)
  }

  /**
   * 生成AI回复（模拟）
   * @param {string} userMessage - 用户消息
   * @returns {string} AI回复内容
   */
  generateAIResponse(userMessage) {
    const responses = {
      '生产管理': '生产管理系统可以帮助您：<br>• 监控畜禽养殖生产过程<br>• 统计分析生产数据<br>• 制定生产计划<br>• 记录生产异常<br><br>您可以通过系统首页的"生产管理平台"卡片进入使用。',
      '智慧养殖': '智慧养殖系统提供：<br>• 环境监控（温度、湿度、空气质量）<br>• 自动投喂管理<br>• 动物健康监测<br>• 智能预警系统<br><br>这些功能可以大大提高养殖效率和动物福利。',
      '数据分析': 'BI数据分析平台为您提供：<br>• 生产数据可视化<br>• 经营状况分析<br>• 趋势预测<br>• 决策支持报告<br><br>帮助您做出更明智的经营决策。',
      '系统帮助': '我可以为您提供以下帮助：<br>• 各系统功能介绍<br>• 操作步骤指导<br>• 常见问题解答<br>• 技术支持建议<br><br>请告诉我您需要了解哪个具体系统？'
    }
    
    // 简单的关键词匹配
    for (const [key, response] of Object.entries(responses)) {
      if (userMessage.includes(key)) {
        return response
      }
    }
    
    // 默认回复
    return `感谢您的咨询！关于"${userMessage}"，我建议您：<br><br>1. 查看相关系统的操作手册<br>2. 联系技术支持团队<br>3. 参加系统培训课程<br><br>如需更详细的帮助，请联系技术支持：400-626-8888`
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