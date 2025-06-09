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
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function ClassroomPage(props: { params: Promise<{ classroomId: string }> }) {
  const [{ user }, params] = await Promise.all([
    validateRequest(),
    props.params
  ]);

  let submissions, classroom, activities, randomActivities, userToClassroom: { role: Roles; isDeleted?: boolean } | undefined;
  if (user) {
    [submissions, classroom, activities, randomActivities, userToClassroom] = await Promise.all([
      api.analytics.getSubmissions.query({ classroomId: params.classroomId }),
      api.classroom.get.query({ id: params.classroomId }),
      api.activities.getLiveActivities.query({ classroomId: params.classroomId }),
      api.activities.getRandomActivities.query({ classroomId: params.classroomId }),
      api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId })
    ]);
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }
  
  return (
    <>
      {/* Header */}
      <ClassroomHeader classroom={classroom} />

      <div className="flex flex-col gap-y-6 md:gap-y-8 mb-8 md:mb-16 mt-32 md:mt-48">

        {/* Welcome Message */}
        <p className="px-4 md:px-8 text-xl md:text-2xl">
          👋 Hey {user?.name?.split(" ")[0]}!
        </p>

        {/* Revision Section */}
        <RevisionSection classroomId={params.classroomId} />

        {/* Live Activities and Recent Submissions */}
        <div className="px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 md:gap-8 lg:gap-16">
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
        {/* {
          userToClassroom?.role === Roles.Teacher && (
            <ActivityLibrarySample 
              classroomId={params.classroomId}
              activities={randomActivities ?? []} 
              role={userToClassroom?.role ?? Roles.Student} 
            />
          )
        } */}

        {/* Upload Lesson Plan */}
        {userToClassroom?.role === Roles.Teacher && (
          <div className="md:mx-8 bg-gray-50 rounded-lg items-center max-w-4xl w-full mx-auto" id={ComponentIds.CreateAssignment}>
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 items-center p-4 md:p-6 lg:p-8">
              <div className="hidden md:block w-32 md:w-48 lg:w-64 opacity-50 flex-shrink-0">
                <Image 
                  src="/images/logo.png" 
                  alt="Lesson Plan" 
                  width={256} 
                  height={256}
                  className="w-full h-auto"
                />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-lg md:text-xl mb-2">Don't see what you're looking for?</h2>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
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