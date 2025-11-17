// components/AnalyticsCards.tsx
import React from 'react';
import { api } from '@/trpc/server';

const AnalyticsCards = async ({ activityId }: { activityId: string }) => {

  const data = await api.readAndRelay.getAnalyticsCards.query({ activityId });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <div className="bg-blue-50 rounded-xl px-4 py-6">
        <p className="text-center font-medium">{(data?.averageScore * 100).toFixed(2)}%</p>
        <p className="text-center text-muted-foreground text-sm">
          Average Score
        </p>
      </div>
      <div className="bg-blue-50 rounded-xl px-4 py-6">
        <p className="text-center font-medium">{data?.submissionCount}</p>
        <p className="text-center text-muted-foreground text-sm">
          Submissions
        </p>
      </div>
      <div className="bg-blue-50 rounded-xl px-4 py-6">
        <p className="text-center font-medium">{data?.averageHighlightsPerSubmission.toFixed(2)}</p>
        <p className="text-center text-muted-foreground text-sm">
          Avg Highlights Per Submission
        </p>
      </div>
    </div>
  );
};

export default AnalyticsCards;