import { api } from "@/trpc/server";
import { UploadLessonPlanForm } from './_components/upload-lesson-plan-form';
import Image from "next/image";
import { validateRequest } from '@/lib/auth/validate-request';
import { ComponentIds, Roles } from '@/lib/constants';
import RevisionSection from "./_components/revision-section";
import LiveActivitiesList from "./_components/live-activities-list";
import RecentSubmissionsList from "./_components/recent-submissions-table";
import { AnalyticsSection } from "./_components/analytics-section";
import ActivityLibrarySample from "./_components/activity-library-sample";
import { ClassroomHeader } from "./_components/classroom-header";

export default async function ClassroomPage(props: { params: Promise<{ classroomId: string }> }) {
  const [{ user }, params] = await Promise.all([
    validateRequest(),
    props.params
  ]);

  let submissions, classroom, activities, randomActivities, userToClassroom: { role: Roles } | undefined;
  if (user) {
    [submissions, classroom, activities, randomActivities, userToClassroom] = await Promise.all([
      api.analytics.getSubmissions.query({ classroomId: params.classroomId }),
      api.classroom.get.query({ id: params.classroomId }),
      api.activities.getLiveActivities.query({ classroomId: params.classroomId }),
      api.activities.getRandomActivities.query({ classroomId: params.classroomId }),
      api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId })
    ]);
  }
  
  return (
    <>
      {/* Header */}
      <ClassroomHeader classroom={classroom} />

      <div className="flex flex-col gap-y-8 mb-16">

        {/* Welcome Message */}
        <p className="px-8 text-2xl mt-40">
          👋 Hey {user?.name?.split(" ")[0]}!
        </p>

        {/* Revision Section */}
        <RevisionSection classroomId={params.classroomId} />

        {/* Live Activities */}
        <div className="px-8 grid grid-cols-[2fr_1fr] gap-16">
          <LiveActivitiesList 
            classroomId={params.classroomId}
            activities={activities ?? []} 
            role={userToClassroom?.role ?? Roles.Student} 
          />
          <RecentSubmissionsList 
            submissions={submissions ?? []} />
        </div>

        {/* Analytics Section */}
        {
          userToClassroom && (
            <AnalyticsSection classroomId={params.classroomId} />
          )
        }


        {/* Random Activities */}
        {
          userToClassroom?.role === Roles.Teacher && (
            <ActivityLibrarySample 
              classroomId={params.classroomId}
              activities={randomActivities ?? []} 
              role={userToClassroom?.role ?? Roles.Student} 
            />
          )
        }

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