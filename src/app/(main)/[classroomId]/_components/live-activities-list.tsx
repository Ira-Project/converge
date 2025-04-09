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
    <div className="overflow-x-auto max-w-full min-h-[400px]">
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
      {activities.length === 0 && role === Roles.Student && (
        <div className="flex items-center justify-center h-3/4">
          <p className="text-muted-foreground">No activities assigned</p> 
        </div>
      )}
      {activities.length === 0 && role === Roles.Teacher && (
        <div className="flex items-center justify-center h-3/4 text-center w-3/4 mx-auto">
          <p className="text-muted-foreground gap-1">
            <span>You haven’t assigned an activity to your students. Choose from our</span>
            <Link href={`${Paths.Classroom}${classroomId}${Paths.Activities}`} className="underline mx-1">
              activity library
            </Link>
            <span>to get started.</span>
          </p> 
        </div>
      )}

    </div>
  );
};

export default LiveActivitiesList;