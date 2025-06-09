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

  const submissions = await api.stepSolve.getSubmissions.query({ activityId });

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[500px] sm:min-w-[650px]">
        <TableHeader>
          <TableRow className="grid grid-cols-[minmax(120px,1fr)_140px_100px] sm:grid-cols-[minmax(150px,1fr)_250px_200px]">
            <TableHead className="flex items-center text-xs sm:text-sm">Student Name</TableHead>
            <TableHead className="flex items-center text-xs sm:text-sm">Submitted At</TableHead>
            <TableHead className="flex items-center text-xs sm:text-sm">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground text-xs sm:text-sm">
                No submissions yet
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((submission) => (
              <TableRow className="grid grid-cols-[minmax(120px,1fr)_140px_100px] sm:grid-cols-[minmax(150px,1fr)_250px_200px]" key={submission.id}>
                <TableCell className="truncate text-xs sm:text-sm">{submission.user?.name}</TableCell>
                <TableCell className="text-xs sm:text-sm">
                  {submission.submittedAt ? 
                    formatDateShort(submission.submittedAt) : ""
                  }
                </TableCell>
                <TableCell className="text-xs sm:text-sm">{submission.completionRate ? `${(submission.completionRate * 100).toFixed(2)}%` : "0%"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubmissionsTable;