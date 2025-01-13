import React from 'react';
import ActivityCard from './activity-card';
import { type Topic } from '../types';
import { Roles } from '@/lib/constants';

interface TopicSectionProps {
  topic: Topic;
  role: Roles;
}

const TopicSection: React.FC<TopicSectionProps> = ({ topic, role }) => {
  const { name, description, activities, slug } = topic;
  let filteredActivities = activities ;

  if(role === Roles.Student) {
    filteredActivities = activities.filter(activity => activity.isLive);
  }

  return (
    <div className="mb-8 px-4" id={slug}>
      <h2 className="text-xl font-semibold mb-2">{name}</h2>
      <p className="text-muted-foreground mb-6">{description}</p>
      
      <h3 className="text-lg font-medium mb-4">Activities</h3>
      <div className="flex flex-row gap-4">
        {filteredActivities.map((activity, index) => (
          <ActivityCard key={index} activity={activity} role={role} />
        ))}
      </div>
    </div>
  );
};

export default TopicSection;