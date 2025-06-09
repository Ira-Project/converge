import React from 'react';
import ActivityCard from './activity-card';
import { type Activity, } from '../../types';
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
    <div className="overflow-x-auto max-w-full min-h-[250px] md:min-h-[300px]">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <p className="text-lg md:text-xl font-bold">
          {role === Roles.Student ? "Assigned to You" : "Activities You Assigned"}
        </p>
        <Link href={`${Paths.Classroom}${classroomId}/${Paths.Activities}`} className="text-xs md:text-sm text-gray-500 underline">
          See All
        </Link>
      </div>
      {activities.length > 0 && (
        <ScrollArea className="overflow-x-auto">
          <div className="flex flex-row gap-3 md:gap-4 w-full">
            {activities.map((activity, index) => (
              <ActivityCard key={index} activity={activity} role={role} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
      {activities.length === 0 && role === Roles.Student && (
        <div className="flex items-center justify-center h-3/4 px-4">
          <p className="text-muted-foreground text-center text-sm md:text-base">No activities assigned</p> 
        </div>
      )}
      {activities.length === 0 && role === Roles.Teacher && (
        <div className="flex items-center justify-center h-3/4 text-center w-full lg:w-3/4 mx-auto px-4">
          <p className="text-muted-foreground gap-1 text-sm md:text-base">
            <span>You haven't assigned an activity to your students. Choose from our</span>
            <Link href={`${Paths.Classroom}${classroomId}${Paths.ActivityLibrary}`} className="underline mx-1">
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