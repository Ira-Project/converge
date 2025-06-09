import { validateRequest } from "@/lib/auth/validate-request";
import { ActivityType, Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { LearnByTeachingPreviewView } from "./_components/learn-by-teaching-preview-view";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function LearnByTeachingPreviewPage(props: { 
  params: Promise<{ 
    classroomId: string; 
    assignmentId: string; 
  }> 
}) {
  const params = await props.params;
  const { user } = await validateRequest();

  let userToClassroom: { role: Roles; isDeleted?: boolean } | undefined, assignment, testAttemptId;
  if(user?.isOnboarded) {
    assignment = await api.learnByTeaching.getLearnByTeachingAssignmentById.query({ assignmentId: params.assignmentId });
    testAttemptId = await api.learnByTeaching.create.mutate({ 
      activityId: undefined,
      assignmentId: params.assignmentId,
    });
    
    if(params.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId });
    }

    if (!assignment || !testAttemptId) redirect(`${Paths.Classroom}${params.classroomId}`);
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }

  return (
    <main>
      <LearnByTeachingPreviewView 
        topic={assignment?.topic?.name ?? ""}
        topicId={assignment?.topicId ?? ""}
        questions={assignment?.questionToAssignment.map(q => q.question) ?? []}
        assignmentId={params.assignmentId}
        assignmentName={assignment?.name ?? ""}
        classroomId={params.classroomId ?? ""}
        testAttemptId={testAttemptId ?? ""}
        role={userToClassroom?.role ?? Roles.Teacher}
        />
    </main>
  );
} 