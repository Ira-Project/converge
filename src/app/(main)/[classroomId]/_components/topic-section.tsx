import React from 'react';
import ActivityCard from './activity-card';
import { type Topic } from '../types';
import { Roles } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
interface TopicSectionProps {
  topic: Topic;
  role: Roles;
  classroomId: string;
}

const TopicSection: React.FC<TopicSectionProps> = ({ topic, role, classroomId }) => {
  const { name, description, activities, slug } = topic;
  let filteredActivities = activities ;

  if(role === Roles.Student) {
    filteredActivities = activities.filter(activity => activity.isLive);
  }

  return (
    <>
      {filteredActivities.length > 0 && (
        <div className="mb-8 px-4 w-full" id={slug}>
          <h2 className="text-xl font-semibold mb-2">{name}</h2>
          <p className="text-muted-foreground mb-6">{description}</p>
          <h3 className="text-lg font-medium mb-4">Activities</h3>
          <ScrollArea className="w-full">
            <div className="flex flex-row gap-4 w-full">
              {filteredActivities.map((activity, index) => (
                <ActivityCard key={index} activity={activity} role={role} classroomId={classroomId} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <Separator className="mt-16"/>
        </div>
      )}
    </>
  );
};

export default TopicSection;