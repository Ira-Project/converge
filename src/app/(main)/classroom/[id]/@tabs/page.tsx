import { api } from "@/trpc/server";
import { AssignmentList } from "../_components/assignment-list";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const explainAssignments = await api.explanationAssignment.list.query({ classroomId: params.id });

  return (
    <div className="max-h-full overflow-hidden mt-[20%]">
      <AssignmentList assignments={explainAssignments} role={user.role} />
    </div>
  );
}