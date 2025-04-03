// components/UnderstandingGaps.tsx
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from '@/trpc/server';
import FormattedText from '@/components/formatted-text';

const QuestionAnalytics = async ({ activityId }: { activityId: string }) => {
  const data = await api.stepSolve.getQuestionAnalytics.query({
    activityId: activityId,
  });

  if (data.length === 0) {
    return (
      <div className="flex flex-col gap-4 border rounded-xl p-4 h-full">
        <p className="font-medium">Question Analytics</p>
        <p className="text-muted-foreground">No submissions yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border rounded-xl p-4 pt-2 h-full">      
      <Tabs defaultValue="q1" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {data.map((_, index) => (
            <TabsTrigger key={`q${index + 1}`} value={`q${index + 1}`}>
              Question {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {data.map((questionData, index) => (
          <TabsContent key={`q${index + 1}`} value={`q${index + 1}`}>
            <div className="flex flex-col gap-3">
              <p className="text-sm line-clamp-2">
                <FormattedText text={questionData.questionText} />
              </p>
              {
                questionData.steps.map((step) => (
                  <div className="space-y-1" key={step.stepId}>
                    <div className="flex justify-between text-xs gap-4">
                      <span>
                        <FormattedText text={`Step ${step.stepNumber}: ${step.stepText}`} />
                      </span>
                      <span className="my-auto text-xs align-middle">{(step.percentageCorrect * 100).toFixed(2)}%</span>
                    </div>
                    <Progress color="teal" value={step.percentageCorrect * 100} />
                  </div>
                ))
              }
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default QuestionAnalytics;