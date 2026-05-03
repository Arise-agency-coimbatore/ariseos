'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', revenue: 4000, leads: 24 },
  { name: 'Tue', revenue: 3000, leads: 13 },
  { name: 'Wed', revenue: 2000, leads: 98 },
  { name: 'Thu', revenue: 2780, leads: 39 },
  { name: 'Fri', revenue: 1890, leads: 48 },
  { name: 'Sat', revenue: 2390, leads: 38 },
  { name: 'Sun', revenue: 3490, leads: 43 },
];

export function RevenueChart() {
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
          <CartesianGrid strokeDasharray="3 3" stroke="#1d4e92" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#7da8dc" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
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
            contentStyle={{ backgroundColor: '#0a192f', border: '1px solid #183e76', borderRadius: '8px' }}
            itemStyle={{ color: '#ebf0f9' }}
          />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="revenue" 
            stroke="#06b6d4" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} 
            activeDot={{ r: 6, stroke: '#0a192f', strokeWidth: 2 }} 
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="leads" 
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
