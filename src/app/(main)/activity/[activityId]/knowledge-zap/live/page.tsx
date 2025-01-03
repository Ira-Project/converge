import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import KnowledgeZapAssignmentView from "./_components/knowledge-zap-assignment-view";

export default async function ActivityPage(props: { params: Promise<{ activityId: string, classroomId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const activity = await api.activities.getActivity.query({ activityId: params.activityId });

  const knowledgeZapAssignment = await api.knowledgeZap.getKnowledgeZapActivity.query({ activityId: params.activityId });
  const knowledgeZapAttemptId = await api.knowledgeZap.createAssignmentAttempt.mutate({ activityId: params.activityId });

  if (!activity || !knowledgeZapAssignment || !knowledgeZapAttemptId) redirect(`${Paths.Classroom}${params.classroomId}`);

  return (
    <main>
      <KnowledgeZapAssignmentView 
        assignmentAttemptId={knowledgeZapAttemptId}
        activityId={params.activityId}
        topic={activity?.topic?.name ?? ""}
        isLive={activity.isLive}
        role={user.role}
        classroomId={params.classroomId}
        knowledgeZapAssignment={knowledgeZapAssignment}
        knowledgeZapAttemptId={knowledgeZapAttemptId} 
        dueDate={activity.dueDate ?? undefined}
        />
    </main>
  );
};