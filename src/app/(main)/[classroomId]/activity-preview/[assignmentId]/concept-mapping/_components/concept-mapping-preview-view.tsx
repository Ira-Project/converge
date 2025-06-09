'use client'
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AssignActivityModal } from '@/app/(main)/[classroomId]/activity-preview/[assignmentId]/_components/assign-activity-modal';
import { type RouterOutputs } from '@/trpc/shared';
import { type ActivityType, Roles } from "@/lib/constants";
import { Separator } from '@/components/ui/separator';
import ConceptMap from '@/app/(main)/activity/[activityId]/concept-mapping/live/_components/concept-map';
import { type Edge, type Node } from '@xyflow/react';
import FormattedText from '@/components/formatted-text';
import AssignmentTutorialModal from '@/app/(main)/activity/[activityId]/concept-mapping/live/_components/concept-mapping-tutorial-modal';

interface ConceptMappingPreviewViewProps {
  assignmentId: string;
  conceptMappingAssignment?: RouterOutputs['conceptMapping']['getConceptMappingAssignmentById'];
  conceptMappingAttemptId: string;
  activityType: ActivityType;
  activityName: string;
  topicId: string;
  topic: string;
  classroomId: string;
  role: Roles;
}

const ConceptMappingPreviewView: React.FC<ConceptMappingPreviewViewProps> = ({
  assignmentId,
  conceptMappingAssignment,
  conceptMappingAttemptId,
  activityType,
  activityName,
  topicId,
  topic,
  classroomId,
  role,
}) => {

  return (
    <div className="flex flex-col min-h-full h-full">
      {/* Header */}
      <div className="grid grid-cols-2 w-full h-12 border-b-slate-200 border-b pl-8 pr-4">
        <div className="flex flex-row gap-4 flex-start mr-auto h-8 my-auto">
          <p className="text-lg font-semibold my-auto text-fuchsia-700">
            Concept Mapping
          </p>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded my-auto">PREVIEW</span>
          <Separator orientation="vertical" className="h-6 w-px my-auto" />
          <p className="text-sm my-auto">
            {topic}
          </p>
        </div>
        <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
          { role == Roles.Teacher &&
            <>
              <AssignmentTutorialModal
                topic={topic ?? ""}
                classroomId={classroomId}
                />
              <AssignActivityModal 
                classroomId={classroomId}
                assignmentId={assignmentId}
                activityType={activityType}
                activityName={activityName}
                topicId={topicId}
                />
            </>
          }
        </div>
      </div>      

      {/* Content - same as live activity */}
      <div className="w-full mx-auto bg-fuchsia-50 min-h-[calc(100vh-48px)]">
        <Card className="m-8 px-12 py-8">
          <CardContent className="flex flex-col gap-8">
            <div className="text-lg text-center">
              <FormattedText text={conceptMappingAssignment?.topText ?? ""} />
            </div>
            <ConceptMap 
              attemptId={conceptMappingAttemptId ?? ""}
              assignmentId={conceptMappingAssignment?.id ?? ""}
              initialNodes={conceptMappingAssignment?.nodes as unknown as Node[] ?? []}
              initialEdges={conceptMappingAssignment?.edges as unknown as Edge[] ?? []}
              availableNodeLabels={conceptMappingAssignment?.nodeLabels ?? []}
              availableEdgeLabels={conceptMappingAssignment?.edgeLabels ?? []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConceptMappingPreviewView; 