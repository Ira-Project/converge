import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import KnowledgeZapAssignmentView from "./_components/knowledge-zap-assignment-view";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function ActivityPage(props: { params: Promise<{ activityId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();

  let activity, userToClassroom: { role: Roles; isDeleted?: boolean } | undefined, knowledgeZapAssignment, knowledgeZapAttemptId;
  if(user?.isOnboarded) {
    activity = await api.activities.getActivity.query({ activityId: params.activityId });
    knowledgeZapAssignment = await api.knowledgeZap.getKnowledgeZapActivity.query({ activityId: params.activityId });
    knowledgeZapAttemptId = await api.knowledgeZap.createAssignmentAttempt.mutate({ activityId: params.activityId });
    
    if(activity?.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: activity?.classroomId });
    }

    if (!activity || !knowledgeZapAssignment || !knowledgeZapAttemptId) redirect(`${Paths.Classroom}${activity?.classroomId ?? ""}`);
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }

  return (
    <main>
      <KnowledgeZapAssignmentView 
        assignmentAttemptId={knowledgeZapAttemptId ?? ""}
        activityId={params.activityId}
        topic={activity?.topic?.name ?? ""}
        isLive={activity?.isLive ?? false}
        role={userToClassroom?.role ?? Roles.Student}
        classroomId={activity?.classroomId ?? ""}
        knowledgeZapAssignment={knowledgeZapAssignment}
        knowledgeZapAttemptId={knowledgeZapAttemptId ?? ""} 
        dueDate={activity?.dueDate ?? undefined}
        />
    </main>
  );
};