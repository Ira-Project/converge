import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { AssignmentView } from "./_components/explain-assignment-view";

export default async function AssignmentPage(props: { params: Promise<{ activityId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const activity = await api.activities.getActivity.query({ activityId: params.activityId });
  const assignment = await api.learnByTeaching.getLearnByTeachingActivity.query({ activityId: params.activityId });
  const testAttemptId = await api.learnByTeaching.create.mutate({ activityId: params.activityId })
  
  if (!assignment || !activity) redirect(`${Paths.Classroom}${user.classroomId}`);

  return (
    <main>
      <AssignmentView 
        activityId={params.activityId}
        role={user.role}
        topic={activity.topic?.name ?? ""}
        questions={assignment.questionToAssignment.map(q => q.question)}
        classroom={activity.classroom}
        assignmentId={assignment.id}
        isLive={activity.isLive}
        dueDate={activity.dueDate ?? undefined}
        testAttemptId={testAttemptId} />
    </main>
  );
};