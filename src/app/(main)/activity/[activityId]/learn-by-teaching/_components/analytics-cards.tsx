// components/AnalyticsCards.tsx
import React from 'react';
import { api } from '@/trpc/server';

const AnalyticsCards = async ({ activityId }: { activityId: string }) => {

  const data = await api.learnByTeaching.getAnalyticsCards.query({ activityId });  

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-amber-50 rounded-xl p-4">
        <p className="text-center font-medium">{(data?.averageScore * 100).toFixed(2)}%</p>
        <p className="text-center text-muted-foreground text-sm">
          Average Score
        </p>
      </div>
      <div className="bg-amber-50 rounded-xl p-4">
        <p className="text-center font-medium">{data?.submissionCount}</p>
        <p className="text-center text-muted-foreground text-sm">
          Submissions
        </p>
      </div>
      <div className="bg-amber-50 rounded-xl p-4">
        <p className="text-center font-medium">{data?.averageExplanationsPerSubmission.toFixed(2)}</p>
        <p className="text-center text-muted-foreground text-sm">
          Avg Attempts Per Student
        </p>
      </div>
    </div>
  );
};

export default AnalyticsCards;