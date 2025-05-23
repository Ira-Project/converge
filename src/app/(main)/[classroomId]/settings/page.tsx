import { api } from "@/trpc/server";
import { validateRequest } from '@/lib/auth/validate-request';
import { Roles } from '@/lib/constants';
import { redirect } from "next/navigation";
import ClassroomSettingsForm from "./_components/classroom-settings-form";
import StudentsList from "./_components/students-list";
import { ClassroomHeader } from "../_components/classroom-header";

export default async function SettingsPage(props: { params: Promise<{ classroomId: string }> }) {
  const [{ user }, params] = await Promise.all([
    validateRequest(),
    props.params
  ]);

  let classroom, userToClassroom: { role: Roles } | undefined, students;
  
  if (user) {
    [classroom, userToClassroom, students] = await Promise.all([
      api.classroom.get.query({ id: params.classroomId }),
      api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId }),
      api.classroom.students.query({ id: params.classroomId })
    ]);
  }

  // Only teachers can access the settings page
  if (userToClassroom?.role !== Roles.Teacher) {
    redirect(`/${params.classroomId}`);
  }

  const classroomData = {
    name: classroom?.name ?? "",
    description: classroom?.description ?? "",
    year: classroom?.year ?? new Date().getFullYear(),
    showLeaderboardStudents: classroom?.showLeaderboardStudents ?? false,
    showLeaderboardTeachers: classroom?.showLeaderboardTeachers ?? false,
  };

  return (
    <>
      {/* Header */}
      <ClassroomHeader classroom={classroom} />

      <div className="px-8 mt-40 space-y-8">
        <h2 className="text-xl font-semibold">Classroom Settings</h2>
        
        <ClassroomSettingsForm 
          classroom={classroomData}
          classroomId={params.classroomId} 
        />
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Students</h2>
          <StudentsList 
            students={students?.map((student) => ({
              id: student.user.id,
              name: student.user.name ?? "",
              email: student.user.email ?? "",
              avatar: student.user.avatar ?? "",
            })) ?? []} 
            classroomId={params.classroomId} 
          />
        </div>
      </div>
    </>
  );
} 