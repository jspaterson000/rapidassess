// Data encryption utilities for sensitive information
class EncryptionManager {
  constructor() {
    this.algorithm = 'AES-GCM'
    this.keyLength = 256
  }

  async generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  async encryptData(data, key) {
    const encoder = new TextEncoder()
    const encodedData = encoder.encode(JSON.stringify(data))
    
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      encodedData
    )

    return {
      encryptedData: Array.from(new Uint8Array(encryptedData)),
      iv: Array.from(iv)
    }
  }

  async decryptData(encryptedData, iv, key) {
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: new Uint8Array(iv),
      },
      key,
      new Uint8Array(encryptedData)
    )

    const decoder = new TextDecoder()
    const jsonString = decoder.decode(decryptedData)
    return JSON.parse(jsonString)
  }

  // Hash sensitive data for storage
  async hashData(data) {
    const encoder = new TextEncoder()
    const encodedData = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Mask sensitive data for display
  maskEmail(email) {
    if (!email) return ''
    const [username, domain] = email.split('@')
    if (username.length <= 2) return email
    return `${username.slice(0, 2)}${'*'.repeat(username.length - 2)}@${domain}`
  }

  maskPhone(phone) {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 4) return phone
    return `${'*'.repeat(cleaned.length - 4)}${cleaned.slice(-4)}`
  }

  maskAddress(address) {
    if (!address) return ''
    const parts = address.split(',')
    if (parts.length < 2) return address
    return `${parts[0]}, ${'*'.repeat(parts.slice(1).join(',').length - 10)}${parts[parts.length - 1]}`
  }
}

export const encryption = new EncryptionManager()

// GDPR compliance utilities
export const gdprUtils = {
  // Data retention periods (in days)
  RETENTION_PERIODS: {
    COMPLETED_JOBS: 2555, // 7 years
    USER_DATA: 1095, // 3 years after last activity
    AUDIT_LOGS: 2555, // 7 years
    ASSESSMENT_DATA: 2555 // 7 years
  },

  // Check if data should be purged
  shouldPurgeData(createdDate, dataType) {
    const retentionPeriod = this.RETENTION_PERIODS[dataType] || 1095
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod)
    return new Date(createdDate) < cutoffDate
  },

  // Generate data export for user
  async generateUserDataExport(userId) {
    // In a real app, this would collect all user data
    return {
      user_profile: {},
      jobs: [],
      assessments: [],
      comments: [],
      audit_logs: [],
      export_date: new Date().toISOString()
    }
  },

  // Anonymize user data
  anonymizeUserData(userData) {
    return {
      ...userData,
      full_name: 'ANONYMIZED',
      email: 'anonymized@example.com',
      phone: 'ANONYMIZED',
      address: 'ANONYMIZED'
    }
  }
}