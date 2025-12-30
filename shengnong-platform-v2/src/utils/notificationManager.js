/**
 * 通知管理器
 * 负责显示各种类型的通知消息
 */

export class NotificationManager {
  constructor() {
    this.notifications = []
    this.maxNotifications = 3
    this.container = null
    this.init()
  }
  
  init() {
    // 创建通知容器
    this.container = document.createElement('div')
    this.container.className = 'notification-container'
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `
    document.body.appendChild(this.container)
  }
  
  show(message, type = 'info', duration = 3000) {
    const notification = this.createNotification(message, type)
    this.container.appendChild(notification)
    
    this.notifications.push(notification)
    this.limitNotifications()
    
    // 显示动画
    setTimeout(() => {
      notification.style.opacity = '1'
      notification.style.transform = 'translateX(0)'
    }, 10)
    
    // 自动隐藏
    setTimeout(() => {
      this.hide(notification)
    }, duration)
    
    return notification
  }
  
  hide(notification) {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOutNotification 0.3s ease'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
        this.removeFromArray(notification)
      }, 300)
    }
  }
  
  createNotification(message, type) {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.style.cssText = `
      padding: 12px 20px;
      margin-bottom: 10px;
      border-radius: 6px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 300px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      pointer-events: auto;
      cursor: pointer;
    `
    
    const icon = this.getIcon(type)
    const bgColor = this.getBackgroundColor(type)
    
    notification.style.background = bgColor
    notification.style.color = 'white'
    
    notification.innerHTML = `
      <i class="fas ${icon}"></i>
      <span>${message}</span>
    `
    
    // 点击关闭
    notification.addEventListener('click', () => {
      this.hide(notification)
    })
    
    return notification
  }
  
  getIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    }
    return icons[type] || icons.info
  }
  
  getBackgroundColor(type) {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    }
    return colors[type] || colors.info
  }
  
  limitNotifications() {
    while (this.notifications.length > this.maxNotifications) {
      const oldest = this.notifications.shift()
      this.hide(oldest)
    }
  }
  
  removeFromArray(notification) {
    this.notifications = this.notifications.filter(n => n !== notification)
  }
  
  clear() {
    this.notifications.forEach(notification => {
      this.hide(notification)
    })
    this.notifications = []
  }
  
  destroy() {
    this.clear()
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}

// 创建全局通知管理器实例
export const notificationManager = new NotificationManager()