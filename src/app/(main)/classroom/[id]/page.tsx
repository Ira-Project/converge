import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import PageContainer from "./_components/page-container";

export default async function ClassroomPage({ params } : { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const classroom = await api.classroom.get.query({ id: params.id });

  if(!classroom) redirect(Paths.Home);

  const assignments = await api.assignment.list.query({ classroomId: params.id });
  const students = await api.classroom.students.query({ id: params.id });
  
  return (
    <PageContainer 
      code={classroom.code}
      role={user.role}
      classroom={classroom}
      assignments={assignments}
      students={students}
    />
  );
};