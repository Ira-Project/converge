import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import ConceptMappingAssignmentView from "./_components/concept-mapping-assignment-view";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function ActivityPage(props: { params: Promise<{ activityId: string, classroomId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();

  let activity, userToClassroom: { role: Roles; isDeleted?: boolean } | undefined;
  let assignment;
  let activityAttempt;

  if(user?.isOnboarded) {
    activity = await api.activities.getActivity.query({ activityId: params.activityId });
    assignment = await api.conceptMapping.getConceptMappingActivity.query({ activityId: params.activityId });
    activityAttempt = await api.conceptMapping.createAttempt.mutate({ activityId: params.activityId });

    if(activity?.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: activity?.classroomId });
    }

    if (!activity || !assignment || !activityAttempt) redirect(`${Paths.Classroom}${params.classroomId}`);

  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }

  return (
    <main>
      <ConceptMappingAssignmentView 
        activityId={params.activityId}
        attemptId={activityAttempt}
        assignment={assignment} 
        topic={activity?.topic?.name ?? ""}
        isLive={activity?.isLive ?? false}
        classroomId={params.classroomId}
        role={userToClassroom?.role ?? Roles.Student}
        />
    </main>
  );
};