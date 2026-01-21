/**
 * 应用常量定义
 */

// 系统信息
export const SYSTEM_INFO = {
  name: '神农集团信息数字化平台',
  version: '1.0.0',
  website: 'www.ynsnjt.cn',
  company: '云南神农农业产业集团股份有限公司',
  department: '卓越运营中心',
  icp: '滇ICP备11003474号-3'
}

// 平台清单 - IT系统模块 - 基于www.ynsnjt.cn的内容结构
export const PLATFORM_SYSTEMS = [
  {
    id: 1,
    name: 'ERP企业资源规划',
    description: '集团财务、人力、采购、销售一体化管理',
    icon: 'fas fa-chart-line',
    status: '正常运行',
    url: '#',
    category: 'core',
    favorited: true
  },
  {
    id: 2,
    name: 'OA办公自动化',
    description: '审批流程、文档管理、协同办公',
    icon: 'fas fa-file-alt',
    status: '正常运行',
    url: '#',
    category: 'office',
    favorited: false
  },
  {
    id: 3,
    name: 'CRM客户关系管理',
    description: '客户信息、销售机会、服务跟踪',
    icon: 'fas fa-users',
    status: '正常运行',
    url: '#',
    category: 'business',
    favorited: false
  },
  {
    id: 4,
    name: 'SCM供应链管理',
    description: '供应商管理、采购流程、库存控制',
    icon: 'fas fa-truck',
    status: '正常运行',
    url: '#',
    category: 'business',
    favorited: true
  },
  {
    id: 5,
    name: 'BI商业智能',
    description: '数据分析、报表展示、决策支持',
    icon: 'fas fa-chart-pie',
    status: '正常运行',
    url: '#',
    category: 'analytics',
    favorited: false
  },
  {
    id: 6,
    name: 'HR人力资源系统',
    description: '员工管理、薪酬计算、绩效考核',
    icon: 'fas fa-user-tie',
    status: '正常运行',
    url: '#',
    category: 'hr',
    favorited: false
  },
  {
    id: 7,
    name: '财务管理系统',
    description: '会计核算、成本控制、预算管理',
    icon: 'fas fa-calculator',
    status: '正常运行',
    url: '#',
    category: 'finance',
    favorited: true
  },
  {
    id: 8,
    name: '项目管理系统',
    description: '项目计划、进度跟踪、资源分配',
    icon: 'fas fa-tasks',
    status: '正常运行',
    url: '#',
    category: 'project',
    favorited: false
  },
  {
    id: 9,
    name: '质量管理系统',
    description: '质量标准、检验流程、不合格品处理',
    icon: 'fas fa-award',
    status: '正常运行',
    url: '#',
    category: 'quality',
    favorited: false
  },
  {
    id: 10,
    name: '安全管理系统',
    description: '安全监控、风险评估、应急响应',
    icon: 'fas fa-shield-alt',
    status: '正常运行',
    url: '#',
    category: 'security',
    favorited: false
  },
  {
    id: 11,
    name: '移动应用平台',
    description: '移动办公、现场作业、实时通讯',
    icon: 'fas fa-mobile-alt',
    status: '正常运行',
    url: '#',
    category: 'mobile',
    favorited: false
  },
  {
    id: 12,
    name: '数据中心管理',
    description: '服务器监控、网络管理、数据备份',
    icon: 'fas fa-server',
    status: '正常运行',
    url: '#',
    category: 'infrastructure',
    favorited: false
  }
]

// 系统清单
export const SYSTEM_LIST = [
  {
    id: 101,
    name: '集团官网',
    description: '神农集团官方网站，企业形象展示',
    icon: 'fas fa-globe',
    status: '正常运行',
    url: 'https://www.ynsnjt.cn',
    category: 'website',
    favorited: true
  },
  {
    id: 102,
    name: '企业邮箱',
    description: '企业内部邮件通讯系统',
    icon: 'fas fa-envelope',
    status: '正常运行',
    url: '#',
    category: 'communication',
    favorited: false
  },
  {
    id: 103,
    name: 'TMS系统',
    description: '运输管理系统，物流运输调度',
    icon: 'fas fa-truck',
    status: '正常运行',
    url: '#',
    category: 'logistics',
    favorited: true
  },
  {
    id: 104,
    name: '监控方案平台',
    description: '集成视频监控、智能分析及数据管理',
    icon: 'fas fa-video',
    status: '正常运行',
    url: '#',
    category: 'monitoring',
    favorited: false
  },
  {
    id: 105,
    name: 'VPN',
    description: '虚拟专用网络，远程安全接入',
    icon: 'fas fa-shield-alt',
    status: '正常运行',
    url: '#',
    category: 'security',
    favorited: false
  },
  {
    id: 106,
    name: '影像系统',
    description: '文档影像管理和存储系统',
    icon: 'fas fa-images',
    status: '正常运行',
    url: '#',
    category: 'document',
    favorited: false
  },
  {
    id: 107,
    name: 'HR北森',
    description: '北森人力资源管理系统',
    icon: 'fas fa-user-tie',
    status: '正常运行',
    url: '#',
    category: 'hr',
    favorited: true
  },
  {
    id: 108,
    name: '泛微OA',
    description: '泛微协同办公管理系统',
    icon: 'fas fa-file-alt',
    status: '正常运行',
    url: '#',
    category: 'office',
    favorited: false
  },
  {
    id: 109,
    name: 'MDG',
    description: '主数据治理系统',
    icon: 'fas fa-database',
    status: '正常运行',
    url: '#',
    category: 'data',
    favorited: false
  },
  {
    id: 110,
    name: '信息系统',
    description: '企业综合信息管理系统',
    icon: 'fas fa-cogs',
    status: '正常运行',
    url: '#',
    category: 'system',
    favorited: true
  },
  {
    id: 111,
    name: '数据分析平台',
    description: '大数据分析和商业智能平台',
    icon: 'fas fa-chart-bar',
    status: '正常运行',
    url: '#',
    category: 'analytics',
    favorited: false
  },
  {
    id: 112,
    name: '档案系统',
    description: '企业档案管理和存储系统',
    icon: 'fas fa-archive',
    status: '正常运行',
    url: '#',
    category: 'archive',
    favorited: false
  },
  {
    id: 113,
    name: '实验室管理系统',
    description: '实验室设备和流程管理',
    icon: 'fas fa-flask',
    status: '正常运行',
    url: '#',
    category: 'lab',
    favorited: false
  },
  {
    id: 114,
    name: '历史系统',
    description: '历史遗留系统集合',
    icon: 'fas fa-history',
    status: '部分运行',
    url: '#',
    category: 'legacy',
    favorited: false,
    isHistoryEntry: true
  }
]

// 历史系统清单
export const HISTORY_SYSTEMS = [
  {
    id: 201,
    name: '信息系统2.0',
    description: '第二代企业信息管理系统',
    icon: 'fas fa-cogs',
    status: '维护中',
    url: '#',
    category: 'legacy',
    favorited: false
  },
  {
    id: 202,
    name: '信息系统1.0',
    description: '第一代企业信息管理系统',
    icon: 'fas fa-cog',
    status: '已停用',
    url: '#',
    category: 'legacy',
    favorited: false
  },
  {
    id: 203,
    name: '绩效考核',
    description: '员工绩效考核管理系统',
    icon: 'fas fa-chart-line',
    status: '已迁移',
    url: '#',
    category: 'legacy',
    favorited: false
  },
  {
    id: 204,
    name: '财务共享',
    description: '财务共享服务中心系统',
    icon: 'fas fa-coins',
    status: '已迁移',
    url: '#',
    category: 'legacy',
    favorited: false
  },
  {
    id: 205,
    name: 'SHR',
    description: '人力资源共享服务系统',
    icon: 'fas fa-users',
    status: '已停用',
    url: '#',
    category: 'legacy',
    favorited: false
  },
  {
    id: 206,
    name: 'Success Factors',
    description: 'SAP SuccessFactors人力资源套件',
    icon: 'fas fa-user-check',
    status: '已迁移',
    url: '#',
    category: 'legacy',
    favorited: false
  }
]

// 系统清单类型
export const SYSTEM_LIST_TYPES = {
  PLATFORM: 'platform',
  SYSTEM: 'system', 
  HISTORY: 'history'
}

// 清单配置
export const LIST_CONFIG = {
  [SYSTEM_LIST_TYPES.PLATFORM]: {
    title: '平台',
    subtitle: 'IT平台系统集合',
    data: 'PLATFORM_SYSTEMS'
  },
  [SYSTEM_LIST_TYPES.SYSTEM]: {
    title: '系统',
    subtitle: '企业核心业务系统',
    data: 'SYSTEM_LIST'
  },
  [SYSTEM_LIST_TYPES.HISTORY]: {
    title: '历史系统清单',
    subtitle: '历史遗留系统集合',
    data: 'HISTORY_SYSTEMS'
  }
}

// 系统分类
export const SYSTEM_CATEGORIES = {
  core: { name: '核心系统', color: '#FF6B6B', icon: 'fas fa-star' },
  office: { name: '办公系统', color: '#4ECDC4', icon: 'fas fa-briefcase' },
  business: { name: '业务系统', color: '#45B7D1', icon: 'fas fa-handshake' },
  analytics: { name: '分析系统', color: '#96CEB4', icon: 'fas fa-chart-bar' },
  hr: { name: '人力资源', color: '#8B7355', icon: 'fas fa-user-friends' },
  finance: { name: '财务系统', color: '#9575CD', icon: 'fas fa-coins' },
  project: { name: '项目管理', color: '#4DB6AC', icon: 'fas fa-project-diagram' },
  quality: { name: '质量管理', color: '#A1887F', icon: 'fas fa-check-circle' },
  security: { name: '安全管理', color: '#E57373', icon: 'fas fa-lock' },
  mobile: { name: '移动应用', color: '#64B5F6', icon: 'fas fa-mobile' },
  infrastructure: { name: '基础设施', color: '#BA68C8', icon: 'fas fa-cogs' },
  // 新增系统清单分类
  website: { name: '网站门户', color: '#FF8A65', icon: 'fas fa-globe' },
  communication: { name: '通讯系统', color: '#5C6BC0', icon: 'fas fa-comments' },
  logistics: { name: '物流系统', color: '#81C784', icon: 'fas fa-shipping-fast' },
  monitoring: { name: '监控系统', color: '#9C27B0', icon: 'fas fa-video' },
  document: { name: '文档系统', color: '#4DB6AC', icon: 'fas fa-file-alt' },
  data: { name: '数据系统', color: '#7986CB', icon: 'fas fa-database' },
  system: { name: '信息系统', color: '#8D6E63', icon: 'fas fa-desktop' },
  archive: { name: '档案系统', color: '#90A4AE', icon: 'fas fa-folder' },
  lab: { name: '实验室', color: '#FFB74D', icon: 'fas fa-microscope' },
  legacy: { name: '历史系统', color: '#A1887F', icon: 'fas fa-history' }
}

// 联系信息
export const CONTACT_INFO = {
  phone: '400-626-8888',
  email: 'it@ynsnjt.com',
  address: '云南省昆明市',
  website: 'www.ynsnjt.cn'
}

// API配置
export const API_CONFIG = {
  baseURL: '/api',
  timeout: 10000,
  retryTimes: 3
}

// 主题配置
export const THEME_CONFIG = {
  primary: '#4A90E2',
  secondary: '#FF69B4',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3'
}