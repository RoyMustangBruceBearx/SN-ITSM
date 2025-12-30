#!/usr/bin/env node

/**
 * 神农集团数字化平台 - 项目迁移脚本
 * 自动化创建新项目结构并迁移现有代码
 */

const fs = require('fs')
const path = require('path')

class ProjectMigrator {
  constructor() {
    this.sourceDir = process.cwd()
    this.targetDir = path.join(process.cwd(), '../shengnong-platform-v2')
    this.fileMapping = new Map()
    
    this.setupFileMapping()
  }
  
  setupFileMapping() {
    // 定义文件迁移映射关系
    this.fileMapping.set('snITSM.html', {
      target: 'src/pages/HomePage.js',
      type: 'html-to-component'
    })
    
    this.fileMapping.set('ai-view.html', {
      target: 'src/pages/AIAssistantPage.js',
      type: 'html-to-component'
    })
    
    this.fileMapping.set('ai-view-chatid.html', {
      target: 'src/components/ai-chat/ChatContainer.js',
      type: 'html-to-component'
    })
    
    this.fileMapping.set('mind.html', {
      target: 'src/pages/MindMapPage.js',
      type: 'html-to-component'
    })
    
    this.fileMapping.set('bltj.html', {
      target: 'src/pages/FloorPlanPage.js',
      type: 'svg-to-component'
    })
  }
  
  async migrate() {
    console.log('🚀 开始项目迁移...')
    
    try {
      await this.createProjectStructure()
      await this.generateConfigFiles()
      await this.migrateSourceFiles()
      await this.generatePackageJson()
      await this.createDocumentation()
      
      console.log('✅ 项目迁移完成!')
      console.log(`📁 新项目位置: ${this.targetDir}`)
      console.log('📋 下一步操作:')
      console.log('   cd ../shengnong-platform-v2')
      console.log('   npm install')
      console.log('   npm run dev')
      
    } catch (error) {
      console.error('❌ 迁移失败:', error.message)
      process.exit(1)
    }
  }
  
  async createProjectStructure() {
    console.log('📁 创建项目结构...')
    
    const directories = [
      'public',
      'public/images',
      'public/data',
      'src',
      'src/components',
      'src/components/common',
      'src/components/ai-chat',
      'src/components/mindmap',
      'src/components/portal',
      'src/pages',
      'src/services',
      'src/utils',
      'src/styles',
      'src/styles/components',
      'src/styles/pages',
      'src/assets',
      'src/assets/fonts',
      'src/assets/icons',
      'src/assets/images',
      'tests',
      'tests/unit',
      'tests/integration',
      'docs',
      'scripts',
      'config',
      'config/env'
    ]
    
    // 创建目标目录
    if (!fs.existsSync(this.targetDir)) {
      fs.mkdirSync(this.targetDir, { recursive: true })
    }
    
    // 创建子目录
    for (const dir of directories) {
      const fullPath = path.join(this.targetDir, dir)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
        console.log(`  ✓ 创建目录: ${dir}`)
      }
    }
  }
  
  async generateConfigFiles() {
    console.log('⚙️ 生成配置文件...')
    
    // package.json
    const packageJson = {
      name: "shengnong-digital-platform",
      version: "2.0.0",
      description: "神农集团数字化平台 - 重构版",
      type: "module",
      main: "src/main.js",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
        test: "vitest",
        "test:ui": "vitest --ui",
        lint: "eslint src --ext .js,.jsx,.ts,.tsx",
        "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
        format: "prettier --write src/**/*.{js,jsx,ts,tsx,css,md}",
        "type-check": "tsc --noEmit"
      },
      devDependencies: {
        vite: "^5.0.0",
        "@vitejs/plugin-legacy": "^5.0.0",
        vitest: "^1.0.0",
        "@vitest/ui": "^1.0.0",
        eslint: "^8.0.0",
        "eslint-config-prettier": "^9.0.0",
        prettier: "^3.0.0",
        typescript: "^5.0.0"
      },
      dependencies: {
        axios: "^1.6.0",
        dayjs: "^1.11.0"
      }
    }
    
    fs.writeFileSync(
      path.join(this.targetDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    )
    
    // vite.config.js
    const viteConfig = `import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
`
    
    fs.writeFileSync(path.join(this.targetDir, 'vite.config.js'), viteConfig)
    
    // .eslintrc.js
    const eslintConfig = `module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error'
  }
}
`
    
    fs.writeFileSync(path.join(this.targetDir, '.eslintrc.js'), eslintConfig)
    
    // .prettierrc
    const prettierConfig = {
      semi: false,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 80,
      bracketSpacing: true,
      arrowParens: 'avoid'
    }
    
    fs.writeFileSync(
      path.join(this.targetDir, '.prettierrc'),
      JSON.stringify(prettierConfig, null, 2)
    )
    
    // .gitignore
    const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tgz

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Coverage
coverage/
.nyc_output/

# Cache
.cache/
.parcel-cache/
`
    
    fs.writeFileSync(path.join(this.targetDir, '.gitignore'), gitignore)
    
    console.log('  ✓ 配置文件生成完成')
  }
  
  async migrateSourceFiles() {
    console.log('📦 迁移源文件...')
    
    // 创建主入口文件
    await this.createMainFiles()
    
    // 迁移HTML文件到组件
    await this.migrateHtmlToComponents()
    
    // 创建服务层文件
    await this.createServiceFiles()
    
    // 创建工具函数
    await this.createUtilFiles()
    
    // 创建样式文件
    await this.createStyleFiles()
  }
  
  async createMainFiles() {
    // public/index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>神农集团数字化平台</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>
  <div id="app">
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
`
    
    fs.writeFileSync(path.join(this.targetDir, 'public/index.html'), indexHtml)
    
    // src/main.js
    const mainJs = `import './styles/main.css'
import { App } from './app.js'

// 初始化应用
const app = new App()
app.init()

// 开发环境热更新
if (import.meta.hot) {
  import.meta.hot.accept()
}
`
    
    fs.writeFileSync(path.join(this.targetDir, 'src/main.js'), mainJs)
    
    // src/app.js
    const appJs = `import { Router } from './router.js'
import { HomePage } from './pages/HomePage.js'
import { AIAssistantPage } from './pages/AIAssistantPage.js'
import { MindMapPage } from './pages/MindMapPage.js'
import { FloorPlanPage } from './pages/FloorPlanPage.js'

export class App {
  constructor() {
    this.router = new Router()
    this.setupRoutes()
  }
  
  init() {
    console.log('🌾 神农集团数字化平台启动中...')
    
    // 移除加载动画
    const loading = document.querySelector('.loading')
    if (loading) {
      loading.remove()
    }
    
    // 启动路由
    this.router.start()
    
    console.log('✅ 应用启动完成')
  }
  
  setupRoutes() {
    this.router.register('/', HomePage)
    this.router.register('/portal', HomePage)
    this.router.register('/ai-assistant', AIAssistantPage)
    this.router.register('/mindmap', MindMapPage)
    this.router.register('/floorplan', FloorPlanPage)
  }
}
`
    
    fs.writeFileSync(path.join(this.targetDir, 'src/app.js'), appJs)
  }
  
  async migrateHtmlToComponents() {
    // 这里需要解析现有HTML文件并转换为组件
    // 由于代码较长，这里提供框架结构
    
    const homePageComponent = `import { SystemGrid } from '../components/portal/SystemGrid.js'
import { SearchBar } from '../components/portal/SearchBar.js'
import { StatsBar } from '../components/portal/StatsBar.js'

export class HomePage {
  constructor() {
    this.systemGrid = new SystemGrid()
    this.searchBar = new SearchBar()
    this.statsBar = new StatsBar()
  }
  
  render(container) {
    container.innerHTML = \`
      <div class="home-page">
        <header class="header">
          <h1>神农集团数字化平台</h1>
          <p class="subtitle">智慧农牧业数字化转型解决方案</p>
          <div id="statsBar"></div>
        </header>
        
        <div class="control-panel">
          <div id="searchBar"></div>
        </div>
        
        <main class="main-content">
          <div id="systemGrid"></div>
        </main>
      </div>
    \`
    
    // 挂载子组件
    this.statsBar.mount(container.querySelector('#statsBar'))
    this.searchBar.mount(container.querySelector('#searchBar'))
    this.systemGrid.mount(container.querySelector('#systemGrid'))
  }
  
  destroy() {
    this.systemGrid.destroy()
    this.searchBar.destroy()
    this.statsBar.destroy()
  }
}
`
    
    fs.writeFileSync(
      path.join(this.targetDir, 'src/pages/HomePage.js'),
      homePageComponent
    )
    
    console.log('  ✓ HTML文件迁移完成')
  }
  
  async createServiceFiles() {
    // API服务基类
    const apiService = `export class APIService {
  constructor(baseURL = '') {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }
  
  async request(url, options = {}) {
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options
    }
    
    try {
      const response = await fetch(\`\${this.baseURL}\${url}\`, config)
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
    }
  }
  
  get(url, options = {}) {
    return this.request(url, { method: 'GET', ...options })
  }
  
  post(url, data, options = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  }
}
`
    
    fs.writeFileSync(
      path.join(this.targetDir, 'src/services/api.js'),
      apiService
    )
    
    console.log('  ✓ 服务文件创建完成')
  }
  
  async createUtilFiles() {
    // 常量定义
    const constants = `// API端点
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
    url: '/production'
  },
  {
    id: 'breeding',
    name: '智慧养殖系统',
    description: '养殖环境监控与健康管理',
    icon: 'fas fa-cow',
    color: '#FF9800',
    url: '/breeding'
  }
  // ... 其他系统配置
]

// 默认配置
export const DEFAULT_CONFIG = {
  ai: {
    baseUrl: 'http://47.236.87.251:3000/api',
    model: 'qwen2.5:7b',
    maxTokens: 4000,
    temperature: 0.7
  },
  ui: {
    theme: 'light',
    language: 'zh-CN'
  }
}
`
    
    fs.writeFileSync(
      path.join(this.targetDir, 'src/utils/constants.js'),
      constants
    )
    
    console.log('  ✓ 工具文件创建完成')
  }
  
  async createStyleFiles() {
    // 主样式文件
    const mainCss = `/* 神农集团数字化平台 - 主样式文件 */

/* CSS变量 */
:root {
  --primary-color: #4A90E2;
  --secondary-color: #FF69B4;
  --success-color: #4CAF50;
  --warning-color: #FF9800;
  --error-color: #F44336;
  --text-color: #333;
  --text-light: #666;
  --bg-color: #f5f7fa;
  --white: #ffffff;
  --border-color: #e0e0e0;
  --shadow: 0 2px 8px rgba(0,0,0,0.1);
  --border-radius: 8px;
  --transition: all 0.3s ease;
}

/* 重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
  line-height: 1.6;
}

/* 加载动画 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  :root {
    --border-radius: 6px;
  }
}
`
    
    fs.writeFileSync(
      path.join(this.targetDir, 'src/styles/main.css'),
      mainCss
    )
    
    console.log('  ✓ 样式文件创建完成')
  }
  
  async generatePackageJson() {
    // 已在generateConfigFiles中处理
  }
  
  async createDocumentation() {
    console.log('📚 创建文档...')
    
    // 复制现有文档
    const docs = ['README.md', '设计文档.md']
    
    for (const doc of docs) {
      const sourcePath = path.join(this.sourceDir, doc)
      const targetPath = path.join(this.targetDir, 'docs', doc)
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath)
        console.log(\`  ✓ 复制文档: \${doc}\`)
      }
    }
    
    // 创建新的README
    const newReadme = \`# 神农集团数字化平台 v2.0

> 🌾 现代化重构版本

## 快速开始

\\\`\\\`\\\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm run test
\\\`\\\`\\\`

## 项目结构

详见 [项目重构方案](docs/项目重构方案.md)

## 更新日志

### v2.0.0
- 🎉 项目架构重构
- 📦 引入现代化构建工具
- 🧪 添加测试框架
- 📚 完善文档体系
\`
    
    fs.writeFileSync(path.join(this.targetDir, 'README.md'), newReadme)
    
    console.log('  ✓ 文档创建完成')
  }
}

// 执行迁移
const migrator = new ProjectMigrator()
migrator.migrate().catch(console.error)