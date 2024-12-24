import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { AssignmentView } from "./_components/assignment-view";

export default async function AssignmentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const assignment = await api.explanationAssignment.get.query({ assignmentId: params.id });
  const testAttemptId = await api.explainTestAttempt.create.mutate({ assignmentId: params.id })

  if (!assignment) redirect(Paths.Home);

  return (
    <main>
      <AssignmentView 
        role={user.role}
        topic={assignment.topic.name}
        questions={assignment.questionToAssignment.map(q => q.question)}
        assignmentName={assignment.name ?? undefined}
        classroom={assignment.classroom}
        timeLimit={assignment.timeLimit}
        assignmentId={params.id}
        isLive={assignment.isLive}
        dueDate={assignment.dueDate ?? undefined}
        testAttemptId={testAttemptId} />
    </main>
  );
};