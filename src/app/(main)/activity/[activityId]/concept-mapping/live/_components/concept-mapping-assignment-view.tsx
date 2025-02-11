'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SubmissionModal from './reasoning-submission-modal';
import AssignmentTutorialModal from './reason-assignment-tutorial-modal';
import AssignmentShareModal from './reason-assignment-share-modal'
import { Roles } from "@/lib/constants";
import { Separator } from '@/components/ui/separator';
import ConceptMap from './concept-map';
import DraggableStep from './draggable-step';
import DraggableEdgeLabel from './draggable-edge-label';

interface ReasoningAssignmentViewProps {
  activityId: string
  topic: string;
  dueDate?: Date;
  isLive: boolean;
  classroomId: string;
  role: Roles;
}

const ReasoningStepsAssignment: React.FC<ReasoningAssignmentViewProps> = ({ 
  activityId,
  topic,
  isLive,
  classroomId,
  role,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<{ id: string; text: string } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [usedSteps, setUsedSteps] = useState<string[]>([]);

  const handleDragStart = (e: React.DragEvent, option: { id: string; text: string }, index: number | null): void => {
    setIsDragging(true);
    setDraggedItem(option);
    setDraggedIdx(index);
    e.dataTransfer.setData('text/plain', JSON.stringify(option));
  };

  const handleStepUse = (step: string) => {
    setUsedSteps(prev => [...prev, step]);
  };

  const handleStepReturn = (step: string) => {
    setUsedSteps(prev => prev.filter(s => s !== step));
  };

  // Submission Functions
  const [submissionModalOpen, setSubmissionmodalOpen] = useState(false);

  const submitAssignment = async () => {
    // const statuses = questionStates.map(state => state.part);
    // await submissionMutation.mutateAsync({
    //   attemptId: reasoningAttemptId,
    //   statuses: statuses
    // });
    setSubmissionmodalOpen(true);
  }

  const availableSteps = [
    { id: '12', optionText: 'Work' },
    { id: '13', optionText: 'Calorie' },
    { id: '14', optionText: 'Displacement' },
    { id: '15', optionText: 'Gravitational Potential Energy' },
  ];

  const availableEdgeLabels = [
    { id: 'e1', optionText: 'converts to' },
    { id: 'e2', optionText: 'is measured in' },
    { id: 'e3', optionText: 'requires' },
    { id: 'e4', optionText: 'produces' },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="grid grid-cols-2 w-full h-12 border-b-slate-200 border-b pl-8 pr-4">
        <div className="flex flex-row gap-4 flex-start mr-auto h-8 my-auto">
          <p className="text-lg font-semibold my-auto text-fuchsia-700">
            Concept Mapping
          </p>
          <Separator orientation="vertical" className="h-6 w-px my-auto" />
          <p className="text-sm my-auto">
            {topic}
          </p>
        </div>
        <SubmissionModal open={submissionModalOpen} />
        <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
          { role !== Roles.Teacher ?
            <>
              {0 > 0 &&
                <AssignmentTutorialModal 
                  topic={topic}
                  classroomId={classroomId} />
              }
              {/* <ConfirmationModal 
                onSubmit={submitAssignment} 
                loading={submissionMutation.isLoading || (dueDate && new Date() > new Date(dueDate) ? true : false)}
                /> */}
            </>
            : 
            <>
              {/* {reasoningAttemptId.length > 0 &&
                <AssignmentTutorialModal 
                  topic={topic}
                  classroomId={classroomId} />
              } */}
              <AssignmentShareModal 
                activityId={activityId}
                isLive={isLive} />
            </>
          }
        </div>
      </div>
      <div className="w-full mx-auto bg-fuchsia-50">
        <Card className="m-16 px-12 py-8">
          <CardContent className="flex flex-col gap-8">
            <ConceptMap 
              onStepUse={handleStepUse}
              onStepReturn={handleStepReturn}
            />
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <p className="font-semibold text-center">
                  Available Concepts
                </p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-center text-sm">
                  {availableSteps
                    .filter(option => !usedSteps.includes(option.optionText))
                    .map((option) => (
                      <DraggableStep
                        key={option.id}
                        step={option.optionText}
                        onDragStart={(e) => handleDragStart(e, { id: option.id, text: option.optionText }, null)}
                      />
                    ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="font-semibold text-center">
                  Available Relationships
                </p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-center text-sm">
                  {availableEdgeLabels
                    .filter(option => !usedSteps.includes(option.optionText))
                    .map((option) => (
                      <DraggableEdgeLabel
                        key={option.id}
                        label={option.optionText}
                        onDragStart={(e) => handleDragStart(e, { id: option.id, text: option.optionText }, null)}
                      />  
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReasoningStepsAssignment;