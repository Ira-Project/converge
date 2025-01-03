// components/UnderstandingGaps.tsx
import React from 'react';
import { api } from '@/trpc/server';
import { TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Table } from '@/components/ui/table';

const HeatMap = async ({ activityId }: { activityId: string }) => {

  const { heatMap, noOfQuestions } = await api.knowledgeZap.getHeatMap.query({
    activityId: activityId,
  });


  const getCellColor = (attempts: number) => {
    if (attempts === 0) return "bg-red-100";
    if (attempts > 1) return "bg-yellow-100";
    return "bg-green-100";
  };

  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse">
        <TableHeader>   
          <TableRow>
            <TableHead className="border border-gray-200">Student Name</TableHead>
            {Array.from({ length: noOfQuestions }, (_, index) => (
              <TableHead key={index} className="border border-gray-200">Question {index + 1}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {heatMap.length === 0 ? (
            <TableRow>
              <TableCell colSpan={noOfQuestions + 1} className="text-center text-muted-foreground border border-gray-200">
                No submissions yet
              </TableCell>
            </TableRow>
          ) : (
            heatMap.map((submission) => (
              <TableRow key={submission.attemptId}>
                <TableCell className="border border-gray-200">{submission.name}</TableCell>
                {submission.questionAttempts.map((questionAttempt) => (
                  <TableCell 
                    key={questionAttempt.id} 
                    className={`border border-gray-200 ${getCellColor(questionAttempt.attempts)}`}
                  >
                    {questionAttempt.attempts > 1 ? `${questionAttempt.attempts} attempts` : ''}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default HeatMap;