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
            
            {/* Row 1, Col 2: Assign Activity Button */}
            <div className="flex justify-end">
              { role == Roles.Teacher && (
                <AssignActivityModal 
                  classroomId={classroomId}
                  assignmentId={assignmentId}
                  activityType={activityType}
                  activityName={activityName}
                  topicId={topicId}
                  />
              )}
            </div>
            
            {/* Row 2, Col 1: Topic + Preview Badge */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-700 truncate">
                {topic}
              </p>
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium">
                PREVIEW
              </span>
            </div>
            
            {/* Row 2, Col 2: Tutorial Modal */}
            <div className="flex justify-end">
              { role == Roles.Teacher && (
                <AssignmentTutorialModal
                  topic={topic ?? ""}
                  classroomId={classroomId}
                  isMobileLayout={true}
                  />
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
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium">
                  PREVIEW
                </span>
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
              { role == Roles.Teacher &&
                <>
                  <AssignmentTutorialModal
                    topic={topic ?? ""}
                    classroomId={classroomId}
                    isMobileLayout={false}
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
        </div>
      </div>

      {/* Content - same as live activity */}
      <div className="w-full mx-auto bg-fuchsia-50 min-h-[calc(100vh-48px)] md:min-h-[calc(100vh-48px)]">
        <Card className="m-4 md:m-8 px-4 md:px-12 py-4 md:py-8">
          <CardContent className="flex flex-col gap-4 md:gap-8">
            <div className="text-base md:text-lg text-center px-2">
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