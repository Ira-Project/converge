import { api } from "@/trpc/server";
import { UploadLessonPlanForm } from './_components/upload-lesson-plan-form';
import Image from "next/image";
import { validateRequest } from '@/lib/auth/validate-request';
import { ComponentIds, Roles } from '@/lib/constants';
import RevisionSection from "./_components/revision-section";
import LiveActivitiesList from "./_components/live-activities-list";
export default async function ClassroomPage(props: { params: Promise<{ classroomId: string }> }) {
  const [{ user }, params] = await Promise.all([
    validateRequest(),
    props.params
  ]);

  let classroom, activities, userToClassroom: { role: Roles } | undefined;
  if (user) {
    [classroom, activities, userToClassroom] = await Promise.all([
      api.classroom.get.query({ id: params.classroomId }),
      api.activities.getLiveActivities.query({ classroomId: params.classroomId }),
      api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId })
    ]);
  }
  
  // const role = userToClassroom?.role;
  const role = Roles.Student;
  
  return (
    <>
      {/* Header */}
      <div 
        className="mb-8 h-32 fixed top-0 z-[5] w-full p-8 text-white"
        style={{ backgroundImage: `url('/images/cover.png')` }}
      >
        <h1 className="text-2xl font-semibold mb-1 mt-4">{classroom?.name}</h1>
        {classroom?.course && (
          <p className="text-sm">{classroom?.course?.subject?.name} | {classroom?.course?.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-y-8">

        {/* Welcome Message */}
        <p className="px-8 text-2xl mt-40">
          👋 Hey {user?.name?.split(" ")[0]}!
        </p>

        {/* Revision Section */}
        {
          role === Roles.Student && (
            <RevisionSection classroomId={params.classroomId} />
          )
        }

        {/* Live Activities */}
        <div className="px-8 grid grid-cols-[2fr_1fr] gap-8">
          <LiveActivitiesList 
            classroomId={params.classroomId}
            activities={activities ?? []} 
            role={role ?? Roles.Student} 
          />
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold">
              Submission List
            </h2>
          </div>
        </div>

        {/* Upload Lesson Plan */}
        {userToClassroom?.role === Roles.Teacher && (
          <div className="m-16 bg-gray-50 rounded-lg items-center max-w-screen-lg w-4/5 mx-auto" id={ComponentIds.CreateAssignment}>
            <div className="mx-auto flex gap-8 items-center p-8">
              <div className="hidden lg:block w-64 opacity-50">
              <Image src="/images/logo.png" alt="Lesson Plan" width={256} height={256} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl mb-2">Don't see what you're looking for?</h2>
              <p className="text-muted-foreground mb-4">
                Fill out the form below to generate an activity for your students.
              </p>
              <UploadLessonPlanForm />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}