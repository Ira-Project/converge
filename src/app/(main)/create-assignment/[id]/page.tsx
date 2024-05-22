import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { CreateAssignmentAside } from "./_components/create-assignment-aside";
import { api } from "@/trpc/server";
import { AssignmentPreview } from "./_components/assignment-preview";

 export default async function CreateAssignment({ params } : { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user || user.role !== Roles.Teacher) redirect(Paths.Login);

  const assignmentTemplate = await api.assignmentTemplate.get.query({ id: params.id });
  
  return (
    <>
      <CreateAssignmentAside id={params.id} />
      <div className="ml-96 pl-16 pr-8 h-[calc(100vh-108px)] overflow-y-hidden flex flex-col gap-4">
        <div className="pr-8 flex flex-col gap-4">
          <p className="text-3xl font-semibold"> {assignmentTemplate.name} Preview </p>
          <p>This is a preview. Your students will see a version of this view along with the concept graph. </p>
        </div>
        <AssignmentPreview assignmentTemplate={assignmentTemplate} />
      </div>
    </>
  );
};