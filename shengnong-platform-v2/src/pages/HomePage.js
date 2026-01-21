/**
 * 首页组件
 * 完全复刻原始snITSM.html的界面效果
 */

import { SYSTEMS, SYSTEM_CATEGORIES } from '../utils/constants.js'
import { eventBus } from '../utils/eventBus.js'
import { debounce } from '../utils/helpers.js'
import { ConfigService } from '../services/configService.js'
import { AIService } from '../services/aiService.js'

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
    this.apiSettingsOpen = false
    this.availableModels = [] // 存储可用的模型列表
    this.conversationHistory = [] // 存储对话历史
    this.tempApiConfig = null // 临时存储API配置（验证成功后）
    
    this.container = null
    this.searchInput = null
    this.configService = null
    this.aiService = null
    
    // 防抖搜索
    this.debouncedSearch = debounce(this.filterSystems.bind(this), 300)
  }
  
  /**
   * 初始化组件
   */
  async init() {
    // 初始化配置服务
    this.configService = new ConfigService()
    await this.configService.loadConfig()
    
    // 初始化AI服务
    this.aiService = new AIService(this.configService.getConfig('ai'))
    
    // 加载模型列表
    await this.loadModels()
    
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
          <div class="pig-emoji">
            <img src="./src/assets/images/Shennong_Vet_Assistant_Icon.png" alt="神农晓问" style="width: 110%; height: 110%; object-fit: cover; transform: scale(1.1);">
          </div>
          <div class="ai-bubble">我是神农晓问</div>
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
          <div style="width: 44px; height: 44px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; font-size: 20px; overflow: hidden;">
            <img src="./src/assets/images/Shennong_Vet_Assistant_Icon.png" alt="神农晓问" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">神农晓问</h3>
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
        <div style="width: 80px; height: 80px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 20px; overflow: hidden;">
          <img src="./src/assets/images/Shennong_Vet_Assistant_Icon.png" alt="神农晓问" style="width: 110%; height: 110%; object-fit: cover; transform: scale(1.1);">
        </div>
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
          <div style="width: 44px; height: 44px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; font-size: 20px; overflow: hidden;">
            <img src="./src/assets/images/Shennong_Vet_Assistant_Icon.png" alt="神农晓问" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">神农晓问</h3>
            <div style="font-size: 12px; color: #10b981; margin-top: 2px;">正在对话中</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="settingsBtn" title="AI配置" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.05); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">
            <i class="fas fa-cog"></i>
          </button>
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
      <!-- API设置面板 - 两步流程 -->
      <div class="api-settings-panel" id="apiSettingsPanel" style="display: none; position: absolute; top: 70px; right: 15px; width: 320px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); padding: 20px; z-index: 1000; transform: scale(0.95); opacity: 0; transition: all 0.2s ease; max-height: 80vh; overflow-y: auto;">
        <h4 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #1f2937;">AI 配置</h4>
        
        <!-- 步骤1: API连接配置 -->
        <div id="step1Container">
          <div style="background: rgba(59, 130, 246, 0.1); padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 12px; color: #1e40af;">
            <strong>步骤 1/2:</strong> 配置API连接
          </div>
          
          <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #6b7280; font-weight: 500;">API地址 *</label>
          <input type="text" id="apiUrlInput" placeholder="http://47.236.87.251:3000/api" style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; margin-bottom: 12px; outline: none; transition: border-color 0.2s;">

          <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #6b7280; font-weight: 500;">API Key *</label>
          <input type="password" id="apiKeyInput" placeholder="输入您的API密钥" style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; margin-bottom: 15px; outline: none; transition: border-color 0.2s;">

          <div id="step1Message" style="display: none; padding: 10px; border-radius: 6px; margin-bottom: 12px; font-size: 12px;"></div>

          <button id="validateApiBtn" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #FF69B4, #FF1493); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s;">
            <i class="fas fa-check-circle"></i> 验证并继续
          </button>
        </div>

        <!-- 步骤2: 模型选择 (初始隐藏) -->
        <div id="step2Container" style="display: none;">
          <div style="background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 12px; color: #065f46;">
            <strong>步骤 2/2:</strong> 选择AI模型
          </div>

          <div style="background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 6px; margin-bottom: 12px; font-size: 12px; color: #065f46;">
            <i class="fas fa-check-circle"></i> API连接成功！
          </div>

          <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #6b7280; font-weight: 500;">选择模型 *</label>
          <select id="modelSelect" style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; margin-bottom: 12px; outline: none; background: white; cursor: pointer;">
            <option value="">加载中...</option>
          </select>

          <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #6b7280; font-weight: 500;">最大令牌数</label>
          <input type="number" id="maxTokensInput" value="4000" min="100" max="8000" style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; margin-bottom: 12px; outline: none;">

          <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #6b7280; font-weight: 500;">创造性 (0-1)</label>
          <input type="number" id="temperatureInput" value="0.7" min="0" max="1" step="0.1" style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; margin-bottom: 15px; outline: none;">

          <div style="display: flex; gap: 8px;">
            <button id="backToStep1Btn" style="flex: 1; padding: 10px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s;">
              <i class="fas fa-arrow-left"></i> 返回
            </button>
            <button id="saveSettingsBtn" style="flex: 2; padding: 10px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s;">
              <i class="fas fa-save"></i> 保存配置
            </button>
          </div>
        </div>
      </div>

      <div class="ai-chat-module" style="height: calc(100vh - 81px); display: flex; flex-direction: column;">
        <div class="ai-chat-area" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; min-height: 0;">
          <div class="chat-message">
            <div class="message-avatar ai" style="width: 32px; height: 32px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; font-size: 14px; overflow: hidden;">
              <img src="./src/assets/images/Shennong_Vet_Assistant_Icon.png" alt="神农晓问" style="width: 110%; height: 110%; object-fit: cover; transform: scale(1.1);">
            </div>
            <div style="flex: 1; margin-left: 8px;">
              <div class="message-content ai" style="background: rgba(249, 250, 251, 0.8); color: #374151; padding: 10px 14px; border-radius: 16px; border-top-left-radius: 6px; font-size: 13px; line-height: 1.4;">
                您好！我是神农晓问<br>
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
    
    aiSidebar.querySelector('#settingsBtn')?.addEventListener('click', () => {
      this.toggleAPISettings(aiSidebar)
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
    
    // 步骤1: 验证API按钮
    aiSidebar.querySelector('#validateApiBtn')?.addEventListener('click', () => {
      this.validateAPIConnection(aiSidebar)
    })
    
    // 步骤2: 返回按钮
    aiSidebar.querySelector('#backToStep1Btn')?.addEventListener('click', () => {
      this.backToStep1(aiSidebar)
    })
    
    // 步骤2: 保存设置按钮
    aiSidebar.querySelector('#saveSettingsBtn')?.addEventListener('click', () => {
      this.saveAPISettings(aiSidebar)
    })
    
    // 点击外部关闭设置面板
    document.addEventListener('click', (e) => {
      const settingsPanel = aiSidebar.querySelector('#apiSettingsPanel')
      const settingsBtn = aiSidebar.querySelector('#settingsBtn')
      
      if (this.apiSettingsOpen && 
          settingsPanel && !settingsPanel.contains(e.target) && 
          settingsBtn && !settingsBtn.contains(e.target)) {
        this.closeAPISettings(aiSidebar)
      }
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
  async sendMessage(aiSidebar) {
    const input = aiSidebar.querySelector('.ai-input')
    const chatArea = aiSidebar.querySelector('.ai-chat-area')
    const sendButton = aiSidebar.querySelector('.send-button')
    const message = input.value.trim()
    
    if (!message) return
    
    // 禁用发送按钮
    if (sendButton) {
      sendButton.disabled = true
      sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
    }
    
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
      this.showAIResponse(aiSidebar, message, sendButton)
    }, 500)
  }

  /**
   * 显示AI回复
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   * @param {string} userMessage - 用户消息
   * @param {HTMLElement} sendButton - 发送按钮
   */
  async showAIResponse(aiSidebar, userMessage, sendButton) {
    const chatArea = aiSidebar.querySelector('.ai-chat-area')
    
    // 先显示输入中提示
    const typingHTML = `
      <div class="chat-message typing" style="display: flex; gap: 8px; align-items: flex-start;">
        <div class="message-avatar ai" style="width: 32px; height: 32px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; font-size: 14px; overflow: hidden;">
          <img src="./src/assets/images/Shennong_Vet_Assistant_Icon.png" alt="神农晓问" style="width: 110%; height: 110%; object-fit: cover; transform: scale(1.1);">
        </div>
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
    
    try {
      // 尝试使用真实的AI服务
      let aiResponse = ''
      
      if (this.aiService && this.configService) {
        // 使用真实AI服务
        aiResponse = await this.aiService.sendMessage(userMessage, {
          context: this.getConversationContext(),
          stream: false
        })
      } else {
        // 降级到模拟回复
        await new Promise(resolve => setTimeout(resolve, 2000))
        aiResponse = this.generateAIResponse(userMessage)
      }
      
      // 移除输入中提示
      const typingMessage = chatArea.querySelector('.typing')
      if (typingMessage) {
        typingMessage.remove()
      }
      
      // 显示AI回复
      const aiMessageHTML = `
        <div class="chat-message">
          <div class="message-avatar ai" style="width: 32px; height: 32px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; font-size: 14px; overflow: hidden;">
            <img src="./src/assets/images/Shennong_Vet_Assistant_Icon.png" alt="神农晓问" style="width: 110%; height: 110%; object-fit: cover; transform: scale(1.1);">
          </div>
          <div style="flex: 1; margin-left: 8px;">
            <div class="message-content ai" style="background: rgba(249, 250, 251, 0.8); color: #374151; padding: 10px 14px; border-radius: 16px; border-top-left-radius: 6px; font-size: 13px; line-height: 1.4;">${aiResponse}</div>
            <div class="message-time" style="font-size: 10px; color: #9ca3af; margin-top: 3px; text-align: center;">${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      `
      
      chatArea.insertAdjacentHTML('beforeend', aiMessageHTML)
      chatArea.scrollTop = chatArea.scrollHeight
      
    } catch (error) {
      console.error('AI回复失败:', error)
      
      // 移除输入中提示
      const typingMessage = chatArea.querySelector('.typing')
      if (typingMessage) {
        typingMessage.remove()
      }
      
      // 显示错误消息
      const errorMessageHTML = `
        <div class="chat-message error">
          <div class="message-avatar ai" style="width: 32px; height: 32px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; font-size: 14px; overflow: hidden;">
            <img src="./src/assets/images/Shennong_Vet_Assistant_Icon.png" alt="神农晓问" style="width: 110%; height: 110%; object-fit: cover; transform: scale(1.1);">
          </div>
          <div style="flex: 1; margin-left: 8px;">
            <div class="message-content ai" style="background: rgba(254, 202, 202, 0.8); color: #991b1b; padding: 10px 14px; border-radius: 16px; border-top-left-radius: 6px; font-size: 13px; line-height: 1.4;">
              <i class="fas fa-exclamation-triangle"></i> 抱歉，AI服务暂时不可用。<br>
              错误信息：${error.message}<br><br>
              请检查API配置或稍后重试。
            </div>
            <div class="message-time" style="font-size: 10px; color: #9ca3af; margin-top: 3px; text-align: center;">${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      `
      
      chatArea.insertAdjacentHTML('beforeend', errorMessageHTML)
      chatArea.scrollTop = chatArea.scrollHeight
      
    } finally {
      // 恢复发送按钮
      if (sendButton) {
        sendButton.disabled = false
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>'
      }
    }
  }

  /**
   * 获取对话上下文
   * @returns {Array} 对话上下文数组
   */
  getConversationContext() {
    // 从聊天区域获取最近的对话历史
    const chatArea = this.container?.querySelector('.ai-chat-area')
    if (!chatArea) return []
    
    const messages = []
    const messageElements = chatArea.querySelectorAll('.chat-message:not(.typing):not(.error)')
    
    // 只保留最近10条消息作为上下文
    const recentMessages = Array.from(messageElements).slice(-10)
    
    recentMessages.forEach(msgEl => {
      const isUser = msgEl.classList.contains('user')
      const contentEl = msgEl.querySelector('.message-content')
      
      if (contentEl) {
        const content = contentEl.textContent.trim()
        messages.push({
          role: isUser ? 'user' : 'assistant',
          content: content
        })
      }
    })
    
    // 添加系统提示
    return [
      {
        role: 'system',
        content: '你是神农集团的智能农牧助手"神农晓问"，专门为用户提供农牧业生产、管理、技术等方面的专业咨询和系统操作指导。请用中文回答，语气要友好专业。'
      },
      ...messages
    ]
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
   * 切换API设置面板
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  toggleAPISettings(aiSidebar) {
    if (this.apiSettingsOpen) {
      this.closeAPISettings(aiSidebar)
    } else {
      this.openAPISettings(aiSidebar)
    }
  }
  
  /**
   * 打开API设置面板
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  openAPISettings(aiSidebar) {
    const settingsPanel = aiSidebar.querySelector('#apiSettingsPanel')
    if (settingsPanel) {
      // 加载当前配置
      this.loadAPISettings(aiSidebar)
      
      // 重置到步骤1
      this.showStep1(aiSidebar)
      
      // 显示面板
      settingsPanel.style.display = 'block'
      setTimeout(() => {
        settingsPanel.style.transform = 'scale(1)'
        settingsPanel.style.opacity = '1'
      }, 10)
      
      this.apiSettingsOpen = true
    }
  }
  
  /**
   * 显示步骤1
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  showStep1(aiSidebar) {
    const step1Container = aiSidebar.querySelector('#step1Container')
    const step2Container = aiSidebar.querySelector('#step2Container')
    const step1Message = aiSidebar.querySelector('#step1Message')
    
    if (step1Container) step1Container.style.display = 'block'
    if (step2Container) step2Container.style.display = 'none'
    if (step1Message) step1Message.style.display = 'none'
  }
  
  /**
   * 显示步骤2
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   * @param {Array} models - 模型列表
   */
  showStep2(aiSidebar, models) {
    const step1Container = aiSidebar.querySelector('#step1Container')
    const step2Container = aiSidebar.querySelector('#step2Container')
    const modelSelect = aiSidebar.querySelector('#modelSelect')
    
    if (step1Container) step1Container.style.display = 'none'
    if (step2Container) step2Container.style.display = 'block'
    
    // 更新模型列表
    if (modelSelect && models && models.length > 0) {
      modelSelect.innerHTML = models.map(model => 
        `<option value="${model.id}">${model.name}</option>`
      ).join('')
      
      // 如果有保存的模型，选中它
      const savedModel = this.configService?.getConfig('ai')?.model
      if (savedModel && models.some(m => m.id === savedModel)) {
        modelSelect.value = savedModel
      }
    }
  }
  
  /**
   * 返回步骤1
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  backToStep1(aiSidebar) {
    this.showStep1(aiSidebar)
  }
  
  /**
   * 验证API连接
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  async validateAPIConnection(aiSidebar) {
    const apiUrlInput = aiSidebar.querySelector('#apiUrlInput')
    const apiKeyInput = aiSidebar.querySelector('#apiKeyInput')
    const validateBtn = aiSidebar.querySelector('#validateApiBtn')
    const step1Message = aiSidebar.querySelector('#step1Message')
    
    const apiUrl = apiUrlInput?.value?.trim()
    const apiKey = apiKeyInput?.value?.trim()
    
    // 验证输入
    if (!apiUrl) {
      this.showStep1Message(aiSidebar, '请输入API地址', 'error')
      return
    }
    
    if (!apiKey) {
      this.showStep1Message(aiSidebar, '请输入API Key', 'error')
      return
    }
    
    // 显示加载状态
    if (validateBtn) {
      validateBtn.disabled = true
      validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 验证中...'
    }
    
    try {
      console.log('开始验证API连接...')
      
      // 调用AIService的验证方法
      const result = await this.aiService.validateAndGetModels(apiUrl, apiKey)
      
      if (result.success && result.models.length > 0) {
        // 验证成功，显示步骤2
        console.log('API验证成功，获取到模型列表:', result.models)
        this.showStep1Message(aiSidebar, '连接成功！正在加载模型...', 'success')
        
        setTimeout(() => {
          this.showStep2(aiSidebar, result.models)
          // 临时保存API配置
          this.tempApiConfig = { baseUrl: apiUrl, apiKey }
        }, 500)
        
      } else {
        // 验证失败
        console.error('API验证失败:', result.error)
        this.showStep1Message(aiSidebar, result.error || '连接失败，请检查API地址和密钥', 'error')
      }
      
    } catch (error) {
      console.error('验证API连接失败:', error)
      this.showStep1Message(aiSidebar, error.message || '连接失败，请检查网络和配置', 'error')
      
    } finally {
      // 恢复按钮状态
      if (validateBtn) {
        validateBtn.disabled = false
        validateBtn.innerHTML = '<i class="fas fa-check-circle"></i> 验证并继续'
      }
    }
  }
  
  /**
   * 显示步骤1的消息
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型 (success/error)
   */
  showStep1Message(aiSidebar, message, type = 'info') {
    const step1Message = aiSidebar.querySelector('#step1Message')
    if (!step1Message) return
    
    step1Message.style.display = 'block'
    step1Message.textContent = message
    
    if (type === 'success') {
      step1Message.style.background = 'rgba(16, 185, 129, 0.1)'
      step1Message.style.color = '#065f46'
      step1Message.style.border = '1px solid rgba(16, 185, 129, 0.3)'
    } else if (type === 'error') {
      step1Message.style.background = 'rgba(239, 68, 68, 0.1)'
      step1Message.style.color = '#991b1b'
      step1Message.style.border = '1px solid rgba(239, 68, 68, 0.3)'
    } else {
      step1Message.style.background = 'rgba(59, 130, 246, 0.1)'
      step1Message.style.color = '#1e40af'
      step1Message.style.border = '1px solid rgba(59, 130, 246, 0.3)'
    }
  }
  
  /**
   * 关闭API设置面板
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  closeAPISettings(aiSidebar) {
    const settingsPanel = aiSidebar.querySelector('#apiSettingsPanel')
    if (settingsPanel) {
      settingsPanel.style.transform = 'scale(0.95)'
      settingsPanel.style.opacity = '0'
      setTimeout(() => {
        settingsPanel.style.display = 'none'
      }, 200)
      
      this.apiSettingsOpen = false
    }
  }
  
  /**
   * 加载API设置
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  loadAPISettings(aiSidebar) {
    if (!this.configService) return
    
    const config = this.configService.getConfig('ai')
    if (!config) return
    
    const apiUrlInput = aiSidebar.querySelector('#apiUrlInput')
    const apiKeyInput = aiSidebar.querySelector('#apiKeyInput')
    const maxTokensInput = aiSidebar.querySelector('#maxTokensInput')
    const temperatureInput = aiSidebar.querySelector('#temperatureInput')
    
    if (apiUrlInput && config.baseUrl) apiUrlInput.value = config.baseUrl
    if (apiKeyInput && config.apiKey) apiKeyInput.value = config.apiKey
    if (maxTokensInput && config.maxTokens) maxTokensInput.value = config.maxTokens
    if (temperatureInput && config.temperature) temperatureInput.value = config.temperature
  }
  
  /**
   * 保存API设置
   * @param {HTMLElement} aiSidebar - AI侧边栏元素
   */
  async saveAPISettings(aiSidebar) {
    try {
      const modelSelect = aiSidebar.querySelector('#modelSelect')
      const maxTokensInput = aiSidebar.querySelector('#maxTokensInput')
      const temperatureInput = aiSidebar.querySelector('#temperatureInput')
      
      const model = modelSelect?.value  // 这是模型的ID
      const maxTokens = parseInt(maxTokensInput?.value)
      const temperature = parseFloat(temperatureInput?.value)
      
      console.log('保存API设置:', { 
        baseUrl: this.tempApiConfig?.baseUrl,
        apiKey: this.tempApiConfig?.apiKey ? '***' : '',
        model, 
        maxTokens, 
        temperature 
      })
      
      if (!this.tempApiConfig || !this.tempApiConfig.baseUrl || !this.tempApiConfig.apiKey) {
        throw new Error('API配置不完整，请重新验证')
      }
      
      if (!model) {
        throw new Error('请选择模型')
      }
      
      const aiConfig = {
        baseUrl: this.tempApiConfig.baseUrl,
        apiKey: this.tempApiConfig.apiKey,
        model,  // 保存的是模型ID
        maxTokens,
        temperature
      }
      
      await this.configService.setConfig('ai', aiConfig)
      
      // 更新AI服务配置
      if (this.aiService) {
        this.aiService.updateConfig(aiConfig)
        console.log('AI服务配置已更新，当前模型ID:', model)
      }
      
      // 清除临时配置
      this.tempApiConfig = null
      
      this.closeAPISettings(aiSidebar)
      this.showNotification('API设置已保存！', 'success')
      
    } catch (error) {
      console.error('保存API设置失败:', error)
      this.showNotification(error.message, 'error')
    }
  }
  
  /**
   * 显示通知
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型
   */
  showNotification(message, type = 'info') {
    eventBus.emit('notification:show', { message, type })
  }
  
  /**
   * 加载可用的模型列表
   */
  async loadModels() {
    try {
      console.log('正在加载模型列表...')
      this.availableModels = await this.aiService.getModels()
      console.log('模型列表加载完成:', this.availableModels)
      
      // 如果页面已经渲染且配置面板打开，更新模型选择下拉框
      if (this.container && this.apiSettingsOpen) {
        this.updateModelSelect()
      }
    } catch (error) {
      console.error('加载模型列表失败:', error)
      // 使用默认模型列表
      this.availableModels = [
        { id: 'qwen2.5:7b', name: 'Qwen2.5 7B' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'llama2', name: 'Llama 2' }
      ]
    }
  }
  
  /**
   * 更新模型选择下拉框
   */
  updateModelSelect() {
    const aiSidebar = this.container.querySelector('#aiSidebar')
    if (!aiSidebar) return
    
    const modelSelect = aiSidebar.querySelector('#modelSelect')
    if (!modelSelect) return
    
    // 保存当前选中的值
    const currentValue = modelSelect.value
    
    // 清空现有选项
    modelSelect.innerHTML = ''
    
    // 添加新选项
    this.availableModels.forEach(model => {
      const option = document.createElement('option')
      option.value = model.id
      option.textContent = model.name || model.id
      modelSelect.appendChild(option)
    })
    
    // 恢复之前选中的值（如果存在）
    if (currentValue && this.availableModels.some(m => m.id === currentValue)) {
      modelSelect.value = currentValue
    } else if (this.availableModels.length > 0) {
      // 否则选择第一个
      modelSelect.value = this.availableModels[0].id
    }
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