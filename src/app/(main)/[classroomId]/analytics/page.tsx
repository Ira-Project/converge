import React from 'react';
import { api } from '@/trpc/server';
import { validateRequest } from '@/lib/auth/validate-request';
import { type RouterOutputs } from '@/trpc/shared';
import { AnalyticsDashboard } from './_components/AnalyticsDashboard';
import { ClassroomHeader } from '../_components/classroom-header';
import { BarChart3 } from 'lucide-react';

export default async function AnalyticsPage(props: { params: Promise<{ classroomId: string }> }) {

  const [{ user }, params] = await Promise.all([
    validateRequest(),
    props.params
  ]);

  let classroom: RouterOutputs["classroom"]["get"] | undefined;
  let submissions: RouterOutputs["analytics"]["getSubmissions"] | undefined;
  let conceptData: RouterOutputs["analytics"]["getConceptTracking"] | undefined;

  if (user) {
    [classroom, submissions, conceptData] = await Promise.all([
      api.classroom.get.query({ id: params.classroomId }),
      api.analytics.getSubmissions.query({ classroomId: params.classroomId }),
      api.analytics.getConceptTracking.query({ classroomId: params.classroomId })
    ]);
  }

  return (
    <div>
      {/* Header */}
      <ClassroomHeader classroom={classroom} />

      <div className="mt-40">
        {submissions && submissions.length > 0 && conceptData ? (
          <AnalyticsDashboard
            submissions={submissions}
            conceptTracking={conceptData} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
              <div className="mb-4">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Analytics Data Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Once students start submitting assignments, you'll see detailed analytics and insights here.
                Analytics will include submission trends, concept tracking, and performance metrics.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};