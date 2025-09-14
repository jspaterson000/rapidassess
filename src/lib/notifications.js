import { toast } from 'sonner'

class NotificationManager {
  constructor() {
    this.subscribers = new Map()
  }

  // Toast notifications
  success(message, options = {}) {
    toast.success(message, {
      duration: 4000,
      ...options
    })
  }

  error(message, options = {}) {
    toast.error(message, {
      duration: 6000,
      ...options
    })
  }

  info(message, options = {}) {
    toast.info(message, {
      duration: 4000,
      ...options
    })
  }

  warning(message, options = {}) {
    toast.warning(message, {
      duration: 5000,
      ...options
    })
  }

  // Push notifications (browser)
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  async sendBrowserNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/logo.svg',
        badge: '/logo.svg',
        ...options
      })
    }
  }

  // Real-time notifications
  subscribe(userId, callback) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set())
    }
    this.subscribers.get(userId).add(callback)
    
    return () => {
      const userSubscribers = this.subscribers.get(userId)
      if (userSubscribers) {
        userSubscribers.delete(callback)
        if (userSubscribers.size === 0) {
          this.subscribers.delete(userId)
        }
      }
    }
  }

  notify(userId, notification) {
    const userSubscribers = this.subscribers.get(userId)
    if (userSubscribers) {
      userSubscribers.forEach(callback => callback(notification))
    }
  }

  // Notification templates
  jobAssigned(jobNumber, assessorName) {
    return {
      title: 'New Job Assignment',
      message: `Job ${jobNumber} has been assigned to ${assessorName}`,
      type: 'job_assignment'
    }
  }

  assessmentCompleted(jobNumber) {
    return {
      title: 'Assessment Completed',
      message: `Assessment for job ${jobNumber} has been completed`,
      type: 'assessment_complete'
    }
  }

  appointmentReminder(jobNumber, time) {
    return {
      title: 'Appointment Reminder',
      message: `Appointment for job ${jobNumber} at ${time}`,
      type: 'appointment_reminder'
    }
  }
}

export const notifications = new NotificationManager()