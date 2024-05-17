import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { api } from "@/trpc/server";import { Button } from "@/components/ui/button";
import { AssignmentCard } from "./_components/assignment-card";
import { CreateAssignmentForm } from "./_components/create-assignment-form";

 export default async function ClassroomPage({ params } : { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const { pastAssignments, ongoingAssignments } = await api.assignment.list.query({
    classroomId: params.id,
  });

  const classroom = await api.classroom.get.query({
    id: params.id,
  });

  
  return (
    <>
      <main className="p-16">
        <div className="flex flex-col gap-8">
          <div className="flex row items-center">
            <Suspense fallback={ <Skeleton className="h-8 w-96" /> }>
              <p className="text-4xl font-semibold"> {classroom?.name} </p>
            </Suspense>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">Assignments</Button>
            <Button variant="outline">People</Button>
          </div>
          <Separator />
        </div>
        <div className="flex flex-row pt-8 gap-8">
          <div className="w-2/3 min-h-48">
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xl font-semibold mb-4">Ongoing Assignments</p>
                <div className="flex flex-col gap-4">
                  {ongoingAssignments.map(assignment => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xl font-semibold mb-4">Past Assignments</p>
                <div className="flex flex-col gap-4">
                  {pastAssignments.map(assignment => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/3">
            <CreateAssignmentForm />
          </div>
        </div>
      </main>
    </>
  );
};