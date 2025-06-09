import React from 'react';
import ActivityCard from './activity-card';
import { type Activity, } from '../../types';
import { Paths, Roles } from '@/lib/constants';
import Link from 'next/link';

interface ActivityLibrarySampleProps {
  activities: Activity[];
  role: Roles;
  classroomId: string;
}

const ActivityLibrarySample: React.FC<ActivityLibrarySampleProps> = ({ activities, role, classroomId }) => {
  
  return (
    <div className="max-w-full min-h-[300px] px-2 md:px-8">
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold mb-4">
          Sample Activities
        </p>
        <Link href={`${Paths.Classroom}${classroomId}/${Paths.Activities}`} className="text-sm text-gray-500 underline">
          See All
        </Link>
      </div>
      {activities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {activities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} role={role} />
          ))}
        </div>
      )}
      {activities.length === 0 && role === Roles.Student && (
        <div className="flex items-center justify-center h-3/4">
          <p className="text-muted-foreground">All activities from the library have been assigned</p> 
        </div>
      )}
    </div>
  );
};

export default ActivityLibrarySample;