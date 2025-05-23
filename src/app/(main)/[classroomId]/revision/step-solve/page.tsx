import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, type Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import StepSolveActivityView from "./_components/step-solve-activity-view";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function StepSolveRevisionPage(props: { params: Promise<{ classroomId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();

  let stepSolveAssignment, stepSolveAttemptId, userToClassroom: { role: Roles; isDeleted?: boolean } | undefined;
  if(user?.isOnboarded) {
    if(params.classroomId) {  
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId });
    }

    stepSolveAttemptId = await api.stepSolve.createAttempt.mutate({
      activityId: undefined,
      assignmentId: undefined
    });

    stepSolveAssignment = await api.stepSolve.getRevisionActivity.query({ classroomId: params.classroomId });

    if (!stepSolveAssignment || !stepSolveAttemptId) redirect(`${Paths.Classroom}${params.classroomId}`);
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }

  return (
    <main>
      <StepSolveActivityView 
        classroomId={params.classroomId}
        stepSolveAssignment={stepSolveAssignment ?? { stepSolveQuestions: [] }}
        stepSolveAttemptId={stepSolveAttemptId ?? ""} 
        />
    </main>
  );
};