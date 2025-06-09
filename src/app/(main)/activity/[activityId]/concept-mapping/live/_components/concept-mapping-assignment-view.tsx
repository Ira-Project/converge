'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SubmissionModal from './concept-mapping-submission-modal';
import AssignmentTutorialModal from './concept-mapping-tutorial-modal';
import AssignmentShareModal from './concept-mapping-share-modal'
import { Roles } from "@/lib/constants";
import { Separator } from '@/components/ui/separator';
import ConceptMap from './concept-map';
import { type RouterOutputs } from '@/trpc/shared';
import { type Edge, type Node } from '@xyflow/react';
import FormattedText from '@/components/formatted-text';
import ConfirmationModal from './concept-mapping-confirmation-modal';
import { api } from '@/trpc/react';

interface ConceptMappingAssignmentViewProps {
  assignment?: RouterOutputs['conceptMapping']['getConceptMappingActivity'];
  attemptId?: string;
  activityId: string
  topic: string;
  dueDate?: Date;
  isLive: boolean;
  classroomId: string;
  role: Roles;
}

const ConceptMappingAssignmentView: React.FC<ConceptMappingAssignmentViewProps> = ({ 
  assignment,
  attemptId,
  activityId,
  topic,
  isLive,
  classroomId,
  role,
  dueDate
}) => {

  const submissionMutation = api.conceptMapping.submitAttempt.useMutation();

  // Submission Functions
  const [submissionModalOpen, setSubmissionmodalOpen] = useState(false);

  const submitAssignment = async () => {
    await submissionMutation.mutateAsync({
      attemptId: attemptId ?? "",
    });
    setSubmissionmodalOpen(true);
  }

  const dueDatePassed = dueDate && new Date() > new Date(dueDate);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="w-full border-b border-slate-200 bg-white">
        <div className="px-4 sm:px-8 py-4 sm:py-3">
          {/* Mobile: 2x2 Grid Layout */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:hidden">
            {/* Row 1, Col 1: Concept Mapping Title */}
            <div className="flex items-center">
              <h1 className="text-base font-semibold text-fuchsia-700 whitespace-nowrap">
                Concept Mapping
              </h1>
            </div>
            
            {/* Row 1, Col 2: Action Button */}
            <div className="flex justify-end">
              { role !== Roles.Teacher ? (
                // Student: Submit button (if not past due)
                !dueDatePassed && (
                  <ConfirmationModal 
                    onSubmit={submitAssignment} 
                    loading={submissionMutation.isLoading}
                    />
                )
              ) : (
                // Teacher: Share button
                <AssignmentShareModal 
                  activityId={activityId ?? ""}
                  isLive={isLive} />
              )}
            </div>
            
            {/* Row 2, Col 1: Topic + Status Badge */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-700 truncate">
                {topic}
              </p>
              {dueDatePassed && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium">
                  PAST DUE
                </span>
              )}
            </div>
            
            {/* Row 2, Col 2: Tutorial Modal */}
            <div className="flex justify-end">
              {attemptId && (
                <AssignmentTutorialModal 
                  topic={topic}
                  classroomId={classroomId}
                  isMobileLayout={true} />
              )}
            </div>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left section - Main info */}
            <div className="flex flex-row items-center gap-4 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-fuchsia-700 whitespace-nowrap">
                  Concept Mapping
                </h1>
                {dueDatePassed && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium">
                    PAST DUE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Separator orientation="vertical" className="h-4 w-px" />
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium text-slate-700 truncate">
                    {topic}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right section - Actions */}
            <div className="flex flex-row justify-end gap-3 flex-shrink-0">
              { role !== Roles.Teacher ?
                <>
                  {attemptId && (
                    <AssignmentTutorialModal 
                      topic={topic}
                      classroomId={classroomId}
                      isMobileLayout={false} />
                  )}
                  {!dueDatePassed && (
                    <ConfirmationModal 
                      onSubmit={submitAssignment} 
                      loading={submissionMutation.isLoading}
                      />
                  )}
                </>
                : 
                <>
                  {attemptId && (
                    <AssignmentTutorialModal 
                      topic={topic}
                      classroomId={classroomId}
                      isMobileLayout={false} />
                  )}
                  <AssignmentShareModal 
                    activityId={activityId ?? ""}
                    isLive={isLive} />
                </>
              }
            </div>
          </div>
        </div>
      </div>
      <SubmissionModal open={submissionModalOpen} />
      <div className="w-full mx-auto bg-fuchsia-50 min-h-[calc(100vh-48px)] md:min-h-[calc(100vh-48px)]">
        <Card className="m-4 md:m-8 px-4 md:px-12 py-4 md:py-8">
          <CardContent className="flex flex-col gap-4 md:gap-8">
            <div className="text-base md:text-lg text-center px-2">
              <FormattedText text={assignment?.topText ?? ""} />
            </div>
            <ConceptMap 
              attemptId={attemptId ?? ""}
              assignmentId={assignment?.id ?? ""}
              initialNodes={assignment?.nodes as unknown as Node[] ?? []}
              initialEdges={assignment?.edges as unknown as Edge[] ?? []}
              availableNodeLabels={assignment?.nodeLabels ?? []}
              availableEdgeLabels={assignment?.edgeLabels ?? []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConceptMappingAssignmentView;