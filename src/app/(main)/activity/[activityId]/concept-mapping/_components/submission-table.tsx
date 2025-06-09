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

  const submissions = await api.conceptMapping.getSubmissions.query({ activityId });

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Student Name</TableHead>
            <TableHead className="min-w-[120px] whitespace-nowrap">Submitted At</TableHead>
            <TableHead className="min-w-[80px]">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No submissions yet
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="min-w-[200px]">{submission.user?.name}</TableCell>
                <TableCell className="min-w-[120px] whitespace-nowrap">
                  {submission.submittedAt ? 
                    formatDateShort(submission.submittedAt) : ""
                  }
                </TableCell>
                <TableCell className="min-w-[80px]">{submission.score ? `${(submission.score * 100).toFixed(2)}%` : "0%"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubmissionsTable;