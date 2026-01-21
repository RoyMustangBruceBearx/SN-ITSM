# API配置两步流程修复说明

## 需求描述

修改齿轮形状的配置界面，实现两步流程：

### 第一步：API连接配置
- 只保留 **API地址** 和 **API Key** 的输入
- 用户输入完成后点击"验证并继续"按钮
- 前端调用 `API地址 + /models` 接口获取模型列表
- 调用时将 API Key 放到 headers 中：`Authorization: Bearer {apikey}`

### 第二步：模型选择
- 若返回失败，提示用户连接失败
- 若返回成功，提示成功并进入下一步
- 通过 models 接口返回的数据提取 `id` 和 `name`
- 将模型选择下拉菜单展示出来（显示 name，值为 id）
- 用户选择模型后保存配置

## 修改内容

### 1. AIService.js - 添加验证和获取模型方法

**文件路径：** `shengnong-platform-v2/src/services/aiService.js`

#### 1.1 添加 apiKey 配置
```javascript
constructor(config = {}) {
  this.config = {
    baseUrl: 'http://47.236.87.251:3000/api',
    apiKey: '',  // 新增
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
```

#### 1.2 添加 getHeaders 方法
```javascript
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
```

#### 1.3 添加 validateAndGetModels 方法
```javascript
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
    
    // 提取id和name
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
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = '网络错误，无法连接到API服务器'
    } else if (error.message.includes('HTTP 401')) {
      errorMessage = 'API密钥无效，请检查密钥是否正确'
    } else if (error.message.includes('HTTP 403')) {
      errorMessage = '访问被拒绝，请检查API密钥权限'
    } else if (error.message.includes('HTTP 404')) {
      errorMessage = 'API地址不正确，未找到模型接口'
    }
    
    return {
      success: false,
      models: [],
      error: errorMessage
    }
  }
}
```

#### 1.4 更新所有请求方法使用 getHeaders()
```javascript
// 在 sendStreamRequest 中
const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
  method: 'POST',
  headers: this.getHeaders(),  // 使用 getHeaders()
  body: JSON.stringify(requestData),
  signal: AbortSignal.timeout(this.config.timeout)
})

// 在 sendSyncRequest 中
const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
  method: 'POST',
  headers: this.getHeaders(),  // 使用 getHeaders()
  body: JSON.stringify({ ...requestData, stream: false }),
  signal: AbortSignal.timeout(this.config.timeout)
})

// 在 getModels 中
const response = await fetch(`${this.config.baseUrl}/models`, {
  method: 'GET',
  headers: this.getHeaders()  // 使用 getHeaders()
})
```

### 2. HomePage.js - 更新配置界面

**文件路径：** `shengnong-platform-v2/src/pages/HomePage.js`

#### 2.1 添加 tempApiConfig 属性
```javascript
constructor() {
  // ... 其他属性
  this.tempApiConfig = null // 临时存储API配置（验证成功后）
}
```

#### 2.2 更新配置面板 HTML（两步流程）
```javascript
const chatHTML = `
  <!-- API设置面板 - 两步流程 -->
  <div class="api-settings-panel" id="apiSettingsPanel" style="...">
    <h4>AI 配置</h4>
    
    <!-- 步骤1: API连接配置 -->
    <div id="step1Container">
      <div style="background: rgba(59, 130, 246, 0.1); ...">
        <strong>步骤 1/2:</strong> 配置API连接
      </div>
      
      <label>API地址 *</label>
      <input type="text" id="apiUrlInput" placeholder="http://47.236.87.251:3000/api">

      <label>API Key *</label>
      <input type="password" id="apiKeyInput" placeholder="输入您的API密钥">

      <div id="step1Message" style="display: none;"></div>

      <button id="validateApiBtn">
        <i class="fas fa-check-circle"></i> 验证并继续
      </button>
    </div>

    <!-- 步骤2: 模型选择 (初始隐藏) -->
    <div id="step2Container" style="display: none;">
      <div style="background: rgba(16, 185, 129, 0.1); ...">
        <strong>步骤 2/2:</strong> 选择AI模型
      </div>

      <div style="background: rgba(16, 185, 129, 0.1); ...">
        <i class="fas fa-check-circle"></i> API连接成功！
      </div>

      <label>选择模型 *</label>
      <select id="modelSelect">
        <option value="">加载中...</option>
      </select>

      <label>最大令牌数</label>
      <input type="number" id="maxTokensInput" value="4000">

      <label>创造性 (0-1)</label>
      <input type="number" id="temperatureInput" value="0.7">

      <div style="display: flex; gap: 8px;">
        <button id="backToStep1Btn">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
        <button id="saveSettingsBtn">
          <i class="fas fa-save"></i> 保存配置
        </button>
      </div>
    </div>
  </div>
  ...
`
```

#### 2.3 添加新的方法

**showStep1(aiSidebar)** - 显示步骤1
```javascript
showStep1(aiSidebar) {
  const step1Container = aiSidebar.querySelector('#step1Container')
  const step2Container = aiSidebar.querySelector('#step2Container')
  const step1Message = aiSidebar.querySelector('#step1Message')
  
  if (step1Container) step1Container.style.display = 'block'
  if (step2Container) step2Container.style.display = 'none'
  if (step1Message) step1Message.style.display = 'none'
}
```

**showStep2(aiSidebar, models)** - 显示步骤2
```javascript
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
```

**validateAPIConnection(aiSidebar)** - 验证API连接
```javascript
async validateAPIConnection(aiSidebar) {
  const apiUrlInput = aiSidebar.querySelector('#apiUrlInput')
  const apiKeyInput = aiSidebar.querySelector('#apiKeyInput')
  const validateBtn = aiSidebar.querySelector('#validateApiBtn')
  
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
    // 调用AIService的验证方法
    const result = await this.aiService.validateAndGetModels(apiUrl, apiKey)
    
    if (result.success && result.models.length > 0) {
      // 验证成功，显示步骤2
      this.showStep1Message(aiSidebar, '连接成功！正在加载模型...', 'success')
      
      setTimeout(() => {
        this.showStep2(aiSidebar, result.models)
        // 临时保存API配置
        this.tempApiConfig = { baseUrl: apiUrl, apiKey }
      }, 500)
      
    } else {
      // 验证失败
      this.showStep1Message(aiSidebar, result.error || '连接失败', 'error')
    }
    
  } catch (error) {
    this.showStep1Message(aiSidebar, error.message || '连接失败', 'error')
    
  } finally {
    // 恢复按钮状态
    if (validateBtn) {
      validateBtn.disabled = false
      validateBtn.innerHTML = '<i class="fas fa-check-circle"></i> 验证并继续'
    }
  }
}
```

**showStep1Message(aiSidebar, message, type)** - 显示步骤1的消息
```javascript
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
  }
}
```

**backToStep1(aiSidebar)** - 返回步骤1
```javascript
backToStep1(aiSidebar) {
  this.showStep1(aiSidebar)
}
```

#### 2.4 更新 saveAPISettings 方法
```javascript
async saveAPISettings(aiSidebar) {
  try {
    const modelSelect = aiSidebar.querySelector('#modelSelect')
    const maxTokensInput = aiSidebar.querySelector('#maxTokensInput')
    const temperatureInput = aiSidebar.querySelector('#temperatureInput')
    
    const model = modelSelect?.value
    const maxTokens = parseInt(maxTokensInput?.value)
    const temperature = parseFloat(temperatureInput?.value)
    
    if (!this.tempApiConfig || !this.tempApiConfig.baseUrl || !this.tempApiConfig.apiKey) {
      throw new Error('API配置不完整，请重新验证')
    }
    
    if (!model) {
      throw new Error('请选择模型')
    }
    
    const aiConfig = {
      baseUrl: this.tempApiConfig.baseUrl,
      apiKey: this.tempApiConfig.apiKey,
      model,
      maxTokens,
      temperature
    }
    
    await this.configService.setConfig('ai', aiConfig)
    
    // 更新AI服务配置
    if (this.aiService) {
      this.aiService.updateConfig(aiConfig)
    }
    
    // 清除临时配置
    this.tempApiConfig = null
    
    this.closeAPISettings(aiSidebar)
    this.showNotification('API设置已保存！', 'success')
    
  } catch (error) {
    this.showNotification(error.message, 'error')
  }
}
```

#### 2.5 更新 bindHeaderEvents 方法
```javascript
bindHeaderEvents(aiSidebar) {
  // ... 其他事件绑定
  
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
}
```

## 工作流程

### 完整流程图
```
用户点击齿轮图标
    ↓
显示步骤1：输入API地址和API Key
    ↓
用户点击"验证并继续"
    ↓
调用 validateAndGetModels(baseUrl, apiKey)
    ↓
发送 GET 请求到 {baseUrl}/models
    ↓
请求头包含: Authorization: Bearer {apiKey}
    ↓
┌─────────────┬─────────────┐
│  验证失败   │  验证成功   │
└─────────────┴─────────────┘
      ↓              ↓
显示错误消息    显示步骤2
      ↓              ↓
用户可重试      显示模型列表
                     ↓
              用户选择模型和参数
                     ↓
              点击"保存配置"
                     ↓
              保存到 localStorage
                     ↓
              更新 AIService 配置
                     ↓
                  完成
```

### 数据流示例

#### 步骤1：验证API
**请求：**
```http
GET http://47.236.87.251:3000/api/models
Authorization: Bearer sk-xxxxxxxxxxxxx
Content-Type: application/json
```

**成功响应：**
```json
{
  "data": [
    {
      "id": "qwen2.5:7b",
      "name": "Qwen2.5 7B"
    },
    {
      "id": "gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo"
    }
  ]
}
```

**失败响应：**
```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

#### 步骤2：保存配置
**保存的配置：**
```javascript
{
  baseUrl: "http://47.236.87.251:3000/api",
  apiKey: "sk-xxxxxxxxxxxxx",
  model: "qwen2.5:7b",  // 模型ID
  maxTokens: 4000,
  temperature: 0.7
}
```

## 测试方法

### 1. 测试步骤1 - API验证

**测试用例1：空输入**
- 不输入任何内容，点击"验证并继续"
- 预期：显示"请输入API地址"错误

**测试用例2：只输入API地址**
- 只输入API地址，不输入API Key
- 预期：显示"请输入API Key"错误

**测试用例3：错误的API地址**
- 输入错误的API地址
- 预期：显示"连接超时"或"网络错误"

**测试用例4：错误的API Key**
- 输入正确的API地址，错误的API Key
- 预期：显示"API密钥无效"

**测试用例5：正确的配置**
- 输入正确的API地址和API Key
- 预期：显示"连接成功"，进入步骤2

### 2. 测试步骤2 - 模型选择

**测试用例1：查看模型列表**
- 验证成功后，查看模型下拉框
- 预期：显示从API获取的模型列表（name）

**测试用例2：返回步骤1**
- 点击"返回"按钮
- 预期：返回步骤1，可以重新输入

**测试用例3：不选择模型**
- 不选择模型，直接点击"保存配置"
- 预期：显示"请选择模型"错误

**测试用例4：保存配置**
- 选择模型，点击"保存配置"
- 预期：显示"API设置已保存"，配置面板关闭

### 3. 测试配置持久化

**测试用例1：重新打开配置**
- 保存配置后，关闭并重新打开配置面板
- 预期：API地址和API Key已填充

**测试用例2：刷新页面**
- 保存配置后，刷新页面
- 预期：配置仍然存在，可以正常使用

## 控制台日志示例

```
验证API连接: http://47.236.87.251:3000/api
API返回的模型数据: {data: [{id: "qwen2.5:7b", name: "Qwen2.5 7B"}, ...]}
解析后的模型列表: [{id: "qwen2.5:7b", name: "Qwen2.5 7B"}, ...]
保存API设置: {baseUrl: "...", apiKey: "***", model: "qwen2.5:7b", ...}
AI服务配置已更新，当前模型ID: qwen2.5:7b
```

## 注意事项

1. **API Key 安全**：API Key 以密码形式输入，不在日志中明文显示
2. **临时存储**：验证成功后，API配置临时存储在 `tempApiConfig`，只有保存后才写入 localStorage
3. **错误处理**：所有错误都有友好的提示信息
4. **返回功能**：用户可以随时返回步骤1重新配置
5. **验证状态**：验证按钮在验证过程中显示加载状态，防止重复点击

## 完成状态
✅ **功能已实现** - API配置界面已改为两步流程，先验证连接再选择模型。

---
**完成时间：** 2025-01-16
**修改者：** Kiro AI Assistant
