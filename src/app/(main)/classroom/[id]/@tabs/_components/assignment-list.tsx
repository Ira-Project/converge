import { api } from "@/trpc/server";
import { Suspense } from "react";
import { AssignmentTableSkeleton } from "./assignment-table-skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Paths } from "@/lib/constants";
import Link from "next/link";

export const AssignmentList = async ({ id }: { id?: string }) => {

  const { pastAssignments, ongoingAssignments } = await api.assignment.list.query(
    { classroomId: id }
  );

  return (
    <div>
      <div className="flex flex-col gap-8">
        <section>
          <p className="text-xl font-semibold mb-4">Ongoing Assignments</p>
            {
              ongoingAssignments.length === 0 
              ?
                <p className="text-muted-foreground">No ongoing assignments found</p>
              :
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Assignment</TableHead>
                    <TableHead className="w-1/4">Topic</TableHead>
                    <TableHead className="w-1/4">Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <Suspense fallback={<AssignmentTableSkeleton />}>
                    {ongoingAssignments.map(assignment => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <Link href={`${Paths.Assignment}${assignment.id}`} key={assignment.id}>
                            <span className="underline">{assignment.topic?.name}</span>
                          </Link>
                        </TableCell>
                        <TableCell>{assignment.name}</TableCell>
                        <TableCell>{new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(assignment.dueDate)}</TableCell>
                        </TableRow> 
                    ))}
                  </Suspense>
                </TableBody>
              </Table>
            }
        </section>
        <section>
          <p className="text-xl font-semibold mb-4">Past Assignments</p>
            {
              pastAssignments.length === 0 
              ?
                <p className="text-muted-foreground">No past assignments found</p>
              :
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Assignment</TableHead>
                    <TableHead className="w-1/4">Topic</TableHead>
                    <TableHead className="w-1/4">Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <Suspense fallback={<AssignmentTableSkeleton />}>
                    {pastAssignments.map(assignment => (
                      <TableRow key={assignment.id}>
                        <TableCell>{assignment.name}</TableCell>
                        <TableCell>{assignment.topic?.name}</TableCell>
                        <TableCell>{new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(assignment.dueDate)}</TableCell>
                      </TableRow> 
                    ))}
                  </Suspense>
                </TableBody>
              </Table>
            }
        </section>
      </div>
    </div>
  );
}