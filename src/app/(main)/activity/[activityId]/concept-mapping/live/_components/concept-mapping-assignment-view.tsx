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
              {attemptId &&
                <AssignmentTutorialModal 
                  topic={topic}
                  classroomId={classroomId} />
              }
              <ConfirmationModal 
                onSubmit={submitAssignment} 
                loading={submissionMutation.isLoading}
                dueDatePassed={dueDatePassed}
                />
            </>
            : 
            <>
              {attemptId &&
                <AssignmentTutorialModal 
                  topic={topic}
                  classroomId={classroomId} />
              }
              <AssignmentShareModal 
                activityId={activityId ?? ""}
                isLive={isLive} />
            </>
          }
        </div>
      </div>
      <div className="w-full mx-auto bg-fuchsia-50 min-h-[calc(100vh-48px)]">
        <Card className="m-8 px-12 py-8">
          <CardContent className="flex flex-col gap-8">
            <div className="text-lg text-center">
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