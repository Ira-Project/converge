import { validateRequest } from "@/lib/auth/validate-request";
import { ActivityType, Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import KnowledgeZapPreviewView from "./_components/knowledge-zap-preview-view";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function KnowledgeZapPreviewPage(props: { 
  params: Promise<{ 
    classroomId: string; 
    assignmentId: string; 
  }> 
}) {
  const params = await props.params;
  const { user } = await validateRequest();

  let userToClassroom: { role: Roles; isDeleted?: boolean } | undefined, knowledgeZapAssignment, knowledgeZapAttemptId;
  if(user?.isOnboarded) {
    knowledgeZapAssignment = await api.knowledgeZap.getKnowledgeZapAssignment.query({ assignmentId: params.assignmentId });
    knowledgeZapAttemptId = await api.knowledgeZap.createAssignmentAttempt.mutate({ 
      activityId: undefined,
      assignmentId: params.assignmentId,
    });
    
    if(params.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId });
    }

    if (!knowledgeZapAssignment || !knowledgeZapAttemptId) redirect(`${Paths.Classroom}${params.classroomId}`);
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }

  return (
    <main>
      <KnowledgeZapPreviewView 
        assignmentAttemptId={knowledgeZapAttemptId ?? ""}
        assignmentId={params.assignmentId}
        activityType={ActivityType.KnowledgeZap}
        activityName={knowledgeZapAssignment?.name ?? ""}
        topicId={knowledgeZapAssignment?.topicId ?? ""}
        topic={knowledgeZapAssignment?.topic?.name ?? ""}
        role={userToClassroom?.role ?? Roles.Teacher}
        classroomId={params.classroomId}
        knowledgeZapAssignment={knowledgeZapAssignment}
        knowledgeZapAttemptId={knowledgeZapAttemptId ?? ""} 
        />
    </main>
  );
} 