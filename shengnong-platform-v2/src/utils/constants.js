/**
 * 应用常量定义
 */

// API端点
export const API_ENDPOINTS = {
  CHAT: '/chat/completions',
  CONFIG: '/config',
  HEALTH: '/health'
}

// 系统配置
export const SYSTEMS = [
  {
    id: 'production',
    name: '生产管理平台',
    description: '生产计划与进度跟踪',
    icon: 'fas fa-industry',
    color: '#4CAF50',
    url: '/production',
    category: 'production'
  },
  {
    id: 'breeding',
    name: '智慧养殖系统',
    description: '养殖环境监控与健康管理',
    icon: 'fas fa-cow',
    color: '#FF9800',
    url: '/breeding',
    category: 'production'
  },
  {
    id: 'feed',
    name: '饲料管理系统',
    description: '饲料配方与库存管理',
    icon: 'fas fa-seedling',
    color: '#8BC34A',
    url: '/feed',
    category: 'production'
  },
  {
    id: 'veterinary',
    name: '兽医服务平台',
    description: '疫病防控与诊疗记录',
    icon: 'fas fa-user-md',
    color: '#2196F3',
    url: '/veterinary',
    category: 'service'
  },
  {
    id: 'logistics',
    name: '智慧物流系统',
    description: '运输调度与配送跟踪',
    icon: 'fas fa-truck',
    color: '#FF5722',
    url: '/logistics',
    category: 'service'
  },
  {
    id: 'traceability',
    name: '食品安全追溯',
    description: '全链条质量追溯',
    icon: 'fas fa-search',
    color: '#E91E63',
    url: '/traceability',
    category: 'quality'
  },
  {
    id: 'finance',
    name: '财务管理系统',
    description: '成本核算与财务分析',
    icon: 'fas fa-chart-line',
    color: '#9C27B0',
    url: '/finance',
    category: 'management'
  },
  {
    id: 'hr',
    name: '人力资源平台',
    description: '员工管理与绩效考核',
    icon: 'fas fa-users',
    color: '#3F51B5',
    url: '/hr',
    category: 'management'
  },
  {
    id: 'environment',
    name: '环保监测系统',
    description: '环境数据监测分析',
    icon: 'fas fa-leaf',
    color: '#4CAF50',
    url: '/environment',
    category: 'monitoring'
  },
  {
    id: 'bi',
    name: 'BI数据分析',
    description: '业务数据可视化分析',
    icon: 'fas fa-chart-bar',
    color: '#FF9800',
    url: '/bi',
    category: 'analysis'
  },
  {
    id: 'procurement',
    name: '采购管理平台',
    description: '供应商管理与采购流程',
    icon: 'fas fa-shopping-cart',
    color: '#607D8B',
    url: '/procurement',
    category: 'management'
  },
  {
    id: 'oa',
    name: '移动办公OA',
    description: '审批流程与协同办公',
    icon: 'fas fa-mobile-alt',
    color: '#795548',
    url: '/oa',
    category: 'office'
  }
]

// 系统分类
export const SYSTEM_CATEGORIES = {
  production: { name: '生产管理', color: '#4CAF50' },
  service: { name: '服务支持', color: '#2196F3' },
  quality: { name: '质量控制', color: '#E91E63' },
  management: { name: '经营管理', color: '#9C27B0' },
  monitoring: { name: '监测分析', color: '#FF9800' },
  analysis: { name: '数据分析', color: '#607D8B' },
  office: { name: '办公协同', color: '#795548' }
}

// 默认配置
export const DEFAULT_CONFIG = {
  ai: {
    baseUrl: 'http://47.236.87.251:3000/api',
    model: 'qwen2.5:7b',
    maxTokens: 4000,
    temperature: 0.7,
    maxHistory: 10,
    timeout: 30000
  },
  ui: {
    theme: 'light',
    language: 'zh-CN',
    viewMode: 'grid',
    showStats: true,
    enableAnimations: true
  },
  storage: {
    prefix: 'shengnong_',
    version: '2.0.0'
  }
}

// 快速回复模板
export const QUICK_REPLIES = {
  agriculture: [
    '请详细说明种植规模',
    '土壤条件如何？',
    '需要什么技术支持？',
    '有什么具体问题吗？'
  ],
  breeding: [
    '请详细说明养殖规模',
    '养殖环境怎么样？',
    '需要什么设备支持？',
    '有疫病防控问题吗？'
  ],
  general: [
    '继续详细说明',
    '还有其他问题吗？',
    '需要更多帮助',
    '请提供更多信息'
  ]
}

// 思维导图预设模板
export const MINDMAP_TEMPLATES = {
  it_operations: {
    name: 'IT运营规划',
    data: {
      nodes: [
        {
          id: 'root',
          text: 'IT运营管理',
          x: 400,
          y: 300,
          level: 0,
          color: '#4A90E2'
        },
        {
          id: 'infrastructure',
          text: '基础设施管理',
          x: 200,
          y: 200,
          level: 1,
          parent: 'root',
          color: '#50C878'
        },
        {
          id: 'security',
          text: '安全管理',
          x: 600,
          y: 200,
          level: 1,
          parent: 'root',
          color: '#FF6B6B'
        },
        {
          id: 'monitoring',
          text: '监控运维',
          x: 200,
          y: 400,
          level: 1,
          parent: 'root',
          color: '#FFD93D'
        },
        {
          id: 'support',
          text: '技术支持',
          x: 600,
          y: 400,
          level: 1,
          parent: 'root',
          color: '#A8E6CF'
        }
      ]
    }
  },
  business_plan: {
    name: '业务规划',
    data: {
      nodes: [
        {
          id: 'root',
          text: '业务发展规划',
          x: 400,
          y: 300,
          level: 0,
          color: '#4A90E2'
        },
        {
          id: 'market',
          text: '市场分析',
          x: 200,
          y: 200,
          level: 1,
          parent: 'root',
          color: '#50C878'
        },
        {
          id: 'product',
          text: '产品策略',
          x: 600,
          y: 200,
          level: 1,
          parent: 'root',
          color: '#FF6B6B'
        },
        {
          id: 'operation',
          text: '运营管理',
          x: 200,
          y: 400,
          level: 1,
          parent: 'root',
          color: '#FFD93D'
        },
        {
          id: 'finance',
          text: '财务规划',
          x: 600,
          y: 400,
          level: 1,
          parent: 'root',
          color: '#A8E6CF'
        }
      ]
    }
  }
}

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  API_ERROR: 'API服务异常，请稍后重试',
  CONFIG_ERROR: '配置加载失败，使用默认配置',
  STORAGE_ERROR: '本地存储异常，部分功能可能受限',
  VALIDATION_ERROR: '输入数据验证失败',
  UNKNOWN_ERROR: '发生未知错误，请刷新页面重试'
}

// 成功消息
export const SUCCESS_MESSAGES = {
  CONFIG_SAVED: '配置保存成功',
  MESSAGE_SENT: '消息发送成功',
  FILE_EXPORTED: '文件导出成功',
  DATA_LOADED: '数据加载完成',
  OPERATION_SUCCESS: '操作执行成功'
}

// 应用信息
export const APP_INFO = {
  name: '神农集团数字化平台',
  version: '2.0.0',
  description: '智慧农牧业数字化转型解决方案',
  author: '神农集团技术团队',
  copyright: '© 2024 神农集团. All rights reserved.'
}