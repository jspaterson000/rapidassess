import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Filter,
  Mail
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { analytics } from '@/lib/analytics'

const REPORT_TYPES = {
  PERFORMANCE_SUMMARY: 'performance_summary',
  FINANCIAL_ANALYSIS: 'financial_analysis', 
  ASSESSOR_PRODUCTIVITY: 'assessor_productivity',
  CLAIM_TRENDS: 'claim_trends',
  QUALITY_METRICS: 'quality_metrics'
}

const REPORT_TEMPLATES = {
  [REPORT_TYPES.PERFORMANCE_SUMMARY]: {
    name: 'Performance Summary',
    description: 'Overall company performance metrics and KPIs',
    icon: TrendingUp,
    sections: ['job_metrics', 'completion_rates', 'response_times']
  },
  [REPORT_TYPES.FINANCIAL_ANALYSIS]: {
    name: 'Financial Analysis',
    description: 'Cost analysis and financial performance',
    icon: DollarSign,
    sections: ['cost_estimates', 'claim_values', 'efficiency_metrics']
  },
  [REPORT_TYPES.ASSESSOR_PRODUCTIVITY]: {
    name: 'Assessor Productivity',
    description: 'Individual assessor performance and workload',
    icon: Users,
    sections: ['individual_metrics', 'workload_distribution', 'quality_scores']
  },
  [REPORT_TYPES.CLAIM_TRENDS]: {
    name: 'Claim Trends',
    description: 'Analysis of claim patterns and trends',
    icon: TrendingUp,
    sections: ['event_type_analysis', 'seasonal_trends', 'geographic_distribution']
  }
}

export default function AdvancedReports() {
  const [selectedReportType, setSelectedReportType] = useState('')
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [reportData, setReportData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [filters, setFilters] = useState({
    company_id: '',
    assessor_id: '',
    event_type: ''
  })

  const generateReport = async () => {
    if (!selectedReportType) return
    
    setIsGenerating(true)
    try {
      let data
      switch (selectedReportType) {
        case REPORT_TYPES.PERFORMANCE_SUMMARY:
          data = await analytics.getJobMetrics(filters.company_id, 30)
          break
        case REPORT_TYPES.ASSESSOR_PRODUCTIVITY:
          data = await analytics.getAssessorPerformance(filters.company_id)
          break
        case REPORT_TYPES.CLAIM_TRENDS:
          data = await analytics.getJobTrends(filters.company_id, 30)
          break
        default:
          data = { message: 'Report type not implemented yet' }
      }
      setReportData(data)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportReport = (format) => {
    if (!reportData) return
    
    const reportContent = {
      type: selectedReportType,
      dateRange,
      filters,
      data: reportData,
      generatedAt: new Date().toISOString()
    }
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${selectedReportType}-${format(new Date(), 'yyyy-MM-dd')}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const scheduleReport = () => {
    // In a real app, this would schedule automated report generation
    alert('Report scheduled for weekly delivery')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Advanced Reports</h2>
          <p className="text-slate-500">Generate comprehensive analytics and performance reports</p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_TEMPLATES).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <template.icon className="w-4 h-4" />
                        {template.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                      ) : (
                        format(dateRange.from, 'MMM d, yyyy')
                      )
                    ) : (
                      'Select date range'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filters</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Event Type</label>
                      <Select value={filters.event_type} onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, event_type: value }))
                      }>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          <SelectItem value="storm">Storm</SelectItem>
                          <SelectItem value="fire">Fire</SelectItem>
                          <SelectItem value="escape_of_liquid">Water Damage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateReport}
                disabled={!selectedReportType || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>

          {selectedReportType && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-800 mb-2">
                {REPORT_TEMPLATES[selectedReportType]?.name}
              </h4>
              <p className="text-sm text-slate-600 mb-3">
                {REPORT_TEMPLATES[selectedReportType]?.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {REPORT_TEMPLATES[selectedReportType]?.sections.map(section => (
                  <Badge key={section} variant="outline">
                    {section.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Report Results</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportReport('json')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
                <Button variant="outline" onClick={scheduleReport}>
                  <Mail className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedReportType === REPORT_TYPES.PERFORMANCE_SUMMARY && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{reportData.total}</p>
                    <p className="text-sm text-blue-800">Total Jobs</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{reportData.completed}</p>
                    <p className="text-sm text-green-800">Completed</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{reportData.inProgress}</p>
                    <p className="text-sm text-yellow-800">In Progress</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{reportData.completionRate}%</p>
                    <p className="text-sm text-purple-800">Completion Rate</p>
                  </div>
                </div>
              )}

              {selectedReportType === REPORT_TYPES.ASSESSOR_PRODUCTIVITY && (
                <div className="space-y-3">
                  {reportData.map(assessor => (
                    <div key={assessor.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">{assessor.name}</p>
                        <p className="text-sm text-slate-500">{assessor.totalAssessments} total assessments</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{assessor.completionRate}%</p>
                        <p className="text-sm text-slate-500">Completion Rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-slate-500 pt-4 border-t">
                Report generated on {format(new Date(), 'PPP')} • 
                Date range: {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}