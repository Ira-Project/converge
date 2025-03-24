import React from 'react';
import { api } from '@/trpc/server';
import { validateRequest } from '@/lib/auth/validate-request';
import { type RouterOutputs } from '@/trpc/shared';
import { AnalyticsDashboard } from './_components/AnalyticsDashboard';

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
       <div 
        className="mb-8 h-32 w-full p-8 text-white"
        style={{ backgroundImage: `url('/images/cover.png')` }}
      >
        <h1 className="text-2xl font-semibold mb-1 mt-4">{classroom?.name}</h1>
        {classroom?.course && (
          <p className="text-sm">{classroom?.course?.subject?.name} | {classroom?.course?.name}</p>
        )}
      </div>  

      {submissions && conceptData && 
        <AnalyticsDashboard 
          submissions={submissions} 
          conceptTracking={conceptData} />
      }
    </div>
  );
};