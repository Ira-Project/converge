'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SubmissionModal from './knowledge-zap-submission-modal';
import AssignmentTutorialModal from './knowledge-zap-assignment-tutorial-modal';
import ConfirmationModal from './knowledge-zap-confirmation-modal';
import AssignmentShareModal from './knowledge-zap-assignment-share-modal'
import { type RouterOutputs } from '@/trpc/shared';
import { KnowledgeZapQuestionType, Roles } from "@/lib/constants";
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/react';
import type { KnowledgeZapQuestionObjects, MatchingVariant, MultipleChoiceVariant, OrderingVariant } from '../types';
import MatchingQuestion from './matching-question';
import { motion, AnimatePresence } from 'framer-motion';
import { LightningBoltIcon } from '@/components/icons';
import MultipleChoiceQuestion from './multiple-choice-question';
import OrderingQuestion from './ordering-question';

interface KnowledgeZapAssignmentViewProps {
  assignmentAttemptId: string;
  knowledgeZapAssignment?: RouterOutputs["knowledgeZap"]["getKnowledgeZapActivity"];
  knowledgeZapAttemptId: string;
  activityId: string
  topic: string;
  dueDate?: Date;
  isLive: boolean;
  classroomId: string;
  role: Roles;
}

const renderQuestion = (
  question: KnowledgeZapQuestionObjects, 
  assignmentAttemptId: string,
  stackPush: () => void, 
  stackPop: () => void
) => {

  const randomVariants = []
  // Get a random variant from the variants array
  if(process.env.ENV === "dev") {
    randomVariants.push(...question.variants);
  } else {
    randomVariants.push(question.variants[Math.floor(Math.random() * question.variants.length)]);
  }

  if (!randomVariants.length) {
    return
  }

  for(const randomVariant of randomVariants) {
    switch (question.type) {

      case KnowledgeZapQuestionType.MATCHING:
      const matchingVariant = randomVariant as MatchingVariant;
      return (
        <MatchingQuestion
          assignmentAttemptId={assignmentAttemptId}
          matchingQuestionId={matchingVariant.id}
          questionId={question.id}
          question={matchingVariant.question}
          optionsA={matchingVariant.optionAs}
          optionsB={matchingVariant.optionBs}
          imageUrl={matchingVariant.imageUrl}
          stackPush={stackPush}
          stackPop={stackPop}
        />
      );
    case KnowledgeZapQuestionType.MULTIPLE_CHOICE:
      const multipleChoiceVariant = randomVariant as MultipleChoiceVariant;
      return (
        <MultipleChoiceQuestion
          assignmentAttemptId={assignmentAttemptId}
          multipleChoiceQuestionId={multipleChoiceVariant.id}
          questionId={question.id}
          question={multipleChoiceVariant.question}
          options={multipleChoiceVariant.options}
          imageUrl={multipleChoiceVariant.imageUrl}
          stackPush={stackPush}
          stackPop={stackPop}
        />
      );
    case KnowledgeZapQuestionType.ORDERING:
      const orderingVariant = randomVariant as OrderingVariant;
      return (
        <OrderingQuestion
          topLabel={orderingVariant.topLabel}
          bottomLabel={orderingVariant.bottomLabel}
          isDescending={orderingVariant.isDescending}
          assignmentAttemptId={assignmentAttemptId}
          orderingQuestionId={orderingVariant.id}
          questionId={question.id}
          question={orderingVariant.question}
          options={orderingVariant.options}
          stackPush={stackPush}
          stackPop={stackPop}
        />
      );
    }
  }
};


const KnowledgeZapAssignment: React.FC<KnowledgeZapAssignmentViewProps> = ({ 
  assignmentAttemptId,
  knowledgeZapAssignment,
  knowledgeZapAttemptId,
  activityId,
  topic,
  dueDate,
  isLive,
  classroomId,
  role,
}: KnowledgeZapAssignmentViewProps) => {

  const [questionStack, setQuestionStack] = useState<KnowledgeZapQuestionObjects[]>(
    knowledgeZapAssignment?.questions ?? []
  );

  const stackPush = () => {
    setQuestionStack(prevStack => {
      if (prevStack.length === 0) return prevStack;
      const [firstItem, ...rest] = prevStack;
      return [...rest, firstItem] as KnowledgeZapQuestionObjects[];
    });
  }

  const stackPop = () => {
    setQuestionStack(prevStack => {
      return prevStack.slice(1);
    });
  }

  // Submission Functions
  const submissionMutation = api.knowledgeZap.submitAssignmentAttempt.useMutation();
  const [submissionModalOpen, setSubmissionmodalOpen] = useState(false);
  const submitAssignment = async () => {
    await submissionMutation.mutateAsync({
      assignmentAttemptId: knowledgeZapAttemptId,
      assignmentId: knowledgeZapAssignment?.id ?? "",
    });
    setSubmissionmodalOpen(true);
  }

  return (
    <div className="flex flex-col min-h-full h-full">
      {/* Header */}
      <div className="grid grid-cols-2 w-full h-12 border-b-slate-200 border-b pl-8 pr-4">
        <div className="flex flex-row gap-4 flex-start mr-auto h-8 my-auto">
          <p className="text-lg font-semibold my-auto text-lime-700">
            Knowledge Zap
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
              {knowledgeZapAttemptId.length > 0 && <AssignmentTutorialModal 
                topic={topic}
                classroomId={classroomId} />}
              <ConfirmationModal 
                onSubmit={submitAssignment} 
                loading={submissionMutation.isLoading || (dueDate && new Date() > new Date(dueDate) ? true : false)}
                />
            </>
            : 
            <>
              {knowledgeZapAttemptId.length > 0 && <AssignmentTutorialModal 
                topic={topic}
                classroomId={classroomId} />}
              <AssignmentShareModal 
                activityId={activityId}
                isLive={isLive} />
            </>
          }
        </div>
      </div>      
      <div className="w-full mx-auto bg-lime-50 min-h-[calc(100vh-48px)]">
        <div className="m-16">
          <div className="flex flex-row gap-2 w-full justify-center mx-auto my-4">
            <AnimatePresence mode="popLayout">
              {questionStack.map((question) => (
                <motion.div
                  key={question.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  layout
                >
                  <LightningBoltIcon className="text-lime-700 h-8 w-8"/>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <Card className="px-12 py-12">
            <CardContent className="flex flex-col gap-8">
              {questionStack.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {questionStack[0] && renderQuestion(questionStack[0], assignmentAttemptId, stackPush, stackPop)}
                </div>
              ) : (
                <div className="flex flex-col gap-4 px-16 py-32">
                  <p className="text-center text-2xl">
                    Congratulations! You have completed the activity. <br /> 
                    Make sure hit the submit button to record your score.
                  </p>                  
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeZapAssignment;