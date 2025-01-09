// components/AnalyticsCards.tsx
import React from 'react';
import { api } from '@/trpc/server';

const AnalyticsCards = async ({ activityId }: { activityId: string }) => {

  const analytics = await api.stepSolve.getAnalytics.query({ activityId });

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-teal-50 rounded-xl p-4">
      <p className="text-center font-medium">{(analytics.averageScore * 100).toFixed(2) ?? 0}%</p>
        <p className="text-center text-muted-foreground text-sm">
          Average Score
        </p>
      </div>
      <div className="bg-teal-50 rounded-xl p-4">
        <p className="text-center font-medium">{(analytics.reasoningErrorPercentage * 100).toFixed(2) ?? 0}%</p>
        <p className="text-center text-muted-foreground text-sm">
          Reasoning Error %
        </p>
      </div>
      <div className="bg-teal-50 rounded-xl p-4">
        <p className="text-center font-medium">{(analytics.evaluationErrorPercentage * 100).toFixed(2) ?? 0}%</p>
        <p className="text-center text-muted-foreground text-sm">
          Evaluation Error %
        </p>
      </div>
    </div>
  );
};

export default AnalyticsCards;