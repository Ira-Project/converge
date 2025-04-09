// OrderingQuestion.tsx
import React, { useState } from 'react';
import type { MultipleChoiceOption } from '../../types';
import { LoadingButton } from '@/components/loading-button';
import Image from 'next/image';

import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import FormattedText from '@/components/formatted-text';
import posthog from 'posthog-js';
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
}

const OrderingQuestion: React.FC<OrderingQuestionProps> = ({ 
  assignmentAttemptId, orderingQuestionId, questionId, question, isDescending, topLabel, bottomLabel, options, stackPush, stackPop 
}) => {
  
  const [order, setOrder] = useState<MultipleChoiceOption[]>(options);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

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
    });
    setIsCorrect(result.correct);
    setIsSubmitted(true);
  };

  const handleDragStart = (item: MultipleChoiceOption) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, overItem: MultipleChoiceOption) => {
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
    <div className="flex flex-col gap-8">
      <p className="text-xl text-center mb-4"> 
        <FormattedText text={question} />
      </p>
      <p className="text-sm text-center text-muted-foreground">Put it in the correct order</p>
      <div className="flex flex-row gap-8 px-32 relative w-full">
        <div className="flex flex-col justify-center">
          <div className="h-full flex items-center">
            <div className="w-1 h-full bg-lime-700 relative">
              {/* Labels and Arrow head */}
              {isDescending ? (
                <>
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground text-center">
                    {topLabel}
                  </span>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 
                    border-l-[8px] border-l-transparent
                    border-r-[8px] border-r-transparent
                    border-b-[12px] border-b-lime-700">
                  </div>
                  <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground text-center">
                    {bottomLabel}
                  </span>
                </>
              ) : (
                <>
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground text-center">
                    {topLabel}
                  </span>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 
                    border-l-[8px] border-l-transparent
                    border-r-[8px] border-r-transparent
                    border-t-[12px] border-t-lime-700">
                  </div>
                  <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground text-center">
                    {bottomLabel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4 w-full">
        {order.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item)}
            onDragOver={(e) => handleDragOver(e, item)}
            className="w-full p-3 rounded-lg transition-colors text-center text-sm bg-lime-100"
            style={{
              boxShadow: '4px 4px 8px rgba(229, 249, 186, 100), -4px -4px 8px rgba(255, 255, 255, 100)',
            }}
          >
            <FormattedText text={item.option} />
          </div>
        ))}
      </div>
      </div>

      {!isSubmitted && (
        <LoadingButton 
          loading={checkOrderingAnswer.isLoading}
          disabled={order.length !== options.length || checkOrderingAnswer.isLoading}
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
    </div>
  );
};

export default OrderingQuestion;