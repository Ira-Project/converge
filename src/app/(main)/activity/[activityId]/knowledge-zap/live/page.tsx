import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import KnowledgeZapAssignmentView from "./_components/knowledge-zap-assignment-view";

export default async function ActivityPage(props: { params: Promise<{ activityId: string, classroomId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();

  let activity, userToClassroom, knowledgeZapAssignment, knowledgeZapAttemptId;
  if(user) {
    activity = await api.activities.getActivity.query({ activityId: params.activityId });
    knowledgeZapAssignment = await api.knowledgeZap.getKnowledgeZapActivity.query({ activityId: params.activityId });
    knowledgeZapAttemptId = await api.knowledgeZap.createAssignmentAttempt.mutate({ activityId: params.activityId });
    
    if(activity?.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: activity?.classroomId });
    }

    if (!activity || !knowledgeZapAssignment || !knowledgeZapAttemptId) redirect(`${Paths.Classroom}${params.classroomId}`);
  }

  return (
    <main>
      <KnowledgeZapAssignmentView 
        assignmentAttemptId={knowledgeZapAttemptId ?? ""}
        activityId={params.activityId}
        topic={activity?.topic?.name ?? ""}
        isLive={activity?.isLive ?? false}
        role={userToClassroom?.role ?? Roles.Student}
        classroomId={params.classroomId}
        knowledgeZapAssignment={knowledgeZapAssignment}
        knowledgeZapAttemptId={knowledgeZapAttemptId ?? ""} 
        dueDate={activity?.dueDate ?? undefined}
        />
    </main>
  );
};