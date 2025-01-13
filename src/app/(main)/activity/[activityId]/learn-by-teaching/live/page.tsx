import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { AssignmentView } from "./_components/explain-assignment-view";

export default async function AssignmentPage(props: { params: Promise<{ activityId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();

  let activity, userToClassroom, assignment, testAttemptId;

  if(user) {
    activity = await api.activities.getActivity.query({ activityId: params.activityId });
    assignment = await api.learnByTeaching.getLearnByTeachingActivity.query({ activityId: params.activityId });
    testAttemptId = await api.learnByTeaching.create.mutate({ activityId: params.activityId })

    if(activity?.classroomId) {
      userToClassroom = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: activity?.classroomId });
    }

    if (!assignment || !activity) redirect(`${Paths.Classroom}${user.classroomId}`);
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