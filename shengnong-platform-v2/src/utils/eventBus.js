/**
 * 事件总线
 * 用于组件间通信和全局事件管理
 */

export class EventBus {
  constructor() {
    this.events = new Map()
    this.onceEvents = new Set()
    this.maxListeners = 10
  }
  
  /**
   * 监听事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} options - 选项
   */
  on(event, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('回调函数必须是function类型')
    }
    
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    
    const listeners = this.events.get(event)
    
    // 检查监听器数量限制
    if (listeners.length >= this.maxListeners) {
      console.warn(`事件 "${event}" 的监听器数量已达到最大限制 ${this.maxListeners}`)
    }
    
    const listener = {
      callback,
      context: options.context || null,
      priority: options.priority || 0,
      once: options.once || false
    }
    
    listeners.push(listener)
    
    // 按优先级排序
    listeners.sort((a, b) => b.priority - a.priority)
    
    return this
  }
  
  /**
   * 监听事件一次
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} options - 选项
   */
  once(event, callback, options = {}) {
    return this.on(event, callback, { ...options, once: true })
  }
  
  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (!this.events.has(event)) {
      return this
    }
    
    const listeners = this.events.get(event)
    const index = listeners.findIndex(listener => listener.callback === callback)
    
    if (index !== -1) {
      listeners.splice(index, 1)
    }
    
    // 如果没有监听器了，删除事件
    if (listeners.length === 0) {
      this.events.delete(event)
    }
    
    return this
  }
  
  /**
   * 移除所有事件监听器
   * @param {string} event - 事件名称（可选）
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
    
    return this
  }
  
  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {...any} args - 事件参数
   */
  emit(event, ...args) {
    if (!this.events.has(event)) {
      return false
    }
    
    const listeners = this.events.get(event).slice() // 复制数组避免修改原数组
    let hasListener = false
    
    for (const listener of listeners) {
      try {
        hasListener = true
        
        // 调用回调函数
        if (listener.context) {
          listener.callback.call(listener.context, ...args)
        } else {
          listener.callback(...args)
        }
        
        // 如果是一次性监听器，移除它
        if (listener.once) {
          this.off(event, listener.callback)
        }
        
      } catch (error) {
        console.error(`事件 "${event}" 的监听器执行出错:`, error)
      }
    }
    
    return hasListener
  }
  
  /**
   * 异步触发事件
   * @param {string} event - 事件名称
   * @param {...any} args - 事件参数
   */
  async emitAsync(event, ...args) {
    if (!this.events.has(event)) {
      return false
    }
    
    const listeners = this.events.get(event).slice()
    let hasListener = false
    
    for (const listener of listeners) {
      try {
        hasListener = true
        
        // 异步调用回调函数
        if (listener.context) {
          await listener.callback.call(listener.context, ...args)
        } else {
          await listener.callback(...args)
        }
        
        // 如果是一次性监听器，移除它
        if (listener.once) {
          this.off(event, listener.callback)
        }
        
      } catch (error) {
        console.error(`事件 "${event}" 的异步监听器执行出错:`, error)
      }
    }
    
    return hasListener
  }
  
  /**
   * 获取事件的监听器数量
   * @param {string} event - 事件名称
   * @returns {number} 监听器数量
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0
  }
  
  /**
   * 获取所有事件名称
   * @returns {string[]} 事件名称数组
   */
  eventNames() {
    return Array.from(this.events.keys())
  }
  
  /**
   * 设置最大监听器数量
   * @param {number} max - 最大数量
   */
  setMaxListeners(max) {
    this.maxListeners = max
    return this
  }
  
  /**
   * 获取最大监听器数量
   * @returns {number} 最大数量
   */
  getMaxListeners() {
    return this.maxListeners
  }
  
  /**
   * 创建命名空间事件总线
   * @param {string} namespace - 命名空间
   * @returns {Object} 命名空间事件总线
   */
  namespace(namespace) {
    const namespacedBus = {
      on: (event, callback, options) => {
        return this.on(`${namespace}:${event}`, callback, options)
      },
      once: (event, callback, options) => {
        return this.once(`${namespace}:${event}`, callback, options)
      },
      off: (event, callback) => {
        return this.off(`${namespace}:${event}`, callback)
      },
      emit: (event, ...args) => {
        return this.emit(`${namespace}:${event}`, ...args)
      },
      emitAsync: (event, ...args) => {
        return this.emitAsync(`${namespace}:${event}`, ...args)
      }
    }
    
    return namespacedBus
  }
}

// 创建全局事件总线实例
export const eventBus = new EventBus()

// 导出便捷方法
export const on = (event, callback, options) => eventBus.on(event, callback, options)
export const once = (event, callback, options) => eventBus.once(event, callback, options)
export const off = (event, callback) => eventBus.off(event, callback)
export const emit = (event, ...args) => eventBus.emit(event, ...args)
export const emitAsync = (event, ...args) => eventBus.emitAsync(event, ...args)

// 默认导出
export default eventBus