"use client"
import { type RouterOutputs } from '@/trpc/shared';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function MonthlySubmissionsChart(props: {
  submissions: RouterOutputs["analytics"]["getSubmissions"]
}) {
  // Process submissions data to group by month
  const submissionsData = React.useMemo(() => {
    const monthlyCount = new Map<string, number>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months with 0
    monthNames.forEach(month => monthlyCount.set(month, 0));
    
    // Count submissions for each month
    props.submissions.forEach(submission => {
      const date = new Date(submission.createdAt);
      const month = monthNames[date.getMonth()];
      monthlyCount.set(month ?? '', (monthlyCount.get(month ?? '') ?? 0) + 1);
    });
    
    // Convert to array of objects and sort by month order
    return monthNames.map(month => ({
      month,
      submissions: monthlyCount.get(month) ?? 0
    }));
  }, [props.submissions]);

  // Calculate maximum submissions and generate ticks
  const maxSubmissions = React.useMemo(() => {
    const max = Math.max(...submissionsData.map(d => d.submissions));
    // Round up to nearest 5
    return Math.ceil(max / 5) * 5;
  }, [submissionsData]);

  // Generate ticks array
  const yAxisTicks = React.useMemo(() => {
    const tickCount = 5;
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      ticks.push((maxSubmissions / tickCount) * i);
    }
    return ticks;
  }, [maxSubmissions]);

  return (
    <div className="bg-white rounded-lg px-4 py-2 mx-auto border border-muted h-full flex flex-col justify-center">
      <p className="text-md font-medium text-gray-800 mb-4">Submissions</p>
      <ResponsiveContainer width="100%" height={325}>
        <BarChart
          data={submissionsData}
          margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="0" stroke="#eee" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#666666', fontSize: 12 }}
          />
          <YAxis 
            domain={[0, maxSubmissions]}
            ticks={yAxisTicks}
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#666666', fontSize: 12 }}
          />
          <Bar 
            dataKey="submissions" 
            fill="#FECC5E" 
            radius={[4, 4, 0, 0]} 
            barSize={75} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};