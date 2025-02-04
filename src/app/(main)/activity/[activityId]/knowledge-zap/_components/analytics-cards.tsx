// components/AnalyticsCards.tsx
import React from 'react';
import { api } from '@/trpc/server';

const AnalyticsCards = async ({ activityId }: { activityId: string }) => {

  const analytics = await api.knowledgeZap.getAnalyticsCards.query({ activityId });

  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <div className="bg-lime-50 rounded-xl px-4 py-6">
      <p className="text-center font-medium">{analytics.averageQuestionsCompleted.toFixed(2) ?? 0}%</p>
        <p className="text-center text-muted-foreground text-sm">
          Average Questions Completed
        </p>
      </div>
      <div className="bg-lime-50 rounded-xl px-4 py-6">
        <p className="text-center font-medium">{analytics.submissionCount ?? 0}</p>
        <p className="text-center text-muted-foreground text-sm">
          Submissions
        </p>
      </div>
      <div className="bg-lime-50 rounded-xl px-4 py-6">
        <p className="text-center font-medium">{analytics.averageAttemptsPerSubmission.toFixed(2) ?? "N/A"}</p>
        <p className="text-center text-muted-foreground text-sm">
          Avg Attempts Per Submissions
        </p>
      </div>
    </div>
  );
};

export default AnalyticsCards;