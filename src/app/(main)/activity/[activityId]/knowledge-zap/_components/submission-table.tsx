// components/SubmissionsTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from '@/trpc/server';
import { formatDateShort } from '@/lib/utils';

const SubmissionsTable = async ({ activityId }: { activityId: string }) => {

  const submissions = await api.knowledgeZap.getSubmissions.query({ activityId });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="grid grid-cols-[1fr_200px_250px_200px_200px]">
            <TableHead className="flex items-center">Student Name</TableHead>
            <TableHead className="flex items-center">Submitted At</TableHead>
            <TableHead className="flex items-center">Questions Completed</TableHead>
            <TableHead className="flex items-center">Attempts Taken</TableHead>
            <TableHead className="flex items-center">Time (mins)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No submissions yet
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((submission) => {
              const totalAttempts = submission.questionAttempts?.length ?? 0;
              const completedQuestions = submission.questionAttempts?.filter(
                (attempt) => attempt.isCorrect
              ).length ?? 0;
              const timeTaken = submission.submittedAt && submission.createdAt
                ? Math.round((submission.submittedAt.getTime() - submission.createdAt.getTime()) / (1000 * 60))
                : 0;

              return (
                <TableRow className="grid grid-cols-[1fr_200px_250px_200px_200px]" key={submission.id}>
                  <TableCell>{submission.user?.name}</TableCell>
                  <TableCell>
                    {submission.submittedAt ? 
                      formatDateShort(submission.submittedAt) : ""
                    }
                  </TableCell>
                  <TableCell>{completedQuestions}</TableCell>
                  <TableCell>{totalAttempts}</TableCell>
                  <TableCell>{timeTaken} mins</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubmissionsTable;