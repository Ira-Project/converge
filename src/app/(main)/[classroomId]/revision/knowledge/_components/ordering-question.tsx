// OrderingQuestion.tsx
import React, { useState } from 'react';
import type { MultipleChoiceOption } from '../../types';
import { LoadingButton } from '@/components/loading-button';
import Image from 'next/image';

import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import FormattedText from '@/components/formatted-text';
import posthog from 'posthog-js';
import { FlagQuestionModal } from './flag-question-modal';
import { KnowledgeZapQuestionType } from '@/lib/constants';
import { Flag } from 'lucide-react';

interface OrderingQuestionProps {
  assignmentAttemptId: string;
  orderingQuestionId: string;
  questionId: string;
  question: string;
  isDescending: boolean;
  topLabel: string;
  bottomLabel: string;
  options: MultipleChoiceOption[];
  stackPush: () => void;
  stackPop: () => void;
  classroomId: string;
}

const OrderingQuestion: React.FC<OrderingQuestionProps> = ({ 
  assignmentAttemptId, orderingQuestionId, questionId, question, isDescending, topLabel, bottomLabel, options, stackPush, stackPop, classroomId 
}) => {
  
  const [order, setOrder] = useState<MultipleChoiceOption[]>(options);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);

  const [draggedItem, setDraggedItem] = useState<MultipleChoiceOption | null>(null);

  const checkOrderingAnswer = api.knowledgeQuestions.checkOrderingAnswer.useMutation();

  const handleSubmit = async () => {
    posthog.capture("knowledge_zap_ordering_question_submitted");
    const result = await checkOrderingAnswer.mutateAsync({
      assignmentAttemptId: assignmentAttemptId,
      orderingQuestionId: orderingQuestionId,
      questionId: questionId,
      answer: (order).map((option, index) => ({
        id: option.id,
        order: index + 1,
        option: option.option,
      })),
      classroomId: classroomId,
    });
    setIsCorrect(result.correct);
    setIsSubmitted(true);
  };

  const handleDragStart = (item: MultipleChoiceOption) => {
    if (isSubmitted) return;
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, overItem: MultipleChoiceOption) => {
    if (isSubmitted) return;
    posthog.capture("knowledge_zap_ordering_question_drag_completed");
    e.preventDefault();
    if (draggedItem === overItem) return;

    const newOrder = [...order];
    const draggedIndex = newOrder.indexOf(draggedItem!);
    const overIndex = newOrder.indexOf(overItem);
    
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(overIndex, 0, draggedItem!);
    
    setOrder(newOrder);
  };

  const handleContinue = () => { 
    posthog.capture("knowledge_zap_ordering_question_continue_clicked");
    setOrder(options);
    setIsSubmitted(false);
    setIsCorrect(false);
    if (isCorrect) {
      stackPop();
    } else {
      stackPush();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <p className="text-xl text-center flex-1"> 
          <FormattedText text={question} />
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFlagModalOpen(true)}
          className="text-lime-600 hover:text-lime-700 hover:bg-lime-50 flex items-center gap-1"
        >
          <Flag className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm text-center text-muted-foreground">Drag the items to order them correctly</p>
      <div className="flex flex-col items-center gap-6 px-4">
        <div className="flex flex-col gap-4 items-center w-full">
          <div className="flex flex-col gap-2 items-center justify-center">
            <div className="flex flex-row gap-2 items-center text-sm font-medium text-gray-600">
              <span>{topLabel}</span>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
            <div className="border-l-2 border-gray-300 h-8"></div>
          </div>
          
          <div className="flex flex-col gap-2 w-full max-w-md">
            {order.map((option, index) => (
              <div
                key={option.id}
                draggable={!isSubmitted}
                onDragStart={() => handleDragStart(option)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDragOver(e, option);
                }}
                className="flex items-center gap-3 p-3 bg-lime-100 rounded-lg border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                style={{
                  boxShadow: '4px 4px 8px rgba(229, 249, 186, 100), -4px -4px 8px rgba(255, 255, 255, 100)',
                  opacity: isSubmitted ? 0.6 : 1,
                  cursor: isSubmitted ? 'not-allowed' : 'move',
                }}
              >
                <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full text-sm font-medium text-gray-600">
                  {index + 1}
                </div>
                <FormattedText text={option.option} />
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-2 items-center justify-center">
            <div className="border-l-2 border-gray-300 h-8"></div>
            <div className="flex flex-row gap-2 items-center text-sm font-medium text-gray-600">
              <span>{bottomLabel}</span>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {!isSubmitted && (
        <LoadingButton 
          loading={checkOrderingAnswer.isLoading}
          disabled={checkOrderingAnswer.isLoading}
          variant="link"
          className="p-2 ml-auto hover:no-underline"
          onClick={handleSubmit}
        >
          <div className="flex flex-row gap-2">
            <span className="my-auto font-semibold">
              Submit
            </span>
            <Image 
              className="my-auto" 
              src="/images/knowledge-zap.png" 
              alt="Knowledge Zap" 
              width={32} 
              height={32} />
          </div>
        </LoadingButton>
      )}

      {isSubmitted && (
        <div className="flex flex-col gap-2">
          {isCorrect ? 
          <div className="flex flex-col items-center gap-4">
            <p className="text-green-600 font-medium text-center">
              🎉 Great Job! You got it right!
            </p>
          </div>
          : <div className="flex flex-col items-center gap-4">
            <p className="text-destructive font-medium text-center">
              Whoops! That's not quite right. You'll get it next time!
            </p>
          </div>}
          <Button 
            variant="link" 
            className="p-2 ml-auto" 
            onClick={handleContinue}
          >
            <div className="flex flex-row gap-2">
              <span className="my-auto font-semibold">
                Continue
              </span>
              <Image 
                  className="my-auto" 
                  src="/images/knowledge-zap.png" 
                  alt="Knowledge Zap" 
                  width={32} 
                  height={32} />
            </div>
          </Button>
        </div>
      )}

      <FlagQuestionModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        questionId={questionId}
        questionText={question}
        questionType={KnowledgeZapQuestionType.ORDERING}
        classroomId={classroomId}
      />
    </div>
  );
};

export default OrderingQuestion;