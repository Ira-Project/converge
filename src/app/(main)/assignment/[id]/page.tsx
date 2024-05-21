import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import AssignmentTutorialModal from "./_components/assignment-tutorial-modal";
import { api } from "@/trpc/server";

export default async function AssignmentPage({ params } : { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const assignment = await api.assignment.get.query({ assignmentId: params.id });

  if (!assignment) redirect(Paths.Home);
  
  return (
    <>
      <div className="flex flex-row pt-8 gap-8 h-full">
        <h1> Hello World </h1>
        <AssignmentTutorialModal 
          classroom={assignment.classroom}
          assignmentName={assignment.name}
          timeLimit={assignment.timeLimit}
          numberOfQuestions = {assignment.assignmentTemplate?.questions.length}
        />
      </div>
    </>
  );
};