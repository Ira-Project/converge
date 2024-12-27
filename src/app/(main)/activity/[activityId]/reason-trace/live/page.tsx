import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import ReasoningAssignmentView from "./_components/reasoning-assignment-view";

export default async function ActivityPage(props: { params: Promise<{ activityId: string, classroomId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const reasoningAssignment = await api.reasoningAssignment.get.query({ assignmentId: params.activityId });
  const reasoningAttemptId = await api.reasoningAssignment.createAttempt.mutate({ assignmentId: params.activityId });

  if (!reasoningAssignment || !reasoningAttemptId) redirect(`${Paths.Classroom}${user.classroomId}`);

  return (
    <main>
      <ReasoningAssignmentView reasoningAssignment={reasoningAssignment} reasoningAttemptId={reasoningAttemptId} />
    </main>
  );
};