import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import ReasoningAssignmentView from "./_components/reasoning-assignment-view";

export default async function AssignmentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const reasoningAssignment = await api.reasoningAssignment.get.query({ assignmentId: params.id });
  const reasoningAttemptId = await api.reasoningAssignment.createAttempt.mutate({ assignmentId: params.id });

  if (!reasoningAssignment || !reasoningAttemptId) redirect(Paths.Home);

  return (
    <main>
      <ReasoningAssignmentView reasoningAssignment={reasoningAssignment} reasoningAttemptId={reasoningAttemptId} />
    </main>
  );
};