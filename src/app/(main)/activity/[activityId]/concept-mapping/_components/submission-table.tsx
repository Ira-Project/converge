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

  const submissions = await api.reasonTrace.getSubmissions.query({ activityId });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="grid grid-cols-[1fr_250px_200px]">
            <TableHead className="flex items-center">Student Name</TableHead>
            <TableHead className="flex items-center">Submitted At</TableHead>
            <TableHead className="flex items-center">Score</TableHead>
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
              <TableRow className="grid grid-cols-[1fr_250px_200px]" key={submission.id}>
                <TableCell>{submission.user?.name}</TableCell>
                <TableCell>
                  {submission.submittedAt ? 
                    formatDateShort(submission.submittedAt) : ""
                  }
                </TableCell>
                <TableCell>{submission.score ? `${(submission.score * 100).toFixed(2)}%` : "0%"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubmissionsTable;