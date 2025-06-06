'use client';

import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import AssignmentCard from './assignment-card';
import { Roles } from '@/lib/constants';
import type { AssignmentTopic } from '../types';

interface AssignmentTopicSectionProps {
  topic: AssignmentTopic;
  role: Roles;
  classroomId: string;
}

const AssignmentTopicSection: React.FC<AssignmentTopicSectionProps> = ({ topic, role, classroomId }) => {
  const { name, description, assignments, slug } = topic;

  return (
    <>
      {assignments.length > 0 && (
        <div className="mb-8 px-4 w-full max-w-screen-lg mx-auto" id={slug}>
          <h2 className="text-xl font-semibold mb-2">{name}</h2>
          <p className="text-muted-foreground mb-6">{description}</p>
          <h3 className="text-lg font-medium mb-4">Assignments</h3>
          <ScrollArea className="w-full">
            <div className="flex flex-row gap-4 w-full">
              {assignments.map((assignment, index) => (
                <AssignmentCard key={index} assignment={assignment} role={role} classroomId={classroomId} />
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

export default AssignmentTopicSection; 