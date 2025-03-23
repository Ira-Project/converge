"use client"
import { type RouterOutputs } from '@/trpc/shared';
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export default function TopicBreakdownChart(props: {
  submissions: RouterOutputs["analytics"]["getSubmissions"]
}) {

  // Transform submissions data into chart format
  const data = React.useMemo(() => {
    const topicStats = new Map<string, { submissions: number; totalScore: number }>();
    
    // Calculate submissions and total scores for each topic
    props.submissions.forEach(submission => {
      const topic = submission.topic;
      if (!topicStats.has(topic)) {
        topicStats.set(topic, { submissions: 0, totalScore: 0 });
      }
      const stats = topicStats.get(topic)!;
      stats.submissions++;
      stats.totalScore += submission.score;
    });

    // Convert to chart data format with average scores
    const chartData = Array.from(topicStats.entries()).map(([topic, stats]) => ({
      topic,
      submissions: stats.submissions,
      averageScore: Math.round(stats.totalScore / stats.submissions),
    }));

    // Add empty entries at start and end for padding
    return [
      ...chartData,
    ];
  }, [props.submissions]);

  // Calculate max submissions for Y-axis domain
  const maxSubmissions = React.useMemo(() => {
    const max = Math.max(...data.map(d => d.submissions ?? 0));
    // Round up to nearest 10 for cleaner axis values
    return (max / 10) * 10;
  }, [data]);

  return (
    <div className="bg-white rounded-lg p-4 mx-auto border border-muted">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 20, bottom: 20 }}
        >
          <CartesianGrid stroke="#eee" vertical={false} />
          <XAxis 
            dataKey="topic" 
            tickLine={false}
            tick={{ fill: '#666', fontSize: 8, width: "700px" }}
            interval={0}
            padding={{ left: 50, right: 50 }}
          />
          <YAxis 
            label={{ value: 'Submissions', angle: -90, fontSize: 12 }}
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
            domain={[0, maxSubmissions]}
          />
          <YAxis 
            label={{ value: 'Average Score', angle: -90, fontSize: 12 }}
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
            domain={[0, 10]}
            ticks={[0, 2.5, 5, 7.5, 10]}
          />
          <Tooltip />
          <Legend 
            align="right"
            verticalAlign="top"
            wrapperStyle={{ paddingBottom: '32px', paddingRight: '20px', fontSize: '12px' }}
          />
          <Line 
            yAxisId="left" 
            dataKey="submissions" 
            stroke="#FECC5E"
            strokeWidth={1}
            dot={{ fill: '#FECC5E', r: 2 }}
            activeDot={{ r: 4 }}
            name="Submissions"
          />
          <Line 
            yAxisId="right" 
            dataKey="averageScore" 
            stroke="#E82D5C" 
            strokeWidth={1}
            dot={{ fill: '#E82D5C', r: 2 }}
            activeDot={{ r: 4 }}
            name="Average Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};