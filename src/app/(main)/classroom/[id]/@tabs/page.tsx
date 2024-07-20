import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { CreateAssignmentSection } from "./_components/create-assignment-section";
import { TeacherList } from "./_components/teacher-list";
import { AssignmentList } from "./_components/assignment-list";

export default async function ClassroomPage({ params } : { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);
  
  return (
    <>
      <div className="flex flex-row pt-8 gap-8 h-full">
        <div className="w-2/3">
          <AssignmentList id={params.id} />
        </div>
        <div className="w-1/3">
          {
            user.role === Roles.Teacher && <CreateAssignmentSection />
          }
          {
            user.role === Roles.Student && <TeacherList id={params.id} showJoinedAt={false} />
          }
        </div>
      </div>
    </>
  );
};