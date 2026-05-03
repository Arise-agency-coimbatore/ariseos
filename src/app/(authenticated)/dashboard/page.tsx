'use client';

import { useAppStore } from '@/store';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { DollarSign, Users, Activity, Briefcase, FolderKanban, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { leads, projects, tasks, activities } = useAppStore();

  const totalRevenue = leads.reduce((acc, lead) => acc + (lead.revenue_value || 0), 0);
  const activeLeads = leads.filter(l => l.status !== 'Closed').length;
  
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;

  const pipelineData = [
    { name: 'New/Contacted', value: leads.filter(l => l.status === 'New' || l.status === 'Contacted').length },
    { name: 'Negotiation', value: leads.filter(l => l.status === 'Negotiation').length },
    { name: 'Closed', value: leads.filter(l => l.status === 'Closed').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-navy-300 mt-1">Here's what's happening with your business today.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Revenue Pipeline" value={`$${totalRevenue.toLocaleString()}`} change="+12.5%" isPositive={true} icon={DollarSign} />
        <MetricCard title="Active Leads" value={activeLeads.toString()} change="+5.2%" isPositive={true} icon={Users} />
        <MetricCard title="Active Projects" value={activeProjects.toString()} change="Steady" isPositive={true} icon={FolderKanban} />
        <MetricCard title="Tasks Completed" value={completedTasks.toString()} change="+3 this week" isPositive={true} icon={CheckCircle2} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Revenue & Leads Pipeline</h3>
          <RevenueChart />
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Sales Pipeline Status</h3>
          <PipelineChart data={pipelineData} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl bg-navy-900/40 border border-navy-700/30">
              <div className="flex-shrink-0 mt-0.5">
                {activity.type === 'LEAD_ADDED' && <Users className="h-5 w-5 text-cyan-400" />}
                {activity.type === 'PROJECT_CREATED' && <FolderKanban className="h-5 w-5 text-orange-400" />}
                {activity.type === 'TASK_COMPLETED' && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                {activity.type === 'STATUS_UPDATED' && <Activity className="h-5 w-5 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{activity.description}</p>
                <p className="text-xs text-navy-300 mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-navy-400 py-4 text-center">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, isPositive, icon: Icon }: any) {
  return (
    <div className="glass-card p-5 group hover:bg-navy-800/80 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-navy-200">{title}</p>
        <div className="p-2 bg-navy-800/50 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
          <Icon className="h-5 w-5 text-cyan-400" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <p className="text-2xl font-bold text-white text-glow">{value}</p>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}
