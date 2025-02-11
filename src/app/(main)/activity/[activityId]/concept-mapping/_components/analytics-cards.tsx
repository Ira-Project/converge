// components/AnalyticsCards.tsx
import React from 'react';
import { api } from '@/trpc/server';

const AnalyticsCards = async ({ activityId }: { activityId: string }) => {

  const analytics = await api.reasonTrace.getAnalytics.query({ activityId });

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-rose-50 rounded-xl p-4">
      <p className="text-center font-medium">{(analytics.averageScore * 100).toFixed(2) ?? 0}%</p>
        <p className="text-center text-muted-foreground text-sm">
          Average Score
        </p>
      </div>
      <div className="bg-rose-50 rounded-xl p-4">
        <p className="text-center font-medium">{analytics.submissionCount ?? 0}</p>
        <p className="text-center text-muted-foreground text-sm">
          Submissions
        </p>
      </div>
      <div className="bg-rose-50 rounded-xl p-4">
        <p className="text-center font-medium">{analytics.averageAttempts.toFixed(2) ?? "N/A"}</p>
        <p className="text-center text-muted-foreground text-sm">
          Avg Attempts Per Student
        </p>
      </div>
    </div>
  );
};

export default AnalyticsCards;