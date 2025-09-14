
import React, { useState, useEffect } from 'react';
import { Job } from '@/api/entities';
import { Assessment } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

const COLORS = ['#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
const CHART_COLORS = {
  primary: '#334155',
  secondary: '#64748b',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  info: '#3b82f6'
};

function MetricCard({ title, value, trend, icon: Icon, color = 'slate' }) {
  const isPositive = trend?.startsWith('+');
  const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="bg-white shadow-sm border-slate-200/60 rounded-xl animate-fade-in-scale">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            {trend && (
              <div className="flex items-center mt-2 text-sm">
                <TrendIcon className="w-4 h-4 mr-1" />
                <span className={`${trendColor} font-medium`}>{trend}</span>
                <span className="text-slate-500 ml-2">vs last month</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function JobsOverTimeChart({ data }) {
  return (
    <Card className="bg-white shadow-sm border-slate-200/60 rounded-xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-700" />
          Jobs Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="month" 
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
            <Line 
              type="monotone" 
              dataKey="jobs" 
              stroke={CHART_COLORS.primary}
              strokeWidth={3}
              dot={{ fill: CHART_COLORS.primary, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: CHART_COLORS.primary, strokeWidth: 2 }}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function StatusDistributionChart({ data }) {
  return (
    <Card className="bg-white shadow-sm border-slate-200/60 rounded-xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-slate-700" />
          Job Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="status" 
              stroke="#64748b"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
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
            <Bar 
              dataKey="count" 
              fill={CHART_COLORS.primary}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function EventTypesChart({ data }) {
  return (
    <Card className="bg-white shadow-sm border-slate-200/60 rounded-xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-slate-700" />
          Event Types Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={2000}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2">
            {data.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {entry.name.replace('_', ' ')}
                </span>
                <Badge variant="outline" className="text-xs">
                  {entry.value}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssessmentCompletionChart({ data }) {
  return (
    <Card className="bg-white shadow-sm border-slate-200/60 rounded-xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-slate-700" />
          Assessment Completion Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="week" 
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
            <Area 
              type="monotone" 
              dataKey="completed" 
              stroke={CHART_COLORS.success}
              fill={CHART_COLORS.success}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={2500}
            />
            <Area 
              type="monotone" 
              dataKey="pending" 
              stroke={CHART_COLORS.warning}
              fill={CHART_COLORS.warning}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={2500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function CompanyAnalytics({ user, companyFilter }) {
  const [jobs, setJobs] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Load data based on user role and company filter
        let jobsFilter = {};
        if (companyFilter && user.user_role !== 'platform_admin') {
          jobsFilter.company_id = companyFilter;
        }

        const [jobsData, assessmentsData, usersData] = await Promise.all([
          Job.filter(jobsFilter, '-created_date'),
          Assessment.list('-created_date'),
          User.list()
        ]);

        setJobs(jobsData);
        setAssessments(assessmentsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user, companyFilter]);

  // Generate mock data for charts (in real app, this would be calculated from actual data)
  const jobsOverTime = [
    { month: 'Jan', jobs: 45 },
    { month: 'Feb', jobs: 52 },
    { month: 'Mar', jobs: 48 },
    { month: 'Apr', jobs: 61 },
    { month: 'May', jobs: 55 },
    { month: 'Jun', jobs: 67 },
    { month: 'Jul', jobs: 71 },
    { month: 'Aug', jobs: 58 },
    { month: 'Sep', jobs: 63 },
    { month: 'Oct', jobs: 69 },
    { month: 'Nov', jobs: 74 },
    { month: 'Dec', jobs: 82 }
  ];

  const statusDistribution = [
    { status: 'Completed', count: 45 },
    { status: 'In Progress', count: 23 },
    { status: 'Assigned', count: 18 },
    { status: 'Pending', count: 12 },
    { status: 'On Hold', count: 7 }
  ];

  const eventTypes = [
    { name: 'storm', value: 35 },
    { name: 'escape_of_liquid', value: 28 },
    { name: 'fire', value: 18 },
    { name: 'impact', value: 12 },
    { name: 'other', value: 7 }
  ];

  const assessmentTrend = [
    { week: 'W1', completed: 12, pending: 8 },
    { week: 'W2', completed: 15, pending: 6 },
    { week: 'W3', completed: 18, pending: 9 },
    { week: 'W4', completed: 22, pending: 5 },
    { week: 'W5', completed: 19, pending: 7 },
    { week: 'W6', completed: 25, pending: 4 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl loading-shimmer"></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-xl loading-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Jobs"
          value={jobs.length}
          trend="+12.5%"
          icon={Briefcase}
          color="blue"
        />
        <MetricCard
          title="Active Assessors"
          value={users.filter(u => u.is_assessor).length}
          trend="+8.2%"
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Avg. Completion Time"
          value="3.2 days"
          trend="-15.3%"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Completion Rate"
          value="94.2%"
          trend="+2.1%"
          icon={Target}
          color="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <JobsOverTimeChart data={jobsOverTime} />
        <StatusDistributionChart data={statusDistribution} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <EventTypesChart data={eventTypes} />
        <AssessmentCompletionChart data={assessmentTrend} />
      </div>
    </div>
  );
}
