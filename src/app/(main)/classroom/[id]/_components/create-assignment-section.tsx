import { api } from "@/trpc/server";
import { CreateAssignmentForm } from "./create-assignment-form";

export const CreateAssignmentSection = async () => {

  const assignmentTemplates = await api.assignmentTemplate.list.query();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold">Create Assignment</p>
      <p className="text-sm"> You will be able to customise the due date, maximum score and time limit in the next screen.</p>
      <CreateAssignmentForm assignmentTemplates={assignmentTemplates} />
    </div>
  );
}