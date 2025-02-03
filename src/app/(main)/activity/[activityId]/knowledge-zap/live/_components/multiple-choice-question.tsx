// MultipleChoiceQuestion.tsx

import { LoadingButton } from '@/components/loading-button';
import { api } from '@/trpc/react';
import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { type MultipleChoiceOption } from '../types';
import FormattedText from '@/components/formatted-text';

interface MultipleChoiceQuestionProps {
  assignmentAttemptId: string;
  multipleChoiceQuestionId: string;
  questionId: string;
  question: string;
  imageUrl?: string | null;
  options: MultipleChoiceOption[];
  stackPush: () => void;
  stackPop: () => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({  
  assignmentAttemptId,
  multipleChoiceQuestionId,
  questionId,
  question, 
  imageUrl,
  options, 
  stackPush,
  stackPop
}) => {

  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);


  const checkMultipleChoiceAnswer = api.knowledgeQuestions.checkMultipleChoiceAnswer.useMutation();

  const getButtonClassNames = (
    isSelected: boolean,
  ) => {
    return `w-full p-3 text-left rounded-lg transition-colors text-center text-sm
    ${isSelected ? 'bg-lime-300' : 'bg-lime-100'}`;
  };


  const handleSubmit = async () => {
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
      <p className="text-xl text-center"> 
        <FormattedText text={question} />
      </p>
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
    </div>
  );
};

export default MultipleChoiceQuestion;