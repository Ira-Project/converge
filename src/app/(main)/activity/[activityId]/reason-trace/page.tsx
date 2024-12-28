import { validateRequest } from "@/lib/auth/validate-request";
import { type ActivityType, Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@react-email/components";
import AssignmentShareModal from "./live/_components/reason-assignment-share-modal";
import { getMetaDataFromActivityType } from "@/lib/utils/activityUtils";
import UnderstandingGaps from "./_components/question-analytics";
import AnalyticsCards from "./_components/analytics-cards";
import { BarChartIcon, FileTextIcon } from "@/components/icons";
import SubmissionsTable from "./_components/submission-table";

export default async function AssignmentPage(props: { params: Promise<{ activityId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const activity = await api.activities.getActivity.query({ activityId: params.activityId });
  
  if (!activity) redirect(`${Paths.Classroom}${user.classroomId}`);

  const activityMetaData = getMetaDataFromActivityType(activity.type as ActivityType, activity.id);

  return (
    <main className="flex flex-col">
      {/* Header */}
      <div className="mb-8 p-8 bg-rose-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex flex-row gap-4">
            <Image src={activityMetaData.iconImage} alt={activityMetaData.title} width={60} height={60} />
            <div className="flex flex-col my-auto">
              <h1 className="text-2xl font-bold text-rose-700">{activityMetaData.title}</h1>
              <p className="text-rose-700">{activity.topic?.name}</p>
            </div>
          </div>
          <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
            { user.role !== Roles.Teacher ?
              <Link href={`${activityMetaData.url}${Paths.LiveActivity}`}>
                <Button className="bg-rose-700 text-white">
                  Start
                </Button>
              </Link>
              : 
              <div className="flex flex-row gap-2 my-auto">
                <Link href={`${activityMetaData.url}${Paths.LiveActivity}`}>
                  <Button variant="link">
                    Preview
                  </Button>
                </Link>
                <AssignmentShareModal 
                  activityId={activity.id}
                  isLive={activity.isLive} />
              </div>
            }
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{activityMetaData.description}</p>
      </div>

      {/* Analytics */}
      <div className="mb-12 px-8 flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          <BarChartIcon className="w-4 h-4 my-auto" />
          <p className="text-lg font-medium">Activity Analytics</p>
        </div>
        <div className="grid grid-cols-[300px_1fr] gap-4">
          <AnalyticsCards activityId={activity.id} />
          <UnderstandingGaps activityId={activity.id} />
        </div>
      </div>

      {/* Submissions */}
      <div className="mb-8 px-8 flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          <FileTextIcon className="w-4 h-4 my-auto" />
          <p className="text-lg font-medium">Submissions</p>
        </div>
        <SubmissionsTable activityId={activity.id} />
      </div>
    </main>
  );
};