import { api } from "@/trpc/server";
import { UploadLessonPlanForm } from '../activities/_components/upload-lesson-plan-form';
import Image from "next/image";
import { validateRequest } from '@/lib/auth/validate-request';
import { ComponentIds, Roles } from '@/lib/constants';
import AssignmentTopicList from './_components/assignment-topic-list';
import { ClassroomHeader } from '../_components/classroom-header';
import { NoAccessEmptyState } from '@/components/no-access-empty-state';

export default async function ActivityLibraryPage(props: { params: Promise<{ classroomId: string }> }) {
  const [{ user }, params] = await Promise.all([
    validateRequest(),
    props.params
  ]);

  let classroom, assignments, userToClassroom: { role: Roles; isDeleted?: boolean } | undefined;
  if (user) {
    [classroom, assignments, userToClassroom] = await Promise.all([
      api.classroom.get.query({ id: params.classroomId }),
      api.assignments.getAssignments.query({ classroomId: params.classroomId }),
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

      {/* Topics */}
      <div className="px-8 mt-40 flex flex-col gap-8 w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">Activity Library</h1>
          <p className="text-muted-foreground">
            Browse and create activities from our assignment library. Teachers can create activities from these assignments for their students.
          </p>
        </div>
        <AssignmentTopicList 
          topics={assignments ?? []} 
          role={userToClassroom?.role ?? Roles.Student} 
          classroomId={params.classroomId}
          classroom={classroom}
        />
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
    </>
  );
} 