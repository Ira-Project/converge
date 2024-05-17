import { api } from "@/trpc/server";
import { Suspense } from "react";
import { AssignmentCardSkeleton } from "./assignment-card-skeleton";
import { AssignmentCard } from "./assignment-card";

export const AssignmentList = async ({ id }: { id?: string }) => {

  const { pastAssignments, ongoingAssignments } = await api.assignment.list.query(
    { classroomId: id }
  );

  return (
    <div>
      <div className="flex flex-col gap-8">
        <section>
          <p className="text-xl font-semibold mb-4">Ongoing Assignments</p>
          <Suspense fallback={<AssignmentCardSkeleton />}>
            <div className="flex flex-col gap-4">
              {ongoingAssignments.map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </Suspense>
        </section>
        <section>
          <p className="text-xl font-semibold mb-4">Past Assignments</p>
          <Suspense fallback={<AssignmentCardSkeleton />}>
            <div className="flex flex-col gap-4">
              {pastAssignments.map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </Suspense>
        </section>
      </div>
    </div>
  );
}