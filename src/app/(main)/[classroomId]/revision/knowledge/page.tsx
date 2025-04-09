import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import KnowledgeZapAssignmentView from "./_components/knowledge-zap-assignment-view";

export default async function ActivityPage(props: { params: Promise<{ classroomId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();

  let knowledgeZapAssignment, knowledgeZapAttemptId;
  if(user?.isOnboarded) {
    if(params.classroomId) {
      void api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId });
    }

    knowledgeZapAssignment = await api.knowledgeZap.getKnowledgeZapRevisionActivity.query({ classroomId: params.classroomId });
    knowledgeZapAttemptId = await api.knowledgeZap.createAssignmentAttempt.mutate({
      activityId: undefined,
    });

    if (!knowledgeZapAssignment || !knowledgeZapAttemptId) redirect(`${Paths.Classroom}${params.classroomId}`);
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