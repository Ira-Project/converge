import { api } from "@/trpc/server";
import { UploadLessonPlanForm } from './_components/upload-lesson-plan-form';
import Image from "next/image";
import { validateRequest } from '@/lib/auth/validate-request';
import { Roles } from '@/lib/constants';
import TopicList from './_components/topic-list';
export default async function ClassroomPage(props: { params: Promise<{ classroomId: string }> }) {
  const [{ user }, params] = await Promise.all([
    validateRequest(),
    props.params
  ]);

  let classroom, topics, userToClassroom: { role: Roles } | undefined;
  if (user) {
    [classroom, topics, userToClassroom] = await Promise.all([
      api.classroom.get.query({ id: params.classroomId }),
      api.activities.getActivities.query({ classroomId: params.classroomId }),
      api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId })
    ]);
  }

  if (userToClassroom?.role === Roles.Student) {
    topics = topics?.filter((topic) => topic.activities.some((a) => a.isLive));
  }
  
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

      {/* Topics */}
      <div className="px-4 mt-40 flex flex-col gap-8 w-full">
        <TopicList 
          topics={topics ?? []} 
          role={userToClassroom?.role ?? Roles.Student} 
          classroomId={params.classroomId}
        />
      </div>

      {/* Upload Lesson Plan */}
      {userToClassroom?.role === Roles.Teacher && (
        <div className="m-16 bg-gray-50 rounded-lg items-center max-w-screen-lg w-4/5 mx-auto" id="create-activity">
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
    </>
  );
}