import React from 'react';
import { api } from '@/trpc/server';
import { validateRequest } from '@/lib/auth/validate-request';
import { type RouterOutputs } from '@/trpc/shared';
import { SkillsRadarCard } from './_components/radarChart';
import MonthlySubmissionsChart from './_components/submissionChart';
import RecentSubmissionsList from './_components/submissionsList';
import TopicBreakdownChart from './_components/topicBreakdown';

export default async function AnalyticsPage(props: { params: { classroomId: string } }) {

  const [{ user }, params] = await Promise.all([
    validateRequest(),
    props.params
  ]); 

  let classroom: RouterOutputs["classroom"]["get"] | undefined;
  let submissions: RouterOutputs["analytics"]["getSubmissions"] | undefined;

  if (user) {
    [classroom, submissions] = await Promise.all([
      api.classroom.get.query({ id: params.classroomId }),  
      api.analytics.getSubmissions.query({ classroomId: params.classroomId })
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

      {/* Leaderboard Content */}
      <div className="px-8 mb-8">
        <div className="flex flex-row gap-2 mb-4">
          <p className="text-lg font-medium">Skills</p>
        </div>
        {submissions && <SkillsRadarCard submissions={submissions} />}
      </div>

      {/* Submissions Content */}
      <div className="px-8 mb-8">
        <div className="flex flex-row gap-2 mb-4">
          <p className="text-lg font-medium">Engagement</p>
        </div>
        <div className="flex flex-row gap-4">
          <div className="w-3/5 h-[400px]">
            {submissions && <MonthlySubmissionsChart submissions={submissions} />}
          </div>
          <div className="w-2/5 h-[400px]">
            {submissions && <RecentSubmissionsList submissions={submissions} />}
          </div>
        </div>
      </div>


      {/* Leaderboard Content */}
      <div className="px-8 mb-8">
        <div className="flex flex-row gap-2 mb-4">
          <p className="text-lg font-medium">Topic Breakdown</p>
        </div>
        {submissions && <TopicBreakdownChart submissions={submissions} />}
      </div>
    </div>
  );
};