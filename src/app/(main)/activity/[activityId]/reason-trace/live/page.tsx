import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import ReasoningAssignmentView from "./_components/reasoning-assignment-view";

export default async function ActivityPage(props: { params: Promise<{ activityId: string, classroomId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const activity = await api.activities.getActivity.query({ activityId: params.activityId });
  const reasoningAssignment = await api.reasonTrace.get.query({ activityId: params.activityId });
  const reasoningAttemptId = await api.reasonTrace.createAttempt.mutate({ activityId: params.activityId });

  if (!activity || !reasoningAssignment || !reasoningAttemptId) redirect(`${Paths.Classroom}${user.classroomId}`);

  return (
    <main>
      <ReasoningAssignmentView 
        activityId={params.activityId}
        topic={activity?.topic?.name ?? ""}
        isLive={activity.isLive}
        role={user.role}
        reasoningAssignment={reasoningAssignment}
        reasoningAttemptId={reasoningAttemptId} 
        dueDate={activity.dueDate ?? undefined}
        />
    </main>
  );
};