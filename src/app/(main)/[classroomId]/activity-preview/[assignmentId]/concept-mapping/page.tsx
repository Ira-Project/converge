import { validateRequest } from "@/lib/auth/validate-request";
import { ActivityType, Roles } from "@/lib/constants";
import { api } from "@/trpc/server";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";
import ConceptMappingPreviewView from "./_components/concept-mapping-preview-view";

export default async function ConceptMappingPreviewPage(props: { 
  params: Promise<{ 
    classroomId: string; 
    assignmentId: string; 
  }> 
}) {
  const params = await props.params;
  const { user } = await validateRequest();

  let assignment, userToClassroom: { role: Roles; isDeleted?: boolean } | undefined;
  let conceptMappingAttemptId: string | null = null;

  if(user?.isOnboarded) {
    assignment = await api.conceptMapping.getConceptMappingAssignmentById.query({ assignmentId: params.assignmentId });
    userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId });

    if(assignment?.id) {
      conceptMappingAttemptId = await api.conceptMapping.createAssignmentAttempt.mutate({ assignmentId: params.assignmentId });
    }
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }

  return (
    <main>
      <ConceptMappingPreviewView 
        assignmentId={params.assignmentId}
        activityType={ActivityType.ConceptMapping}
        activityName={assignment?.name ?? ""}
        topicId={assignment?.topicId ?? ""}
        topic={assignment?.topic?.name ?? ""}
        role={userToClassroom?.role ?? Roles.Teacher}
        classroomId={params.classroomId}
        conceptMappingAssignment={assignment}
        conceptMappingAttemptId={conceptMappingAttemptId ?? ""} 
        />
    </main>
  );
} 