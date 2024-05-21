import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import AssignmentTutorialModal from "./_components/assignment-tutorial-modal";
import { api } from "@/trpc/server";
import { AssignmentView } from "./_components/assignment-view";

export default async function AssignmentPage({ params } : { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const assignment = await api.assignment.get.query({ assignmentId: params.id });
  const testAttemptId = await api.testAttempt.create.mutate({ assignmentId: params.id })

  if (!assignment) redirect(Paths.Home);
  
  return (
    <main className="">
      <AssignmentTutorialModal 
        classroom={assignment.classroom}
        assignmentName={assignment.name}
        timeLimit={assignment.timeLimit}
        numberOfQuestions = {assignment.assignmentTemplate?.questions.length}
      />
      <AssignmentView 
        assignmentName={assignment.name}
        classroom={assignment.classroom}
        timeLimit={assignment.timeLimit}
        assignmentTemplate={assignment.assignmentTemplate}
        testAttemptId={testAttemptId} />
    </main>
  );
};