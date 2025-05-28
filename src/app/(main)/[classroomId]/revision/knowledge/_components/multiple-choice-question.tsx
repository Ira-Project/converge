// MultipleChoiceQuestion.tsx

import { LoadingButton } from '@/components/loading-button';
import { api } from '@/trpc/react';
import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { type MultipleChoiceOption } from '../../types';
import FormattedText from '@/components/formatted-text';
import posthog from 'posthog-js';
import { FlagQuestionModal } from './flag-question-modal';
import { KnowledgeZapQuestionType } from '@/lib/constants';
import { Flag } from 'lucide-react';

interface MultipleChoiceQuestionProps {
  assignmentAttemptId: string;
  multipleChoiceQuestionId: string;
  questionId: string;
  question: string;
  imageUrl?: string | null;
  options: MultipleChoiceOption[];
  stackPush: () => void;
  stackPop: () => void;
  classroomId: string;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({  
  assignmentAttemptId,
  multipleChoiceQuestionId,
  questionId,
  question, 
  imageUrl,
  options, 
  stackPush,
  stackPop,
  classroomId
}) => {

  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);

  const checkMultipleChoiceAnswer = api.knowledgeQuestions.checkMultipleChoiceAnswer.useMutation();

  const getButtonClassNames = (
    isSelected: boolean,
  ) => {
    return `w-full p-3 text-left rounded-lg transition-colors text-center text-sm
    ${isSelected ? 'bg-lime-300' : 'bg-lime-100'}`;
  };

  const handleSubmit = async () => {
    posthog.capture("knowledge_zap_multiple_choice_question_submitted");
    const result = await checkMultipleChoiceAnswer.mutateAsync({
      assignmentAttemptId: assignmentAttemptId,
      multipleChoiceQuestionId: multipleChoiceQuestionId,
      questionId: questionId,
      answerOptionId: selected ?? '',
    });
    setIsCorrect(result.correct);
    setIsSubmitted(true);
  };

  const handleContinue = () => {
    posthog.capture("knowledge_zap_multiple_choice_question_continue_clicked");
    setSelected(null);
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
      
      {imageUrl && (
        <Image 
          className="my-auto mx-auto" 
          src={imageUrl} 
          alt={question} 
          width={400} 
          height={240} />
      )}
      <p className="text-sm text-center text-muted-foreground">Choose the correct answer</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              posthog.capture("knowledge_zap_multiple_choice_question_option_clicked")
              setSelected(option.id);
            }}
            className={getButtonClassNames(
              selected === option.id,
            )}
            style={{
              boxShadow: '4px 4px 8px rgba(229, 249, 186, 100), -4px -4px 8px rgba(255, 255, 255, 100)',
            }}
          >
            <FormattedText text={option.option} />
            {option.imageUrl && (
              <Image 
                className="my-auto" 
                src={option.imageUrl} 
                alt="Knowledge Zap" 
                width={200} 
                height={150} />
            )}
          </button>
        ))}
      </div>
      {!isSubmitted && (
        <LoadingButton 
          loading={checkMultipleChoiceAnswer.isLoading}
          disabled={selected === null || checkMultipleChoiceAnswer.isLoading}
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
        questionType={KnowledgeZapQuestionType.MULTIPLE_CHOICE}
        classroomId={classroomId}
      />
    </div>
  );
};

export default MultipleChoiceQuestion;