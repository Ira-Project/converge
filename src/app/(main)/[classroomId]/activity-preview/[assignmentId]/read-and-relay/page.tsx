import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { ReadAndRelayPreviewView } from "./_components/read-and-relay-preview-view";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function ReadAndRelayPreviewPage(props: { 
  params: Promise<{ 
    classroomId: string; 
    assignmentId: string; 
  }> 
}) {
  const params = await props.params;
  const { user } = await validateRequest();

  let userToClassroom: { role: Roles; isDeleted?: boolean } | undefined, assignment, attemptId;
  if(user?.isOnboarded) {
    assignment = await api.readAndRelay.getReadAndRelayAssignmentById.query({ assignmentId: params.assignmentId });
    attemptId = await api.readAndRelay.createAttempt.mutate({ 
      activityId: undefined,
      assignmentId: params.assignmentId,
    });
    
    if(params.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId });
    }

    if (!assignment || !attemptId) redirect(`${Paths.Classroom}${params.classroomId}`);
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }

  return (
    <main>
      <ReadAndRelayPreviewView 
        topic={assignment?.topic?.name ?? ""}
        topicId={assignment?.topicId ?? ""}
        readingPassage={assignment?.readingPassage ?? ""}
        maxNumberOfHighlights={assignment?.maxNumberOfHighlights ?? 5}
        maxNumberOfFormulas={assignment?.maxNumberOfFormulas ?? 3}
        maxHighlightLength={assignment?.maxHighlightLength ?? 200}
        maxFormulaLength={assignment?.maxFormulaLength ?? 200}
        questions={assignment?.questionsToAssignment.map(q => q.question) ?? []}
        assignmentId={params.assignmentId}
        assignmentName={assignment?.name ?? ""}
        classroomId={params.classroomId ?? ""}
        attemptId={attemptId ?? ""}
        role={userToClassroom?.role ?? Roles.Teacher}
        />
    </main>
  );
} 