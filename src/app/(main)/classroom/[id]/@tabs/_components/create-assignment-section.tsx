import { api } from "@/trpc/server";
import { CreateAssignmentForm } from "./create-assignment-form";
import { UploadLessonPlanForm } from "./upload-lesson-plan-form";

export const CreateAssignmentSection = async () => {

  const assignmentTemplates = await api.assignmentTemplate.list.query();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xl font-semibold">Create Assignment</p>
        <p className="text-sm"> 
          You will be able to customise the due date, maximum score and time limit in the next screen.
        </p>
        <CreateAssignmentForm assignmentTemplates={assignmentTemplates} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xl font-semibold">Don't See Your Topic?</p>
        <p className="text-sm"> 
          Upload your lesson plan or curriculum. We will create an assignment for you in the next 24 hours. 
        </p>
        <UploadLessonPlanForm />
      </div>
    </div>
  );
}