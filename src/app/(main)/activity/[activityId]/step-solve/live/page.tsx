import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import StepSolveActivityView from "./_components/step-solve-activity-view";

export default async function ActivityPage(props: { params: Promise<{ activityId: string, classroomId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const [activity, stepSolveAssignment] = await Promise.all([
    api.activities.getActivity.query({ activityId: params.activityId }),
    api.stepSolve.getAssignment.query({ activityId: params.activityId })
  ]);

  // Create attempt only if we don't have one in the session storage
  const stepSolveAttemptId = await api.stepSolve.createAttempt.mutate({ 
    activityId: params.activityId 
  });

  if (!activity || !stepSolveAssignment || !stepSolveAttemptId) {
    redirect(`${Paths.Classroom}${params.classroomId}`);
  }

  return (
    <main>
      <StepSolveActivityView 
        activityId={params.activityId}
        topic={activity?.topic?.name ?? ""}
        isLive={activity.isLive}
        classroomId={params.classroomId}
        role={user.role}
        stepSolveAssignment={stepSolveAssignment}
        stepSolveAttemptId={stepSolveAttemptId} 
        dueDate={activity.dueDate ?? undefined}
        />
    </main>
  );
};