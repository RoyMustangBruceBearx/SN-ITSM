# 神农集团数字化平台 v2.0

> 🌾 现代化重构版本 - 智慧农牧业数字化转型解决方案

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](package.json)
[![Platform](https://img.shields.io/badge/platform-Web-orange.svg)](README.md)
[![Build](https://img.shields.io/badge/build-Vite-646CFF.svg)](vite.config.js)

## 📋 项目简介

神农集团数字化平台v2.0是一个面向农牧业生产管理的现代化Web应用系统，经过完整重构升级。平台采用模块化架构和事件驱动设计，集成了AI智能助手、思维导图工具、系统导航门户等核心模块，为农牧业企业提供智能化数字化转型解决方案。

### ✨ 核心特性

- 🤖 **AI智能助手** - 神农晓问，专业的农牧业智能咨询助手，支持流式对话
- 🧠 **思维导图工具** - 在线业务规划和流程梳理工具，支持实时协作
- 🏢 **系统门户** - 12个业务系统的统一入口和智能导航
- 📊 **数据可视化** - 商业地产平面图和业务数据实时展示
- 📱 **响应式设计** - 完美支持桌面端、平板和移动端访问
- 🔄 **实时交互** - 基于SSE的流式对话和实时数据更新
- ⚡ **现代化架构** - Vite构建工具，ES6+模块化，高性能体验

### 🎉 重构成果

#### ✅ 已完成的现代化升级

**项目架构重构**:
- ✅ 从单文件HTML项目重构为现代化前端项目
- ✅ 建立标准的项目目录结构和开发规范
- ✅ 实现模块化组件架构和服务化设计
- ✅ 配置Vite构建工具和现代化开发工具链

**核心功能实现**:
- ✅ **路由管理器** - 完整的SPA路由系统，支持懒加载
- ✅ **事件总线** - 组件间通信机制，发布订阅模式
- ✅ **配置服务** - 统一的应用配置管理和持久化
- ✅ **AI服务** - 完整的AI API集成，支持流式响应
- ✅ **首页组件** - 完全复刻原始UI，12个系统展示

**开发体验提升**:
- ✅ 热更新开发服务器，实时预览
- ✅ ESLint + Prettier代码规范工具
- ✅ Vitest单元测试框架
- ✅ TypeScript配置支持

**UI/UX完全复刻**:
- ✅ 100%还原原始设计视觉效果
- ✅ 响应式设计，多设备完美适配
- ✅ 流畅的交互动画和过渡效果
- ✅ 现代化的毛玻璃和渐变设计

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- 现代浏览器 (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)

### 安装和运行
```bash
# 克隆项目
git clone https://github.com/your-org/shengnong-platform-v2.git
cd shengnong-platform-v2

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 运行测试
npm run test

# 代码检查和格式化
npm run lint
npm run format
```

### 访问地址
- 🏠 **开发服务器**: http://localhost:3000
- 🏢 **系统门户**: http://localhost:3000/#/
- 🤖 **AI助手**: http://localhost:3000/#/ai-assistant
- 🧠 **思维导图**: http://localhost:3000/#/mindmap
- 📊 **平面图**: http://localhost:3000/#/floorplan

## 📁 项目结构

```
shengnong-platform-v2/
├── 📁 public/                          # 静态资源目录
│   ├── 📄 index.html                   # 主HTML模板
│   ├── 📁 images/                      # 图片资源
│   │   ├── 📄 logo.png                 # 神农集团Logo
│   │   ├── 📄 bg-agriculture.jpg       # 农业背景图
│   │   └── 📁 icons/                   # 系统图标
│   └── 📁 data/                        # 静态数据文件
│       ├── 📄 systems.json             # 系统配置数据
│       └── 📄 mindmap-templates.json   # 思维导图模板
│
├── 📁 src/                             # 源代码目录
│   ├── 📁 components/                  # 可复用组件库
│   │   ├── 📁 common/                  # 通用UI组件
│   │   │   ├── 📄 Header.js            # 页面头部
│   │   │   ├── 📄 Sidebar.js           # 侧边栏
│   │   │   ├── 📄 Modal.js             # 模态框
│   │   │   ├── 📄 Loading.js           # 加载动画
│   │   │   └── 📄 Toast.js             # 消息提示
│   │   ├── 📁 ai-chat/                 # AI聊天组件
│   │   │   ├── 📄 ChatContainer.js     # 聊天容器
│   │   │   ├── 📄 MessageList.js       # 消息列表
│   │   │   ├── 📄 MessageItem.js       # 消息项
│   │   │   ├── 📄 InputBox.js          # 输入框
│   │   │   ├── 📄 QuickReplies.js      # 快速回复
│   │   │   └── 📄 ConfigPanel.js       # 配置面板
│   │   ├── 📁 mindmap/                 # 思维导图组件
│   │   │   ├── 📄 MindMapCanvas.js     # 画布组件
│   │   │   ├── 📄 Toolbar.js           # 工具栏
│   │   │   ├── 📄 NodeEditor.js        # 节点编辑器
│   │   │   └── 📄 ExportPanel.js       # 导出面板
│   │   └── 📁 portal/                  # 门户组件
│   │       ├── 📄 SystemGrid.js        # 系统网格
│   │       ├── 📄 SystemCard.js        # 系统卡片
│   │       ├── 📄 SearchBar.js         # 搜索栏
│   │       └── 📄 StatsBar.js          # 统计栏
│   │
│   ├── 📁 pages/                       # 页面组件
│   │   ├── 📄 HomePage.js              # 🏠 首页/门户页面
│   │   ├── 📄 AIAssistantPage.js       # 🤖 AI助手页面
│   │   ├── 📄 MindMapPage.js           # 🧠 思维导图页面
│   │   └── 📄 FloorPlanPage.js         # 📊 平面图页面
│   │
│   ├── 📁 services/                    # 业务服务层
│   │   ├── 📄 api.js                   # API基础服务
│   │   ├── 📄 aiService.js             # 🤖 AI服务集成
│   │   ├── 📄 configService.js         # ⚙️ 配置管理服务
│   │   └── 📄 storageService.js        # 💾 存储服务
│   │
│   ├── 📁 utils/                       # 工具函数库
│   │   ├── 📄 constants.js             # 📋 常量定义
│   │   ├── 📄 helpers.js               # 🔧 辅助函数
│   │   ├── 📄 validators.js            # ✅ 验证函数
│   │   ├── 📄 formatters.js            # 📝 格式化函数
│   │   └── 📄 eventBus.js              # 📡 事件总线
│   │
│   ├── 📁 styles/                      # 样式文件
│   │   ├── 📄 main.css                 # 主样式文件
│   │   ├── 📄 variables.css            # CSS变量定义
│   │   ├── 📄 reset.css                # 样式重置
│   │   ├── 📁 components/              # 组件样式
│   │   │   ├── 📄 chat.css             # AI聊天样式
│   │   │   ├── 📄 mindmap.css          # 思维导图样式
│   │   │   └── 📄 portal.css           # 门户样式
│   │   └── 📁 pages/                   # 页面样式
│   │       ├── 📄 home.css             # 首页样式
│   │       └── 📄 ai-assistant.css     # AI助手样式
│   │
│   ├── 📁 assets/                      # 静态资源
│   │   ├── 📁 fonts/                   # 字体文件
│   │   ├── 📁 icons/                   # 图标文件
│   │   └── 📁 images/                  # 图片文件
│   │
│   ├── 📄 main.js                      # 🚀 应用入口文件
│   ├── 📄 app.js                       # 📱 应用主类
│   └── 📄 router.js                    # 🛣️ 路由配置
│
├── 📁 tests/                           # 测试文件
│   ├── 📁 unit/                        # 单元测试
│   │   ├── 📄 components/              # 组件测试
│   │   ├── 📄 services/                # 服务测试
│   │   └── 📄 utils/                   # 工具测试
│   ├── 📁 integration/                 # 集成测试
│   └── 📄 setup.js                     # 测试配置
│
├── 📁 docs/                            # 项目文档
│   ├── 📄 README.md                    # 项目说明
│   ├── 📄 DESIGN.md                    # 设计文档
│   ├── 📄 API.md                       # API文档
│   └── 📄 DEPLOYMENT.md                # 部署文档
│
├── 📁 config/                          # 配置文件
│   └── 📁 env/                         # 环境配置
│
├── 📁 scripts/                         # 构建脚本
│   ├── 📄 build.js                     # 构建脚本
│   ├── 📄 dev.js                       # 开发脚本
│   └── 📄 deploy.js                    # 部署脚本
│
├── 📄 package.json                     # 项目配置
├── 📄 vite.config.js                   # Vite配置
├── 📄 .eslintrc.js                     # ESLint配置
├── 📄 .prettierrc                      # Prettier配置
├── 📄 .gitignore                       # Git忽略文件
└── 📄 README.md                        # 项目说明
```

## 🎯 功能模块

### 🏢 系统门户 (HomePage)

**核心功能**：
- 🎯 12个业务系统快速导航和智能搜索
- 🔍 实时搜索和分类筛选，支持模糊匹配
- 📊 网格/列表视图切换，个性化展示
- ⭐ 系统收藏管理，快速访问常用系统
- 📈 实时在线用户统计和系统状态监控
- 🤖 集成AI助手浮动按钮，随时获得帮助

**业务系统清单**：
1. 🏭 **生产管理平台** - 畜禽养殖生产过程监控、数据统计分析
2. 🐄 **智慧养殖系统** - 环境监控、自动投喂、健康管理
3. 🌾 **饲料管理系统** - 饲料配方、库存管理、质量追溯
4. 🏥 **兽医服务平台** - 动物健康监测、疫病防控、诊疗记录
5. 🚚 **智慧物流系统** - 运输调度、路径优化、货物跟踪
6. 🛡️ **食品安全追溯** - 从养殖到餐桌的全链条质量追溯
7. 💰 **财务管理系统** - 成本核算、收支管理、财务分析
8. 👥 **人力资源平台** - 员工管理、考勤统计、薪酬计算
9. 🌱 **环保监测系统** - 污染物监测、环保数据上报、治理效果
10. 📊 **BI数据分析** - 数据可视化、经营分析、决策支持
11. 🛒 **采购管理系统** - 供应商管理、采购流程、成本控制
12. 📱 **移动办公OA** - 审批流程、通知公告、移动办公

### 🤖 AI智能助手 (AIAssistantPage)

**核心功能**：
- 💬 **流式对话** - 基于SSE的实时流式响应，自然流畅
- 🧠 **上下文管理** - 多轮对话上下文保持，智能理解
- ⚡ **快速回复** - 智能生成回复建议，提高效率
- 📝 **消息管理** - 支持复制、重新生成、点赞、导出
- 💾 **会话管理** - ChatID机制支持会话持久化
- ⚙️ **配置管理** - 灵活的API配置和参数调整

**技术特性**：
- 🔄 **自动重试** - 指数退避重试机制，保证服务可靠性
- 🛡️ **错误处理** - 完善的错误处理和用户友好提示
- 📡 **实时通信** - Server-Sent Events流式数据传输
- 🎨 **响应式UI** - 适配各种设备屏幕尺寸

### 🧠 思维导图工具 (MindMapPage)

**核心功能**：
- 🎨 **节点管理** - 创建、编辑、删除、移动节点
- 🎭 **样式定制** - 颜色、渐变、圆角、字体个性化设置
- 🔗 **连接线** - 贝塞尔曲线连接，美观的父子关系展示
- 🖱️ **交互操作** - 拖拽、缩放、撤销/重做，流畅操作体验
- 💾 **数据持久化** - JSON格式导入导出，支持数据备份

### 📊 平面图展示 (FloorPlanPage)

**核心功能**：
- 🏢 **商业地产布局** - 直观的平面图展示
- 📍 **区域标注** - 重要区域和设施标注
- 🔍 **缩放浏览** - 支持缩放和平移浏览
- 📱 **响应式设计** - 多设备完美适配

## 🛠️ 技术架构

### 核心技术栈
- **构建工具**: Vite 5.x - 现代化快速构建工具
- **开发语言**: 原生JavaScript ES6+ - 无框架依赖，轻量高效
- **样式技术**: CSS3 + CSS Variables - 模块化样式系统
- **图标库**: Font Awesome 6.4.0 - 丰富的图标资源
- **HTTP客户端**: Axios 1.6.2 - 可靠的HTTP请求库
- **日期处理**: Day.js 1.11.10 - 轻量级日期处理库

### 开发工具链
- **代码规范**: ESLint + Prettier - 统一代码风格
- **测试框架**: Vitest - 快速单元测试
- **类型检查**: TypeScript配置 - 可选类型支持
- **版本控制**: Git + GitHub - 代码版本管理

### 架构设计
```
┌─────────────────────────────────────────┐
│         前端展示层 (Pages)               │
│  HomePage | AIAssistantPage | MindMapPage│
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      业务逻辑层 (Services)               │
│  AIService | ConfigService | Router      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      工具函数层 (Utils)                  │
│  EventBus | Helpers | Constants          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      数据存储层 (Storage)                │
│  LocalStorage | SessionStorage | Memory  │
└─────────────────────────────────────────┘
```

## ⚙️ AI服务配置

### 默认配置
```javascript
const AI_CONFIG = {
    baseUrl: 'http://47.236.87.251:3000/api',
    model: 'qwen2.5:7b',
    maxTokens: 4000,
    temperature: 0.7,
    timeout: 30000,
    maxRetries: 3
}
```

### 配置步骤
1. 打开AI助手页面 (http://localhost:3000/#/ai-assistant)
2. 点击设置按钮 ⚙️
3. 配置API信息：
   - **API地址**: `http://47.236.87.251:3000/api`
   - **模型名称**: `qwen2.5:7b`
   - **API密钥**: 联系管理员获取
4. 保存配置并测试连接

## 🚀 性能优化

### 加载性能
- ⚡ **代码分割** - 路由级别的懒加载
- 🗜️ **资源压缩** - CSS/JS文件压缩和合并
- 💾 **缓存策略** - 浏览器缓存和CDN加速
- 🔄 **预加载** - 关键资源预加载

### 运行时性能
- 🎯 **防抖节流** - 搜索输入和滚动事件优化
- 📡 **事件委托** - 减少DOM事件监听器数量
- 🧠 **内存管理** - 及时清理事件监听器和定时器
- 🔄 **流式处理** - SSE实时数据流优化

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试UI界面
npm run test:ui

# 监听模式运行测试
npm run test:watch
```

### 测试覆盖
- ✅ **单元测试** - 工具函数和服务类
- ✅ **组件测试** - 关键UI组件
- ✅ **集成测试** - 路由和事件通信
- ✅ **端到端测试** - 用户关键流程

## 📦 部署

### 构建生产版本
```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

### 部署方案
- **静态部署**: Nginx/Apache静态文件服务
- **容器化**: Docker容器部署
- **CDN**: 静态资源CDN分发
- **HTTPS**: 强制HTTPS访问

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://47.236.87.251:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔧 开发指南

### 开发环境设置
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循ES6+模块化编程规范
- 组件和服务采用类的方式组织
- 事件驱动的组件间通信

### 添加新页面
1. 在`src/pages/`目录创建页面组件
2. 在`src/router.js`中注册路由
3. 在`src/app.js`中配置路由映射
4. 添加对应的样式文件

### 添加新服务
1. 在`src/services/`目录创建服务类
2. 实现标准的服务接口
3. 在需要的组件中导入使用
4. 添加相应的单元测试

## 🤝 贡献指南

### 开发流程
1. Fork项目到个人仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

### 代码提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 团队

- **项目负责人**: 神农集团技术团队
- **架构设计**: 前端架构师
- **UI/UX设计**: 用户体验设计师
- **后端支持**: 后端开发团队

## 📞 联系我们

- **项目地址**: https://github.com/your-org/shengnong-platform-v2
- **问题反馈**: https://github.com/your-org/shengnong-platform-v2/issues
- **技术支持**: tech-support@shengnong.com
- **官方网站**: https://www.shengnong.com

## 🎯 路线图

### 短期目标 (1-2周)
- [ ] 完善AI助手高级功能
- [ ] 实现思维导图完整功能
- [ ] 添加完整的单元测试覆盖
- [ ] 优化移动端用户体验

### 中期目标 (1-2月)
- [ ] PWA功能实现
- [ ] 离线模式支持
- [ ] CI/CD自动化流程
- [ ] 性能监控和分析

### 长期规划 (3-6月)
- [ ] 微前端架构升级
- [ ] 多语言国际化支持
- [ ] 主题系统扩展
- [ ] 插件机制和生态

---

<div align="center">

**🌾 神农集团数字化平台 v2.0 - 让农牧业更智慧 🌾**

Made with ❤️ by 神农集团技术团队

</div>

```
shengnong-platform-v2/
├── public/                     # 静态资源
├── src/                        # 源代码
│   ├── components/             # 可复用组件
│   │   ├── common/            # 通用组件
│   │   ├── ai-chat/           # AI聊天组件
│   │   ├── mindmap/           # 思维导图组件
│   │   └── portal/            # 门户组件
│   ├── pages/                 # 页面组件
│   │   ├── HomePage.js        # 首页
│   │   ├── AIAssistantPage.js # AI助手页面
│   │   ├── MindMapPage.js     # 思维导图页面
│   │   └── FloorPlanPage.js   # 平面图页面
│   ├── services/              # 服务层
│   │   ├── configService.js   # 配置服务
│   │   └── aiService.js       # AI服务
│   ├── utils/                 # 工具函数
│   │   ├── constants.js       # 常量定义
│   │   ├── helpers.js         # 辅助函数
│   │   └── eventBus.js        # 事件总线
│   ├── styles/                # 样式文件
│   │   ├── main.css           # 主样式
│   │   └── pages/             # 页面样式
│   ├── main.js                # 应用入口
│   ├── app.js                 # 应用主类
│   └── router.js              # 路由管理
├── tests/                     # 测试文件
├── docs/                      # 文档
├── package.json               # 项目配置
├── vite.config.js            # Vite配置
└── README.md                 # 项目说明
```

## 🎯 核心功能

### 1. 系统门户
- **12个业务系统**: 生产管理、智慧养殖、饲料管理等
- **智能搜索**: 实时搜索系统功能
- **分类筛选**: 按业务分类筛选系统
- **视图切换**: 网格视图和列表视图
- **收藏管理**: 常用系统收藏功能
- **实时统计**: 在线用户和访问统计

### 2. 技术特性
- **模块化架构**: 组件化开发，便于维护
- **响应式设计**: 适配桌面、平板、移动端
- **现代化UI**: 毛玻璃效果、渐变色、动画
- **事件驱动**: 基于事件总线的组件通信
- **配置管理**: 统一的配置服务
- **路由管理**: SPA单页应用路由

## 🔧 开发指南

### 添加新页面
1. 在 `src/pages/` 创建页面组件
2. 在 `src/router.js` 注册路由
3. 在 `src/styles/pages/` 添加页面样式

### 添加新组件
1. 在 `src/components/` 对应目录创建组件
2. 导出组件类或函数
3. 在需要的地方导入使用

### 配置管理
```javascript
import { ConfigService } from './services/configService.js'

const configService = new ConfigService()
await configService.loadConfig()
const aiConfig = configService.getAIConfig()
```

### 事件通信
```javascript
import { EventBus } from './utils/eventBus.js'

// 监听事件
EventBus.on('user:login', (user) => {
  console.log('用户登录:', user)
})

// 触发事件
EventBus.emit('user:login', { name: '张三' })
```

## 📊 性能优化

### 已实现的优化
- ✅ **代码分割**: 按页面分割代码
- ✅ **懒加载**: 路由级别的懒加载
- ✅ **防抖节流**: 搜索输入防抖处理
- ✅ **事件委托**: 减少事件监听器数量
- ✅ **CSS优化**: 使用CSS变量和现代特性

### 待优化项目
- ⏳ 虚拟滚动（大数据列表）
- ⏳ 图片懒加载
- ⏳ Service Worker缓存
- ⏳ CDN资源优化

## 🔒 安全特性

- ✅ **XSS防护**: 输入内容转义处理
- ✅ **HTTPS支持**: 生产环境HTTPS部署
- ✅ **配置加密**: 敏感配置本地加密
- ✅ **错误处理**: 安全的错误信息返回

## 🧪 测试

```bash
# 运行测试
npm run test

# 运行测试UI
npm run test:ui

# 生成覆盖率报告
npm run test:coverage

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 📈 与原版本对比

| 特性 | 原版本 | 重构版本 | 改进 |
|------|--------|----------|------|
| 架构 | 单文件HTML | 模块化组件 | ✅ 可维护性提升 |
| 构建 | 无构建工具 | Vite构建 | ✅ 开发效率提升 |
| 样式 | 内联CSS | 模块化CSS | ✅ 样式管理优化 |
| 路由 | 无路由 | SPA路由 | ✅ 用户体验提升 |
| 状态 | 全局变量 | 服务管理 | ✅ 状态管理规范 |
| 测试 | 无测试 | 单元测试 | ✅ 代码质量保障 |
| 部署 | 静态文件 | 构建优化 | ✅ 性能优化 |

## 🚧 下一步开发计划

### 短期目标 (1-2周)
- [ ] 完善AI助手功能实现
- [ ] 完善思维导图功能实现
- [ ] 添加更多单元测试
- [ ] 优化移动端体验

### 中期目标 (1-2月)
- [ ] 实现PWA功能
- [ ] 添加离线支持
- [ ] 集成CI/CD流程
- [ ] 性能监控系统

### 长期规划 (3-6月)
- [ ] 微前端架构
- [ ] 多语言支持
- [ ] 主题系统扩展
- [ ] 插件机制

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢以下开源项目和服务：
- [Vite](https://vitejs.dev/) - 快速的构建工具
- [Font Awesome](https://fontawesome.com/) - 图标库
- [Day.js](https://day.js.org/) - 轻量级日期库
- [Axios](https://axios-http.com/) - HTTP客户端

---

<div align="center">

**🌾 神农集团数字化平台 v2.0 - 让农牧业更智慧 🌾**

Made with ❤️ by 神农集团技术团队

</div>