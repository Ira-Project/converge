import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import ReasoningAssignmentView from "./_components/reasoning-assignment-view";

export default async function ActivityPage(props: { params: Promise<{ activityId: string, classroomId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();

  let activity, userToClassroom, reasoningAssignment, reasoningAttemptId;

  if(user) {
    activity = await api.activities.getActivity.query({ activityId: params.activityId });
    if(activity?.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: activity?.classroomId });
    }

    reasoningAssignment = await api.reasonTrace.get.query({ activityId: params.activityId });
    reasoningAttemptId = await api.reasonTrace.createAttempt.mutate({ activityId: params.activityId });

    if (!activity || !reasoningAssignment || !reasoningAttemptId) redirect(`${Paths.Classroom}${params.classroomId}`);
  }

  return (
    <main>
      <ReasoningAssignmentView 
        activityId={params.activityId}
        topic={activity?.topic?.name ?? ""}
        isLive={activity?.isLive ?? false}
        classroomId={params.classroomId}
        role={userToClassroom?.role ?? Roles.Student}
        reasoningAssignment={reasoningAssignment}
        reasoningAttemptId={reasoningAttemptId ?? ""} 
        dueDate={activity?.dueDate ?? undefined}
        />
    </main>
  );
};