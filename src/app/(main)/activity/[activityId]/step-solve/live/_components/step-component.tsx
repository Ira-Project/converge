'use client'
import React, { useState } from 'react';
import { Form, FormControl, FormItem, FormField } from '@/components/ui/form';
import FormattedText from '@/components/formatted-text';
import { LoadingButton } from '@/components/loading-button';
import { useForm } from 'react-hook-form';
import StepOption from './step-option';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { FlagStepModal } from './flag-step-modal';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import posthog from 'posthog-js';

interface StepSolveStepComponentProps {
  id: string;
  stepNumber: number;
  stepText: string | null;
  stepTextPart2: string | null;
  stepImage?: string | null;
  attemptId: string;
  classroomId: string;
  options?: {
    optionText?: string | null;
    optionImage?: string | null;
    id: string;
  }[];
  stepSolveAnswerUnits?: string;
  isCompleted: boolean;
  answer?: string[] | null;
  handleSubmitAnswer: (input: {
    stepId: string;
    userAnswer?: string;
    optionId?: string;
  }) => Promise<void>;
  isCorrect?: boolean;
  isLoading: boolean;
  isDisabled: boolean;
  isLast?: boolean;
}

interface submitAnswerInput {
  userAnswer?: string;
  optionId?: string;
}

const StepSolveStepComponent = ({ 
  id, stepNumber, stepText, stepTextPart2, stepImage, options, answer, handleSubmitAnswer, isCompleted, isCorrect, isLoading, isDisabled, isLast, stepSolveAnswerUnits, classroomId
}: StepSolveStepComponentProps) => {
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);

  // Combine stepText and stepTextPart2 for flagging
  const completeStepText = [stepText, stepTextPart2].filter(Boolean).join(' ');

  const handleSubmit = async (input: submitAnswerInput) => {
    posthog.capture("step_solve_answer_submitted", {
      userAnswer: input.userAnswer,
    });
    await handleSubmitAnswer({
      stepId: id,
      userAnswer: input.userAnswer,
      optionId: input.optionId
    });
  }

  const form = useForm<submitAnswerInput>({
    defaultValues: {
      userAnswer: "",
      optionId: undefined,
    },
  })

  return (
    <div className="mx-auto flex flex-col gap-4 mb-12">
      <div className="flex justify-between items-start">
        <h2 className="text-sm font-bold text-muted-foreground text-center flex-1">STEP {stepNumber}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFlagModalOpen(true)}
          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 flex items-center gap-1"
        >
          <Flag className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-center">
        {stepText && <FormattedText text={stepText} />}
        {stepImage && <Image src={stepImage} alt={stepText ?? ""} width={200} height={200} />}
      </div>
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4 items-center justify-center"
        >
          {isCompleted ? options && options.length > 0 && (
            <>  
              <p className="text-center text-sm text-muted-foreground"> 
                You got it right! Your selected option was: 
              </p>
              <StepOption 
                step={options?.find(option => option.id === form.getValues('optionId'))?.optionText ?? ''}
                image={options?.find(option => option.id === form.getValues('optionId'))?.optionImage}
                selected={true}
                completed={true}
                />
            </>
          ) : (
            options && options.length > 0 && (
              <FormField
                control={form.control}
                name="optionId"
                render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mx-auto">
                      {options.map((option) => (
                        <button
                          disabled={isDisabled}
                          key={option.id}
                          type="button"
                          onClick={() => {
                            posthog.capture("step_solve_option_selected");
                            field.onChange(option.id)
                          }}
                          className="w-full cursor-pointer"
                        >
                          <StepOption
                            step={option.optionText ?? ''}
                            image={option.optionImage}
                            selected={field.value === option.id}
                            completed={isCompleted}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )} />
            )
          )}

          {stepTextPart2 && 
            <div className="text-center">
              <FormattedText text={stepTextPart2 ?? ''} />
            </div>
          }

          {!isCompleted ? (
            answer && answer?.length > 0 && 
            !(answer.length === 1 && answer[0] === "") && (        
              <div className="flex flex-row gap-2 items-center justify-center">
                <FormField
                  control={form.control}
                  name="userAnswer"
                  render={({ field })  => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isDisabled}
                          type="text"
                          placeholder="Enter your answer..."
                          className="w-full"
                        />
                      </FormControl>                      
                    </FormItem>
                  )}
                />
                { stepSolveAnswerUnits && (
                  <div className="text-sm">
                    <FormattedText text={stepSolveAnswerUnits} />
                  </div>
                )}
              </div>
            )
          ) : 
            answer && answer?.length > 0 && 
            !(answer.length === 1 && answer[0] === "") && (
              <>
                <p className="text-center text-sm text-muted-foreground">
                  You got it right! Your answer was:
                </p>
                <div className="flex flex-row gap-2 items-center justify-center">
                  <p className="text-center font-semibold">
                    {form.getValues('userAnswer')}
                  </p>
                  <p className="text-center text-muted-foreground font-semibold">
                    {stepSolveAnswerUnits && (
                      <FormattedText text={stepSolveAnswerUnits} />
                    )}
                  </p>
                </div>
              </>
            )
          }

          {!isCompleted && isCorrect === false && (
            <p className="text-red-500 text-sm">Incorrect answer. Please try again.</p>
          )}  

          {isLast && isCompleted && (
            <div className="text-center mt-4">
              <p className="text-lg text-green-600">
                🎉 Congratulations! You've completed this question! 
              </p>
            </div>
          )}

          {!isCompleted && !isCorrect && (
            <LoadingButton 
              disabled={isDisabled || (options && options.length > 0 && !form.getValues('optionId'))} 
              loading={isLoading}
              variant="link"
              className="p-2 bottom-0 right-0 mt-auto ml-auto hover:no-underline">
              <div className="flex flex-row gap-2">
                <span className="my-auto font-semibold">
                  Submit
                </span>
                <Image 
                  className="my-auto"
                  src="/images/step-solve.png" 
                  alt="Step Solve"
                  width={32} 
                  height={32} />
              </div>
            </LoadingButton>
          )}
        </form>
      </Form>

      <FlagStepModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        stepId={id}
        stepText={completeStepText}
        classroomId={classroomId}
      />
    </div>
  );
};

export default StepSolveStepComponent;