import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react'

const CHART_COLORS = {
  primary: '#334155',
  secondary: '#64748b',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  info: '#3b82f6',
  purple: '#9333ea'
}

const GRADIENT_COLORS = ['#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0']

export function JobTrendChart({ data, title = "Job Trends" }) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="jobs"
              fill={CHART_COLORS.primary}
              fillOpacity={0.3}
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke={CHART_COLORS.success}
              strokeWidth={3}
              dot={{ fill: CHART_COLORS.success, strokeWidth: 0, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function PerformanceMetricsChart({ data, title = "Performance Metrics" }) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="value" 
              fill={CHART_COLORS.primary}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function StatusPieChart({ data, title = "Status Distribution" }) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percentage }) => `${name} (${percentage}%)`}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function CompletionRateChart({ data, title = "Completion Rate Trend" }) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="rate"
              stroke={CHART_COLORS.success}
              fill={CHART_COLORS.success}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}