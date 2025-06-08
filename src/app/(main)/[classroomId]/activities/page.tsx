import { api } from "@/trpc/server";
import { UploadLessonPlanForm } from './_components/upload-lesson-plan-form';
import Image from "next/image";
import { validateRequest } from '@/lib/auth/validate-request';
import { ComponentIds, Roles } from '@/lib/constants';
import TopicList from './_components/topic-list';
import { ClassroomHeader } from '../_components/classroom-header';
import { NoAccessEmptyState } from '@/components/no-access-empty-state';

export default async function ClassroomPage(props: { params: Promise<{ classroomId: string }> }) {
  const [{ user }, params] = await Promise.all([
    validateRequest(),
    props.params
  ]);

  let classroom, topics, userToClassroom: { role: Roles; isDeleted?: boolean } | undefined;
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
        <TopicList 
          topics={topics ?? []} 
          role={userToClassroom?.role ?? Roles.Student} 
          classroomId={params.classroomId}
        />
      </div>
    </>
  );
}