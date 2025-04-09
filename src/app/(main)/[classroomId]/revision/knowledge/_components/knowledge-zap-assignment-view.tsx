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
  stackPop: () => void
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
            Revision
          </p>
        </div>
        <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
          <>
            {knowledgeZapAttemptId.length > 0 && <AssignmentTutorialModal 
              classroomId={classroomId} />}
          </>
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
                    Congratulations! You have completed your revision. <br /> 
                    You can always revisit this activity to revise your concepts.
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