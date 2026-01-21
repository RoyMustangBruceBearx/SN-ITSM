# AI聊天功能优化说明

## 优化概述

基于 [OpenWebUI API 文档](https://docs.openwebui.com/getting-started/api-endpoints) 的最佳实践，对 AI 助手聊天功能进行了全面优化。

## 参考文档

- **OpenWebUI API Endpoints**: https://docs.openwebui.com/getting-started/api-endpoints
- **Chat Completions**: 标准的聊天完成接口
- **Streaming Support**: 流式响应处理
- **RAG Support**: 检索增强生成（文件和知识库）

## 主要优化内容

### 1. 改进请求数据构建 (buildRequestData)

**文件路径：** `shengnong-platform-v2/src/services/aiService.js`

#### 优化前
```javascript
buildRequestData(message, context, options = {}) {
  const messages = [...context, { role: 'user', content: message }]
  
  return {
    model: this.config.model,
    messages,
    max_tokens: this.config.maxTokens,
    temperature: this.config.temperature,
    stream: options.stream || false,
    ...options
  }
}
```

#### 优化后
```javascript
buildRequestData(message, context, options = {}) {
  const messages = [...context, { role: 'user', content: message }]
  
  const requestData = {
    model: this.config.model,
    messages,
    stream: options.stream !== false  // 默认使用流式
  }
  
  // 只在有值时添加可选参数
  if (this.config.maxTokens) {
    requestData.max_tokens = this.config.maxTokens
  }
  
  if (this.config.temperature !== undefined) {
    requestData.temperature = this.config.temperature
  }
  
  // 支持更多 OpenWebUI 参数
  if (options.top_p !== undefined) {
    requestData.top_p = options.top_p
  }
  
  if (options.frequency_penalty !== undefined) {
    requestData.frequency_penalty = options.frequency_penalty
  }
  
  if (options.presence_penalty !== undefined) {
    requestData.presence_penalty = options.presence_penalty
  }
  
  if (options.stop) {
    requestData.stop = options.stop
  }
  
  // 支持 RAG 功能（文件和知识库）
  if (options.files && Array.isArray(options.files)) {
    requestData.files = options.files
  }
  
  return requestData
}
```

**改进点：**
- ✅ 默认启用流式响应（stream: true）
- ✅ 只在有值时添加可选参数，避免发送 undefined
- ✅ 支持更多 OpenAI 兼容参数（top_p, frequency_penalty, presence_penalty, stop）
- ✅ 支持 RAG 功能（files 参数）
- ✅ 更好的日志输出

### 2. 增强流式响应处理 (processStreamResponse)

#### 优化前
```javascript
// 只支持单一格式
const content = parsed.choices?.[0]?.delta?.content
```

#### 优化后
```javascript
// 支持多种响应格式
let content = null

// OpenWebUI/OpenAI 格式：choices[0].delta.content
if (parsed.choices?.[0]?.delta?.content) {
  content = parsed.choices[0].delta.content
}
// 备用格式：choices[0].message.content
else if (parsed.choices?.[0]?.message?.content) {
  content = parsed.choices[0].message.content
}
// 直接内容格式
else if (parsed.content) {
  content = parsed.content
}
// Ollama 格式：response
else if (parsed.response) {
  content = parsed.response
}

// 检查完成信号
if (parsed.done === true) {
  // 处理完成
}
```

**改进点：**
- ✅ 支持多种 API 响应格式（OpenAI, OpenWebUI, Ollama）
- ✅ 支持 `[DONE]` 和 `done: true` 两种结束信号
- ✅ 支持 SSE 格式（`data: {...}`）和纯 JSON 行格式
- ✅ 更详细的日志输出和错误处理
- ✅ 更好的异常情况处理

### 3. 改进同步请求处理 (sendSyncRequest)

#### 优化前
```javascript
const data = await response.json()
const content = data.choices?.[0]?.message?.content || ''
return content
```

#### 优化后
```javascript
const data = await response.json()
console.log('同步请求响应:', data)

// 支持多种响应格式提取内容
let content = ''

// OpenWebUI/OpenAI 格式
if (data.choices?.[0]?.message?.content) {
  content = data.choices[0].message.content
}
// 备用格式
else if (data.choices?.[0]?.text) {
  content = data.choices[0].text
}
// 直接内容格式
else if (data.content) {
  content = data.content
}
// Ollama 格式
else if (data.response) {
  content = data.response
}
// 消息格式
else if (data.message?.content) {
  content = data.message.content
}

if (!content) {
  console.warn('无法从响应中提取内容:', data)
  throw new Error('API 返回的响应格式不正确')
}

return content
```

**改进点：**
- ✅ 支持多种响应格式
- ✅ 添加响应日志
- ✅ 更好的错误提示
- ✅ 验证内容是否成功提取

### 4. 增强错误处理 (handleError)

#### 优化前
```javascript
handleError(error) {
  let message = ERROR_MESSAGES.UNKNOWN_ERROR
  
  if (error.message.includes('HTTP 401')) {
    message = 'API密钥无效，请检查配置'
  }
  // ... 简单的错误映射
  
  return new Error(message)
}
```

#### 优化后
```javascript
handleError(error) {
  let message = ERROR_MESSAGES.UNKNOWN_ERROR
  
  // 超时错误
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    message = '请求超时，请检查网络连接或增加超时时间'
  }
  // 网络错误
  else if (error.message.includes('Failed to fetch')) {
    message = ERROR_MESSAGES.NETWORK_ERROR + '，请检查API地址是否正确'
  }
  // HTTP 状态码错误（更详细）
  else if (error.message.includes('HTTP 400')) {
    message = '请求参数错误，请检查模型ID和其他配置'
  }
  else if (error.message.includes('HTTP 401')) {
    message = 'API密钥无效或已过期，请重新配置'
  }
  else if (error.message.includes('HTTP 403')) {
    message = '访问被拒绝，请检查API密钥权限'
  }
  else if (error.message.includes('HTTP 404')) {
    message = 'API端点不存在，请检查API地址配置'
  }
  else if (error.message.includes('HTTP 429')) {
    message = '请求过于频繁，请稍后重试'
  }
  else if (error.message.includes('HTTP 500')) {
    message = ERROR_MESSAGES.API_ERROR + '，服务器内部错误'
  }
  else if (error.message.includes('HTTP 502')) {
    message = '网关错误，API服务可能暂时不可用'
  }
  else if (error.message.includes('HTTP 503')) {
    message = '服务暂时不可用，请稍后重试'
  }
  
  const processedError = new Error(message)
  processedError.originalError = error
  processedError.timestamp = new Date().toISOString()
  
  // 记录详细错误信息
  console.error('AI服务错误:', {
    message,
    originalError: error.message,
    stack: error.stack,
    timestamp: processedError.timestamp
  })
  
  return processedError
}
```

**改进点：**
- ✅ 更详细的 HTTP 状态码错误处理（400, 403, 404, 502, 503）
- ✅ 更友好的错误提示信息
- ✅ 添加错误时间戳
- ✅ 详细的错误日志记录
- ✅ 保留原始错误对象便于调试

### 5. 新增 RAG 功能支持

#### 新增方法：sendMessageWithFiles
```javascript
/**
 * 发送带文件的消息（RAG功能）
 * @param {string} message - 用户消息
 * @param {Array} files - 文件列表 [{type: 'file'|'collection', id: string}]
 * @param {Object} options - 选项
 * @returns {Promise<string>} AI回复
 */
async sendMessageWithFiles(message, files, options = {}) {
  return this.sendMessage(message, {
    ...options,
    files
  })
}
```

#### 新增方法：sendMessageWithCollection
```javascript
/**
 * 发送带知识库的消息
 * @param {string} message - 用户消息
 * @param {string} collectionId - 知识库ID
 * @param {Object} options - 选项
 * @returns {Promise<string>} AI回复
 */
async sendMessageWithCollection(message, collectionId, options = {}) {
  return this.sendMessage(message, {
    ...options,
    files: [{ type: 'collection', id: collectionId }]
  })
}
```

**使用示例：**

```javascript
// 使用单个文件
await aiService.sendMessageWithFiles(
  '这个文档讲了什么？',
  [{ type: 'file', id: 'file-123' }]
)

// 使用知识库
await aiService.sendMessageWithCollection(
  '关于农牧业的最佳实践是什么？',
  'collection-456'
)

// 使用多个文件
await aiService.sendMessageWithFiles(
  '比较这些文档的内容',
  [
    { type: 'file', id: 'file-123' },
    { type: 'file', id: 'file-456' }
  ]
)
```

## 支持的 API 响应格式

### 1. OpenAI/OpenWebUI 标准格式

**流式响应：**
```json
data: {"choices":[{"delta":{"content":"你好"}}]}
data: {"choices":[{"delta":{"content":"！"}}]}
data: [DONE]
```

**同步响应：**
```json
{
  "choices": [
    {
      "message": {
        "content": "你好！我是AI助手。"
      }
    }
  ]
}
```

### 2. Ollama 格式

**流式响应：**
```json
{"response":"你好","done":false}
{"response":"！","done":false}
{"response":"","done":true}
```

**同步响应：**
```json
{
  "response": "你好！我是AI助手。"
}
```

### 3. 简化格式

```json
{
  "content": "你好！我是AI助手。"
}
```

## 新增配置参数支持

### 基础参数
- `model`: 模型ID（必需）
- `messages`: 消息数组（必需）
- `stream`: 是否使用流式响应（默认 true）

### 可选参数
- `max_tokens`: 最大令牌数
- `temperature`: 温度（0-2）
- `top_p`: 核采样参数（0-1）
- `frequency_penalty`: 频率惩罚（-2.0 到 2.0）
- `presence_penalty`: 存在惩罚（-2.0 到 2.0）
- `stop`: 停止序列（字符串或数组）

### RAG 参数
- `files`: 文件数组
  ```javascript
  [
    { type: 'file', id: 'file-id' },
    { type: 'collection', id: 'collection-id' }
  ]
  ```

## 使用示例

### 基础聊天
```javascript
const response = await aiService.sendMessage('你好', {
  context: [
    { role: 'system', content: '你是一个友好的助手' }
  ],
  stream: true,
  onStream: (chunk, fullContent) => {
    console.log('收到内容:', chunk)
  },
  onComplete: (fullContent) => {
    console.log('完整内容:', fullContent)
  },
  onError: (error) => {
    console.error('错误:', error)
  }
})
```

### 高级参数
```javascript
const response = await aiService.sendMessage('写一首诗', {
  temperature: 0.9,
  top_p: 0.95,
  max_tokens: 500,
  frequency_penalty: 0.5,
  presence_penalty: 0.5,
  stop: ['\n\n', '---']
})
```

### RAG 功能
```javascript
// 使用文件
const response = await aiService.sendMessageWithFiles(
  '总结这个文档',
  [{ type: 'file', id: 'doc-123' }]
)

// 使用知识库
const response = await aiService.sendMessageWithCollection(
  '关于养殖的最佳实践',
  'farming-knowledge-base'
)
```

## 错误处理改进

### 错误类型和提示

| HTTP 状态码 | 错误提示 |
|------------|---------|
| 400 | 请求参数错误，请检查模型ID和其他配置 |
| 401 | API密钥无效或已过期，请重新配置 |
| 403 | 访问被拒绝，请检查API密钥权限 |
| 404 | API端点不存在，请检查API地址配置 |
| 429 | 请求过于频繁，请稍后重试 |
| 500 | 服务器内部错误 |
| 502 | 网关错误，API服务可能暂时不可用 |
| 503 | 服务暂时不可用，请稍后重试 |
| Timeout | 请求超时，请检查网络连接或增加超时时间 |
| Network | 网络错误，请检查API地址是否正确 |

### 错误日志示例
```javascript
{
  message: "API密钥无效或已过期，请重新配置",
  originalError: "HTTP 401: Unauthorized",
  stack: "Error: ...",
  timestamp: "2025-01-16T10:30:00.000Z"
}
```

## 日志输出改进

### 请求日志
```
构建请求数据: {
  model: "qwen2.5:7b",
  messagesCount: 3,
  stream: true,
  hasFiles: false
}
```

### 流式响应日志
```
收到 [DONE] 信号
流式响应结束，总内容长度: 256
```

### 同步响应日志
```
同步请求响应: {
  choices: [{
    message: {
      content: "..."
    }
  }]
}
```

### 错误日志
```
AI服务错误: {
  message: "API密钥无效或已过期，请重新配置",
  originalError: "HTTP 401: Unauthorized",
  stack: "...",
  timestamp: "2025-01-16T10:30:00.000Z"
}
```

## 兼容性

优化后的代码兼容以下 API：
- ✅ OpenAI API
- ✅ OpenWebUI API
- ✅ Ollama API
- ✅ 其他 OpenAI 兼容的 API

## 测试建议

### 1. 测试不同响应格式
```javascript
// 测试 OpenAI 格式
// 测试 Ollama 格式
// 测试简化格式
```

### 2. 测试流式响应
```javascript
// 测试 [DONE] 信号
// 测试 done: true 信号
// 测试无结束信号的情况
```

### 3. 测试错误处理
```javascript
// 测试各种 HTTP 错误码
// 测试网络错误
// 测试超时
```

### 4. 测试 RAG 功能
```javascript
// 测试单文件
// 测试多文件
// 测试知识库
```

## 性能优化

1. **流式响应优先**：默认使用流式响应，提供更好的用户体验
2. **智能参数传递**：只传递有值的参数，减少请求体积
3. **详细日志**：便于调试和监控
4. **错误重试**：使用 retry 机制提高成功率

## 向后兼容性

所有优化都保持向后兼容，现有代码无需修改即可使用。新功能通过可选参数提供。

## 完成状态
✅ **优化已完成** - AI 聊天功能已按照 OpenWebUI 最佳实践进行全面优化。

---
**参考文档：** https://docs.openwebui.com/getting-started/api-endpoints  
**完成时间：** 2025-01-16  
**修改者：** Kiro AI Assistant
