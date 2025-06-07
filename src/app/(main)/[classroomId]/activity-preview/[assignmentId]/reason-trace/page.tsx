import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import ReasonTracePreviewView from "./_components/reason-trace-preview-view";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function ReasonTracePreviewPage(props: { 
  params: Promise<{ 
    classroomId: string; 
    assignmentId: string; 
  }> 
}) {
  const params = await props.params;
  const { user } = await validateRequest();

  let userToClassroom: { role: Roles; isDeleted?: boolean } | undefined, reasoningAssignment, reasoningAttemptId;
  if(user?.isOnboarded) {
    reasoningAssignment = await api.reasonTrace.getById.query({ assignmentId: params.assignmentId });
    reasoningAttemptId = await api.reasonTrace.createAttempt.mutate({ 
      activityId: undefined,
      assignmentId: params.assignmentId,
    });
    
    if(params.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId });
    }

    if (!reasoningAssignment || !reasoningAttemptId) redirect(`${Paths.Classroom}${params.classroomId}`);
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }

  return (
    <main>
      <ReasonTracePreviewView 
        topicId={reasoningAssignment?.topicId ?? ""}
        topic={reasoningAssignment?.topic?.name ?? ""}
        role={userToClassroom?.role ?? Roles.Teacher}
        classroomId={params.classroomId}
        reasoningAssignment={reasoningAssignment}
        reasoningAttemptId={reasoningAttemptId ?? ""} 
        />
    </main>
  );
} 