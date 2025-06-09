'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AssignmentTutorialModal from './knowledge-zap-assignment-tutorial-modal';
import { type RouterOutputs } from '@/trpc/shared';
import { Separator } from '@/components/ui/separator';
import type { KnowledgeZapQuestionObjects, MatchingVariant, MultipleChoiceVariant, OrderingVariant } from '../../types';
import MatchingQuestion from './matching-question';
import { motion, AnimatePresence } from 'framer-motion';
import { LightningBoltIcon } from '@/components/icons';
import MultipleChoiceQuestion from './multiple-choice-question';
import OrderingQuestion from './ordering-question';
import { KnowledgeZapQuestionType } from '@/lib/constants';

interface KnowledgeZapAssignmentViewProps {
  assignmentAttemptId: string;
  knowledgeZapAssignment?: RouterOutputs["knowledgeZap"]["getKnowledgeZapRevisionActivity"];
  knowledgeZapAttemptId: string;
  classroomId: string;
}

const renderQuestion = (
  question: KnowledgeZapQuestionObjects, 
  assignmentAttemptId: string,
  stackPush: () => void, 
  stackPop: () => void,
  classroomId: string
) => {

  const randomVariants = []
  // Get a random variant from the variants array
  if(process.env.NEXT_PUBLIC_ENVIRONMENT === "dev") {
    randomVariants.push(...question.variants);
  } else {
    randomVariants.push(question.variants[Math.floor(Math.random() * question.variants.length)]);
  }

  if (!randomVariants.length) {
    return
  }

    switch (question.type) {    
      case KnowledgeZapQuestionType.MATCHING:
      return (
        <div className="flex flex-col gap-4">
          {
            randomVariants.map((randomVariant) => {
              const matchingVariant = randomVariant as MatchingVariant;
              return (
                <MatchingQuestion
                  key={matchingVariant.id}
                  assignmentAttemptId={assignmentAttemptId}
                  matchingQuestionId={matchingVariant.id}
                  questionId={question.id}
                  question={matchingVariant.question}
                  optionsA={matchingVariant.optionAs}
                  optionsB={matchingVariant.optionBs}
                  imageUrl={matchingVariant.imageUrl}
                  stackPush={stackPush}
                  stackPop={stackPop}
                  classroomId={classroomId}
                />
              );
            })
          }
        </div>
      );
    case KnowledgeZapQuestionType.MULTIPLE_CHOICE:
      return (
        <div className="flex flex-col gap-4">
          {
            randomVariants.map((randomVariant) => {
              const multipleChoiceVariant = randomVariant as MultipleChoiceVariant;
              return (
                <MultipleChoiceQuestion
                  key={multipleChoiceVariant.id}
                  assignmentAttemptId={assignmentAttemptId}
                  multipleChoiceQuestionId={multipleChoiceVariant.id}
                  questionId={question.id}
                  question={multipleChoiceVariant.question}
                  options={multipleChoiceVariant.options}
                  imageUrl={multipleChoiceVariant.imageUrl}
                  stackPush={stackPush}
                  stackPop={stackPop}
                  classroomId={classroomId}
                />
              );
            })
          }
        </div>
      );
    case KnowledgeZapQuestionType.ORDERING:
      return (
        <div className="flex flex-col gap-4">
          {
            randomVariants.map((randomVariant) => {
              const orderingVariant = randomVariant as OrderingVariant;
              return (
                <OrderingQuestion
                  key={orderingVariant.id}
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
                  classroomId={classroomId}
                />
              );
            })
          }
        </div>
      );
    }
};


const KnowledgeZapAssignment: React.FC<KnowledgeZapAssignmentViewProps> = ({ 
  assignmentAttemptId,
  knowledgeZapAssignment,
  knowledgeZapAttemptId,
  classroomId,
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

  // Helper function to render lightning bolt progress indicator
  const renderProgressIndicator = () => {
    const totalQuestions = questionStack.length;
    if (totalQuestions === 0) return null;

    const maxIconsToShow = 5;
    const shouldShowEllipsis = totalQuestions > maxIconsToShow;
    const iconsToRender = shouldShowEllipsis ? 3 : Math.min(totalQuestions, maxIconsToShow);
    
    return (
      <div className="flex flex-row items-center gap-1 w-full justify-center mx-auto my-6">
        <AnimatePresence mode="popLayout">
          {questionStack.slice(0, iconsToRender).map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              layout
            >
              <LightningBoltIcon className="text-lime-700 h-6 w-6 sm:h-8 sm:w-8"/>
            </motion.div>
          ))}
          {shouldShowEllipsis && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center"
            >
              <span className="text-lime-700 text-lg font-bold mx-2">...</span>
            </motion.div>
          )}
          {shouldShowEllipsis && questionStack.slice(-2).map((question) => (
            <motion.div
              key={question.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              layout
            >
              <LightningBoltIcon className="text-lime-700 h-6 w-6 sm:h-8 sm:w-8"/>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-full h-full">
      {/* Header */}
      <div className="w-full border-b border-slate-200 bg-white">
        <div className="px-4 sm:px-8 py-4 sm:py-3">
          {/* Mobile: 2x2 Grid Layout */}
          <div className="grid grid-cols-2 grid-rows-1 gap-3 sm:hidden">
            {/* Row 1, Col 1: Knowledge Zap Title */}
            <div className="flex items-center">
              <h1 className="text-base font-semibold text-lime-700 whitespace-nowrap">
                Knowledge Zap | Revision
              </h1>
            </div>
            
            {/* Row 1, Col 2: Tutorial Button */}
            <div className="flex justify-end">
              {knowledgeZapAttemptId.length > 0 && <AssignmentTutorialModal 
                classroomId={classroomId} 
                isMobileLayout={true} />}
            </div>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left section - Main info */}
            <div className="flex flex-row items-center gap-4 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-lime-700 whitespace-nowrap">
                  Knowledge Zap
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Separator orientation="vertical" className="h-4 w-px" />
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium text-slate-700 truncate">
                    Revision
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right section - Actions */}
            <div className="flex flex-row justify-end gap-3 flex-shrink-0">
              <>
                {knowledgeZapAttemptId.length > 0 && <AssignmentTutorialModal 
                  classroomId={classroomId} 
                  isMobileLayout={false} />}
              </>
            </div>
          </div>
        </div>
      </div>      
      
      <div className="w-full mx-auto bg-lime-50 min-h-[calc(100vh-80px)]">
        <div className="p-4 sm:p-8 lg:p-16">
          {renderProgressIndicator()}
          <Card className="px-4 py-8 sm:px-12 sm:py-12">
            <CardContent className="flex flex-col gap-8">
              {questionStack.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {questionStack[0] && renderQuestion(questionStack[0], assignmentAttemptId, stackPush, stackPop, classroomId)}
                </div>
              ) : (
                <div className="flex flex-col gap-4 px-4 py-16 sm:px-16 sm:py-32">
                  {knowledgeZapAssignment && knowledgeZapAssignment?.questions.length > 0 ? (
                    <p className="text-center text-lg sm:text-2xl">
                      Congratulations! You have completed your revision. <br /> 
                      You can always revisit this activity to revise your concepts.
                    </p>                  
                  ) : (
                    <p className="text-center text-lg sm:text-2xl">
                      No questions to revise. Please check back later when activities are assigned.
                    </p>
                  )}
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