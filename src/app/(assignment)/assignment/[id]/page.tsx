import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { AssignmentView } from "./_components/assignment-view";

export default async function AssignmentPage({ params } : { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const assignment = await api.assignment.get.query({ assignmentId: params.id });
  const testAttemptId = await api.testAttempt.create.mutate({ assignmentId: params.id })

  if (!assignment) redirect(Paths.Home);
  
  return (
    <main>
      <AssignmentView 
        topic={assignment.topic.name}
        questions={assignment.questionToAssignment.map(q => q.question)}
        assignmentName={assignment.name ?? undefined}
        classroom={assignment.classroom}
        timeLimit={assignment.timeLimit}
        assignmentId={params.id}
        isLive={assignment.isLive}
        testAttemptId={testAttemptId} />
    </main>
  );
};