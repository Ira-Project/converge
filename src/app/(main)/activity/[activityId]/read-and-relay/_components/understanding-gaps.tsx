// components/UnderstandingGaps.tsx
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { api } from '@/trpc/server';

const UnderstandingGaps = async ({ activityId }: { activityId: string }) => {

  const data = await api.learnByTeaching.getUnderstandingGaps.query({
    activityId: activityId,
  });

  return (
    <div className="flex flex-col gap-4 border rounded-xl p-4 h-full">
      <p className="font-medium">Student Understanding Gap</p>
      <div className="grid grid-rows-3 h-full">
        {data.map((gap) => (
          <div key={gap.conceptId} className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{gap.conceptName}</span>
              <span className="text-sm text-muted-foreground">{gap.score}%</span>
            </div>
            <Progress value={gap.score} className="h-2" color="amber" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnderstandingGaps;