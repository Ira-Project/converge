import { validateRequest } from "@/lib/auth/validate-request";
import { ActivityType, Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import StepSolvePreviewView from "./_components/step-solve-preview-view";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function StepSolvePreviewPage(props: { 
  params: Promise<{ 
    classroomId: string; 
    assignmentId: string; 
  }> 
}) {
  const params = await props.params;
  const { user } = await validateRequest();

  let userToClassroom: { role: Roles; isDeleted?: boolean } | undefined, stepSolveAssignment, stepSolveAttemptId;
  if(user?.isOnboarded) {
    stepSolveAssignment = await api.stepSolve.getStepSolveAssignmentById.query({ assignmentId: params.assignmentId });
    stepSolveAttemptId = await api.stepSolve.createAttempt.mutate({ 
      activityId: undefined,
      assignmentId: params.assignmentId,
    });
    
    if(params.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId });
    }

    if (!stepSolveAssignment || !stepSolveAttemptId) redirect(`${Paths.Classroom}${params.classroomId}`);
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }

  return (
    <main>
      <StepSolvePreviewView 
        assignmentAttemptId={stepSolveAttemptId ?? ""}
        assignmentId={params.assignmentId}
        activityType={ActivityType.StepSolve}
        activityName={stepSolveAssignment?.name ?? ""}
        topicId={stepSolveAssignment?.topicId ?? ""}
        topic={stepSolveAssignment?.topic?.name ?? ""}
        role={userToClassroom?.role ?? Roles.Teacher}
        classroomId={params.classroomId}
        stepSolveAssignment={stepSolveAssignment}
        stepSolveAttemptId={stepSolveAttemptId ?? ""} 
        />
    </main>
  );
} 