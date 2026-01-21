/**
 * 事件总线 - 用于组件间通信
 */

class EventBus {
  constructor() {
    this.events = new Map()
  }
  
  /**
   * 监听事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event).push(callback)
  }
  
  /**
   * 移除事件监听
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (!this.events.has(event)) return
    
    const callbacks = this.events.get(event)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
    
    if (callbacks.length === 0) {
      this.events.delete(event)
    }
  }
  
  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    if (!this.events.has(event)) return
    
    const callbacks = this.events.get(event)
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`事件回调执行失败 [${event}]:`, error)
      }
    })
  }
  
  /**
   * 一次性事件监听
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  once(event, callback) {
    const onceCallback = (data) => {
      callback(data)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }
  
  /**
   * 清除所有事件监听
   */
  clear() {
    this.events.clear()
  }
  
  /**
   * 获取事件列表
   */
  getEvents() {
    return Array.from(this.events.keys())
  }
}

// 导出单例实例
export const eventBus = new EventBus()