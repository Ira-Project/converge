import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import StepSolveActivityView from "./_components/step-solve-activity-view";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function ActivityPage(props: { params: Promise<{ activityId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();

  let activity;
  let stepSolveAssignment;
  let stepSolveAttemptId;
  let userToClassroom: { role: Roles; isDeleted?: boolean } | undefined;

  if(user?.isOnboarded) {
    [activity, stepSolveAssignment] = await Promise.all([
      api.activities.getActivity.query({ activityId: params.activityId }),
      api.stepSolve.getAssignment.query({ activityId: params.activityId })
    ]);

    if(activity?.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: activity?.classroomId });
    }

    if(!activity || !stepSolveAssignment?.id) {
      redirect(`${Paths.Classroom}${activity?.classroomId ?? ""}`);
    }

    stepSolveAttemptId = await api.stepSolve.createAttempt.mutate({ 
      activityId: params.activityId ,
      assignmentId: stepSolveAssignment?.id ?? ""
    });

    if (!stepSolveAttemptId) {
      redirect(`${Paths.Classroom}${activity?.classroomId ?? ""}`);
    }
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }

  return (
    <main>
      <StepSolveActivityView 
        activityId={params.activityId}
        topic={activity?.topic?.name ?? ""}
        isLive={activity?.isLive ?? true}
        classroomId={activity?.classroomId ?? ""}
        role={userToClassroom?.role ?? Roles.Student}
        stepSolveAssignment={stepSolveAssignment}
        stepSolveAttemptId={stepSolveAttemptId ?? ""} 
        dueDate={activity?.dueDate ?? undefined}
        />
    </main>
  );
};