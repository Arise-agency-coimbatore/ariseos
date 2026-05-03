'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '@/store';
import { subDays, format, isSameDay, startOfDay } from 'date-fns';

export function RevenueChart() {
  const { leads } = useAppStore();

  // Generate data for the last 7 days
  const data = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(startOfDay(new Date()), 6 - i);
    const dayLeads = leads.filter(lead => isSameDay(new Date(lead.created_at), date));
    
    return {
      name: format(date, 'EEE'),
      revenue: dayLeads.reduce((sum, lead) => sum + (Number(lead.revenue_value) || 0), 0),
      leads: dayLeads.length,
    };
  });

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1d4e92" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="#7da8dc" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            yAxisId="left" 
            stroke="#7da8dc" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `$${value}`} 
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#7da8dc" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0a192f', 
              border: '1px solid #183e76', 
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: '#ebf0f9' }}
          />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="revenue" 
            name="Revenue"
            stroke="#06b6d4" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} 
            activeDot={{ r: 6, stroke: '#0a192f', strokeWidth: 2 }} 
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="leads" 
            name="New Leads"
            stroke="#f97316" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }} 
            activeDot={{ r: 6, stroke: '#0a192f', strokeWidth: 2 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
