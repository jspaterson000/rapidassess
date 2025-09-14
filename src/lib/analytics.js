import { Job, Assessment, User } from '@/api/entities'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format, eachDayOfInterval } from 'date-fns'

class AnalyticsManager {
  async getJobMetrics(companyId = null, dateRange = 30) {
    const endDate = new Date()
    const startDate = subDays(endDate, dateRange)
    
    let jobs = await Job.list()
    if (companyId) {
      jobs = jobs.filter(job => job.company_id === companyId)
    }
    
    const filteredJobs = jobs.filter(job => {
      const jobDate = new Date(job.created_date)
      return jobDate >= startDate && jobDate <= endDate
    })

    return {
      total: filteredJobs.length,
      completed: filteredJobs.filter(job => job.status === 'completed').length,
      inProgress: filteredJobs.filter(job => !['completed', 'archived'].includes(job.status)).length,
      averageCompletionTime: this.calculateAverageCompletionTime(filteredJobs),
      completionRate: this.calculateCompletionRate(filteredJobs)
    }
  }

  async getAssessmentMetrics(assessorId = null, dateRange = 30) {
    const endDate = new Date()
    const startDate = subDays(endDate, dateRange)
    
    let assessments = await Assessment.list()
    if (assessorId) {
      assessments = assessments.filter(assessment => assessment.assessor_id === assessorId)
    }
    
    const filteredAssessments = assessments.filter(assessment => {
      const assessmentDate = new Date(assessment.assessment_date)
      return assessmentDate >= startDate && assessmentDate <= endDate
    })

    return {
      total: filteredAssessments.length,
      completed: filteredAssessments.filter(a => a.status === 'completed').length,
      pending: filteredAssessments.filter(a => a.status === 'pending_review').length,
      averageTimeToComplete: this.calculateAverageAssessmentTime(filteredAssessments)
    }
  }

  async getJobTrends(companyId = null, days = 30) {
    const endDate = new Date()
    const startDate = subDays(endDate, days)
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
    
    let jobs = await Job.list()
    if (companyId) {
      jobs = jobs.filter(job => job.company_id === companyId)
    }

    return dateRange.map(date => {
      const dayJobs = jobs.filter(job => {
        const jobDate = new Date(job.created_date)
        return format(jobDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      })

      return {
        date: format(date, 'MMM dd'),
        jobs: dayJobs.length,
        completed: dayJobs.filter(job => job.status === 'completed').length
      }
    })
  }

  async getStatusDistribution(companyId = null) {
    let jobs = await Job.list()
    if (companyId) {
      jobs = jobs.filter(job => job.company_id === companyId)
    }

    const statusCounts = jobs.reduce((acc, job) => {
      const status = job.status || 'unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: ((count / jobs.length) * 100).toFixed(1)
    }))
  }

  async getEventTypeDistribution(companyId = null) {
    let jobs = await Job.list()
    if (companyId) {
      jobs = jobs.filter(job => job.company_id === companyId)
    }

    const eventCounts = jobs.reduce((acc, job) => {
      const eventType = job.event_type || 'unknown'
      acc[eventType] = (acc[eventType] || 0) + 1
      return acc
    }, {})

    return Object.entries(eventCounts).map(([eventType, count]) => ({
      name: eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      percentage: ((count / jobs.length) * 100).toFixed(1)
    }))
  }

  async getAssessorPerformance(companyId = null) {
    const users = await User.list()
    const assessments = await Assessment.list()
    
    let assessors = users.filter(user => user.is_assessor)
    if (companyId) {
      assessors = assessors.filter(user => user.company_id === companyId)
    }

    return assessors.map(assessor => {
      const assessorAssessments = assessments.filter(a => a.assessor_id === assessor.id)
      const completed = assessorAssessments.filter(a => a.status === 'completed')
      
      return {
        id: assessor.id,
        name: assessor.full_name,
        totalAssessments: assessorAssessments.length,
        completedAssessments: completed.length,
        completionRate: assessorAssessments.length > 0 
          ? ((completed.length / assessorAssessments.length) * 100).toFixed(1)
          : '0',
        averageRating: this.calculateAverageRating(completed)
      }
    })
  }

  calculateAverageCompletionTime(jobs) {
    const completedJobs = jobs.filter(job => job.status === 'completed' && job.completed_date)
    if (completedJobs.length === 0) return 0

    const totalTime = completedJobs.reduce((sum, job) => {
      const start = new Date(job.created_date)
      const end = new Date(job.completed_date)
      return sum + (end - start)
    }, 0)

    const averageMs = totalTime / completedJobs.length
    return Math.round(averageMs / (1000 * 60 * 60 * 24)) // Convert to days
  }

  calculateCompletionRate(jobs) {
    if (jobs.length === 0) return 0
    const completed = jobs.filter(job => job.status === 'completed').length
    return ((completed / jobs.length) * 100).toFixed(1)
  }

  calculateAverageAssessmentTime(assessments) {
    const completed = assessments.filter(a => a.status === 'completed' && a.completed_date)
    if (completed.length === 0) return 0

    const totalTime = completed.reduce((sum, assessment) => {
      const start = new Date(assessment.created_date)
      const end = new Date(assessment.completed_date)
      return sum + (end - start)
    }, 0)

    const averageMs = totalTime / completed.length
    return Math.round(averageMs / (1000 * 60 * 60)) // Convert to hours
  }

  calculateAverageRating(assessments) {
    // Mock rating calculation - in real app this would be based on quality scores
    return (4.2 + Math.random() * 0.6).toFixed(1)
  }
}

export const analytics = new AnalyticsManager()