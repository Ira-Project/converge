import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { ReadAndRelayAssignmentView } from "./_components/read-and-relay-view";

export default async function AssignmentPage(props: { params: Promise<{ activityId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();

  let activity, userToClassroom, assignment, attemptId;

  if(user?.isOnboarded) {
    activity = await api.activities.getActivity.query({ activityId: params.activityId });
    assignment = await api.readAndRelay.getReadAndRelayActivity.query({ activityId: params.activityId });
    attemptId = await api.readAndRelay.createAttempt.mutate({ activityId: params.activityId });

    if(activity?.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: activity?.classroomId });
    }

    if (!assignment || !activity) redirect(`${Paths.Classroom}${user.classroomId}`);
  }
  

  return (
    <main>
      <ReadAndRelayAssignmentView 
        activityId={params.activityId}
        readingPassage={assignment?.readingPassage ?? ""}
        role={userToClassroom?.role ?? Roles.Student}
        topic={activity?.topic?.name ?? ""}
        questions={assignment?.questionsToAssignment.map(q => q.question) ?? []}
        classroom={activity?.classroom}
        assignmentId={assignment?.id ?? ""}
        isLive={activity?.isLive ?? false}
        dueDate={activity?.dueDate ?? undefined}
        attemptId={attemptId ?? ""} />
    </main>
  );
};