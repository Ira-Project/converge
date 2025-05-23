import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, type Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import KnowledgeZapAssignmentView from "./_components/knowledge-zap-assignment-view";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function KnowledgeZapRevisionPage(props: { params: Promise<{ classroomId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();

  let knowledgeZapAssignment, knowledgeZapAttemptId, userToClassroom: { role: Roles; isDeleted?: boolean } | undefined;
  if(user?.isOnboarded) {
    if(params.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId });
    }

    knowledgeZapAssignment = await api.knowledgeZap.getKnowledgeZapRevisionActivity.query({ classroomId: params.classroomId });
    knowledgeZapAttemptId = await api.knowledgeZap.createAssignmentAttempt.mutate({
      activityId: undefined,
    });

    if (!knowledgeZapAssignment || !knowledgeZapAttemptId) redirect(`${Paths.Classroom}${params.classroomId}`);
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }

  return (
    <main>
      <KnowledgeZapAssignmentView 
        assignmentAttemptId={knowledgeZapAttemptId ?? ""}
        classroomId={params.classroomId}
        knowledgeZapAssignment={knowledgeZapAssignment}
        knowledgeZapAttemptId={knowledgeZapAttemptId ?? ""} 
        />
    </main>
  );
};