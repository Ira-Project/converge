import React from 'react';
import { ActivityWikiCard } from './_components/activity-wiki-card';
import { ActivityType } from '@/lib/constants';

const LearningActivitiesPage: React.FC = () => {

  const activities = Object.values(ActivityType).map((type) => ({
    type,
    id: type,
  }));

  return (
    <div className="mx-auto p-8">
      <div className="flex flex-col gap-4 mb-12">
        <h1 className="text-3xl text-iraPink">About the Ira Project</h1>
        <p className="text-lg">
          At the Ira project we want to change the way learning happens. For too long we've been
          relying on the traditional methods of consuming content passively and answering
          questions or solving problems. Learning sciences have shown as the path forward, but
          the tools out there for teachers and students haven't kept up with the advancements.
        </p>
        <p className="text-lg">
          Below are a description of the learning activities we offer as well as those we're still
          working on creating. We've included the rationale behind the activities, the skills we
          believe the activities are building as well as the science behind the activities complete
          with citations.
        </p>
        <p className="text-iraPink font-semibold">
          Scroll to Explore ↓
        </p>
      </div>

      {activities.map(activity => (
        <div key={activity.id}>
          <ActivityWikiCard type={activity.type} />
        </div>
      ))}
    </div>
  );
};

export default LearningActivitiesPage;