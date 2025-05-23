import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { AssignmentView } from "./_components/explain-assignment-view";
import { NoAccessEmptyState } from "@/components/no-access-empty-state";

export default async function AssignmentPage(props: { params: Promise<{ activityId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();

  let activity, userToClassroom: { role: Roles; isDeleted?: boolean } | undefined, assignment, testAttemptId;

  if(user?.isOnboarded) {
    activity = await api.activities.getActivity.query({ activityId: params.activityId });
    assignment = await api.learnByTeaching.getLearnByTeachingActivity.query({ activityId: params.activityId });
    testAttemptId = await api.learnByTeaching.create.mutate({ activityId: params.activityId })

    if(activity?.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: activity?.classroomId });
    }

    if (!assignment || !activity) redirect(`${Paths.Classroom}${user.classroomId}`);
  }

  // Show empty state if user has been removed from classroom
  if (userToClassroom?.isDeleted) {
    return <NoAccessEmptyState />;
  }
  

  return (
    <main>
      <AssignmentView 
        activityId={params.activityId}
        role={userToClassroom?.role ?? Roles.Student}
        topic={activity?.topic?.name ?? ""}
        questions={assignment?.questionToAssignment.map(q => q.question) ?? []}
        classroom={activity?.classroom}
        assignmentId={assignment?.id ?? ""}
        isLive={activity?.isLive ?? false}
        dueDate={activity?.dueDate ?? undefined}
        testAttemptId={testAttemptId ?? ""} />
    </main>
  );
};