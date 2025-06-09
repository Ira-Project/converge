import React from 'react';
import { api } from '@/trpc/server';
import { validateRequest } from '@/lib/auth/validate-request';
import { type RouterOutputs } from '@/trpc/shared';
import { Leaderboard } from './_components/leaderboard';
import { ChartNoAxesColumn } from 'lucide-react';
import { ClassroomHeader } from '../(dashboard)/_components/classroom-header';

export default async function LeaderboardPage(props: { params: Promise<{ classroomId: string }> }) {

  const [{ user }, params] = await Promise.all([
    validateRequest(),
    props.params
  ]); 

  let classroom: RouterOutputs["classroom"]["get"] | undefined;
  let leaderboard: RouterOutputs["leaderboard"]["getLeaderboard"] | undefined;

  if (user) {
    [classroom, leaderboard] = await Promise.all([
      api.classroom.get.query({ id: params.classroomId }),  
      api.leaderboard.getLeaderboard.query({ classroomId: params.classroomId })
    ]);
  }

  return (
    <div>
       {/* Header */}
       <ClassroomHeader classroom={classroom} />

      {/* Leaderboard Content */}
      <div className="px-8 mb-32 mt-40">
        <div className="flex flex-row gap-2">
          <ChartNoAxesColumn className="w-4 h-4 my-auto" />
          <p className="text-lg font-medium">Leaderboard</p>
        </div>
        <Leaderboard data={leaderboard?.rankings ?? []} activityInfo={leaderboard?.activityInfo ?? []} />
      </div>
    </div>
  );
};