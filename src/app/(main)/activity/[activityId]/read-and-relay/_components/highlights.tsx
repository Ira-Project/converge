// components/UnderstandingGaps.tsx
import React from 'react';
import { api } from '@/trpc/server';

const Highlights = async ({ activityId }: { activityId: string }) => {

  const data = await api.readAndRelay.getStudentHighlights.query({
    activityId: activityId,
  });

  return (
    <div className="flex flex-col gap-4 border rounded-xl p-4 h-full">
      <p className="font-medium">Student Highlights</p>
      {data.map((highlight) => (
        <div className="flex justify-between" key={highlight.text}>
          <span className="text-sm text-muted-foreground">{highlight.text}</span>
          <span className="text-sm text-muted-foreground">{highlight.count}</span>
        </div>
      ))}
    </div>
  );
};

export default Highlights;