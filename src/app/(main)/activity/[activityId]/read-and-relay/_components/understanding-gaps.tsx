// components/UnderstandingGaps.tsx
import React from 'react';
import { api } from '@/trpc/server';

const UnderstandingGaps = async ({ activityId }: { activityId: string }) => {

  const data = await api.readAndRelay.getStudentHighlights.query({
    activityId: activityId,
  });

  return (
    <div className="flex flex-col gap-4 border rounded-xl p-4 h-full">
      <p className="font-medium">Student Highlights</p>
      <div className="grid grid-rows-3 h-full">
        {data.map((highlight) => (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">{highlight.text}</span>
            <span className="text-sm text-muted-foreground">{highlight.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnderstandingGaps;