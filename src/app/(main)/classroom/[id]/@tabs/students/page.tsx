import { api } from "@/trpc/server";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { StudentsList } from "../../_components/student-list";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const students = await api.classroom.students.query({ id: params.id });

  return (
    <div className="max-h-full overflow-hidden mt-[20%]">
      <StudentsList students={students} showJoinedAt={user.role === Roles.Teacher} />
    </div>
  );
}