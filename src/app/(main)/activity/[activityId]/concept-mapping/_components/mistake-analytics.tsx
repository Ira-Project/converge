// components/CommonMistakes.tsx
import React from 'react';
import { api } from '@/trpc/server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MistakeAnalytics = async ({ activityId }: { activityId: string }) => {
  const data = await api.conceptMapping.getMostCommonMistakes.query({
    activityId: activityId,
  });

  if (data.length === 0) {
    return (
      <div className="flex flex-col gap-4 border rounded-xl p-4 h-full">
        <p className="font-medium">Most Common Mistakes</p>
        <p className="text-muted-foreground">No submissions yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border rounded-xl p-4 pt-2 h-full">
      <p className="font-medium">Most Common Mistakes</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mistake</TableHead>
            <TableHead className="text-right">Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((mistakeData, index) => (
            <TableRow key={index}>
              <TableCell>{mistakeData.label}</TableCell>
              <TableCell className="text-right">{mistakeData.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MistakeAnalytics;