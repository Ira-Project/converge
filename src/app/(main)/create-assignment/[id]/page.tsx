import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { CreateAssignmentAside } from "./_components/create-assignment-aside";

 export default async function CreateAssignment({ params } : { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user || user.role !== Roles.Teacher) redirect(Paths.Login);
  
  return (
    <>
      <CreateAssignmentAside id={params.id} />
      <div className="ml-96 w-2/3 px-16">
        <p className="text-3xl font-semibold"> Probability Preview </p>
      </div>
    </>
  );
};