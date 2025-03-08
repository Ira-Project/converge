import React from 'react';
import { api } from '@/trpc/server';
import { validateRequest } from '@/lib/auth/validate-request';
import { type RouterOutputs } from '@/trpc/shared';
import { Leaderboard } from './_components/leaderboard';
import { ChartNoAxesColumn } from 'lucide-react';
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
      <div className="px-8 mb-32">
        <div className="flex flex-row gap-2">
          <ChartNoAxesColumn className="w-4 h-4 my-auto" />
          <p className="text-lg font-medium">Leaderboard</p>
        </div>
        <Leaderboard data={leaderboard ?? []} />
      </div>
    </div>
  );
};