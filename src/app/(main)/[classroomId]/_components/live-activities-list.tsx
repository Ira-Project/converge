import React from 'react';
import ActivityCard from './activity-card';
import { type Activity, } from '../types';
import { Paths, Roles } from '@/lib/constants';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Link from 'next/link';

interface LiveActivitiesListProps {
  activities: Activity[];
  role: Roles;
  classroomId: string;
}

const LiveActivitiesList: React.FC<LiveActivitiesListProps> = ({ activities, role, classroomId }) => {
  
  return (
    <div className="overflow-x-auto max-w-full">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold mb-4">
          {role === Roles.Student ? "Assigned to You" : "Activities You Assigned"}
        </p>
        <Link href={`${Paths.Classroom}${classroomId}/${Paths.Activities}`} className="text-sm text-gray-500 underline">
          See All
        </Link>
      </div>
      {activities.length > 0 && (
        <ScrollArea className="overflow-x-auto">
          <div className="flex flex-row gap-4 w-full">
            {activities.map((activity, index) => (
              <ActivityCard key={index} activity={activity} role={role} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
};

export default LiveActivitiesList;