import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { TeacherList } from "../_components/teacher-list";
import { StudentsList } from "../_components/student-list";
import { InviteStudents } from "../_components/invite-students";

export default async function ClassroomPage({ params } : { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);
  
  return (
    <>
      <div className="flex flex-row pt-8 gap-8 h-full">
        <div className="w-3/4">
          <div className="flex flex-col gap-8">
            <TeacherList id={params.id} showJoinedAt />
            <StudentsList id={params.id} showJoinedAt />
          </div>
        </div>
        <div className="w-1/4">
          <InviteStudents id={params.id} />
        </div>
      </div>
    </>
  );
};