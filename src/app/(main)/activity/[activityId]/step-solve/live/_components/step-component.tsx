'use client'
import React from 'react';
import { Form, FormControl, FormItem, FormField } from '@/components/ui/form';
import FormattedText from '@/components/formatted-text';
import { LoadingButton } from '@/components/loading-button';
import { useForm } from 'react-hook-form';
import StepOption from './step-option';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

interface StepSolveStepComponentProps {
  id: string;
  stepNumber: number;
  stepText: string | null;
  stepTextPart2: string | null;
  stepImage?: string | null;
  attemptId: string;
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
  handleContinue: () => void;
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
  id, stepNumber, stepText, stepTextPart2, stepImage, options, answer, handleSubmitAnswer, isCompleted, isCorrect, isLoading, isDisabled, handleContinue, isLast, stepSolveAnswerUnits
}: StepSolveStepComponentProps) => {

  const handleSubmit = async (input: submitAnswerInput) => {
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
    <div className="mx-auto flex flex-col gap-4">
      <h2 className="text-sm font-bold text-muted-foreground text-center">STEP {stepNumber}</h2>
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
                You selected: 
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
                    <div className="grid grid-cols-2 gap-4 w-full mx-auto">
                      {options.map((option) => (
                        <button
                          disabled={isDisabled}
                          key={option.id}
                          type="button"
                          onClick={() => field.onChange(option.id)}
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
            answer && answer?.length > 0 && (        
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
            answer && answer?.length > 0 && (
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

          {!isCompleted && isCorrect === true && !isLast && (
            <>
              <p className="text-green-500 text-sm">Good job! You got it.</p>
              <LoadingButton 
                variant="link"
                className="p-2 bottom-0 right-0 mt-auto ml-auto hover:no-underline"
                onClick={handleContinue}>
                <div className="flex flex-row gap-2">
                <span className="my-auto font-semibold">
                  Continue
                </span>
                <Image 
                  className="my-auto"
                  src="/images/step-solve.png" 
                  alt="Step Solve"
                  width={32} 
                  height={32} />
                </div>
              </LoadingButton>
            </>
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
    </div>

  );
};

export default StepSolveStepComponent;