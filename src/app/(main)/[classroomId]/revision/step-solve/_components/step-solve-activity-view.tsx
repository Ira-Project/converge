'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AssignmentTutorialModal from './step-solve-tutorial-modal';
import { type RouterOutputs } from '@/trpc/shared';
import { api } from "@/trpc/react";
import { Separator } from '@/components/ui/separator';
import StepSolveStepComponent from './step-component';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import FormattedText from '@/components/formatted-text';
import posthog from 'posthog-js';

interface StepSolveActivityViewProps {
  stepSolveAssignment: RouterOutputs["stepSolve"]["getRevisionActivity"];
  stepSolveAttemptId: string;  
  classroomId: string;
}

interface QuestionState {
  step: number;
  questionAttemptId: string;
  currentStepCorrect?: boolean;
}

const StepSolveActivityView: React.FC<StepSolveActivityViewProps> = ({ 
  stepSolveAssignment, 
  stepSolveAttemptId,
  classroomId,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    stepSolveAssignment?.stepSolveQuestions?.map(() => ({
      step: 1,
      currentStepIncorrect: undefined,
      questionAttemptId: ''
    })) ?? [] 
  );
  
  const currentQuestion = stepSolveAssignment?.stepSolveQuestions?.[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];

  const checkStepMutation = api.stepSolveCheckStep.checkStep.useMutation();

  // Check Step Functions
  const handleSubmitAnswer = async (input: {
    stepId: string;
    userAnswer?: string;
    optionId?: string;
  }) => {
    if (!currentQuestion) return;
    
    const result = await checkStepMutation.mutateAsync({
      stepId: input.stepId,
      attemptId: stepSolveAttemptId,
      questionId: currentQuestion.id,
      questionAttemptId: currentState?.questionAttemptId ?? undefined,
      optionId: input.optionId,
      answer: input.userAnswer,
      classroomId: classroomId,
    });

    setQuestionStates(prev => {
      const newStates = [...prev];
      if (newStates[currentQuestionIndex]) {
        
        newStates[currentQuestionIndex] = {
          ...newStates[currentQuestionIndex],
          currentStepCorrect: result.isCorrect ? undefined : result.isCorrect,
          step: result.isCorrect ? newStates[currentQuestionIndex].step + 1 : newStates[currentQuestionIndex].step,
          questionAttemptId: result.questionAttemptId
        };
      }
      return newStates;
    });
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="w-full border-b border-slate-200 bg-white">
        <div className="px-4 sm:px-8 py-4 sm:py-3">
          {/* Mobile: 2x1 Grid Layout */}
          <div className="grid grid-cols-2 grid-rows-1 gap-3 sm:hidden">
            {/* Row 1, Col 1: Step Solve Title */}
            <div className="flex items-center">
              <h1 className="text-base font-semibold text-teal-700 whitespace-nowrap">
                Step Solve | Revision
              </h1>
            </div>
            
            {/* Row 1, Col 2: Tutorial Button */}
            <div className="flex justify-end">
              <AssignmentTutorialModal 
                classroomId={classroomId} 
                isMobileLayout={true} />
            </div>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left section - Main info */}
            <div className="flex flex-row items-center gap-4 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-teal-700 whitespace-nowrap">
                  Step Solve
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
                <AssignmentTutorialModal 
                  classroomId={classroomId} 
                  isMobileLayout={false} />
              </>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mx-auto bg-teal-50 min-h-[calc(100vh-80px)]">
        <div className="p-4 sm:p-8 lg:p-16">
          {/* Question Progress Indicators */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            {stepSolveAssignment?.stepSolveQuestions?.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border-2 
                  ${index === currentQuestionIndex 
                    ? 'border-teal-600 bg-teal-600 text-white' 
                    : 'border-teal-600 bg-white'
                  }`}
              />
            ))}
          </div>
          <Card className="px-4 py-8 sm:px-12 sm:py-12">
            <CardContent className="flex flex-col gap-8">
              <>
                <div className="text-center text-lg">
                  <FormattedText 
                    text={currentQuestion?.questionText ?? ""}
                  />
                  <div className="flex justify-center">
                    {currentQuestion?.questionImage && (
                      <Image
                        src={currentQuestion.questionImage}
                        alt="Question Image"
                        width={500}
                        height={500}
                      />
                    )}
                  </div>
                </div>
              </>

              {
                currentQuestion?.steps.map((step) => 
                  step.stepNumber <= (currentState?.step ?? 0) && (
                    <div key={step.id}>
                      <StepSolveStepComponent
                        id={step.id}
                        stepNumber={step.stepNumber}
                        stepText={step.stepText}
                        stepTextPart2={step.stepTextPart2}
                        stepImage={step.stepImage}
                        attemptId={stepSolveAttemptId}
                        classroomId={classroomId}
                        options={step.opt}
                        answer={step.stepSolveAnswer}
                        handleSubmitAnswer={handleSubmitAnswer}
                        isCompleted={(currentState?.step ?? 0) > step.stepNumber}
                        isCorrect={currentState?.currentStepCorrect}
                        isLoading={checkStepMutation.isLoading}
                        isDisabled={checkStepMutation.isLoading}
                        isLast={step.stepNumber === currentQuestion.steps.length}
                        stepSolveAnswerUnits={step.stepSolveAnswerUnits ?? undefined} />
                      {
                        step.stepNumber < (currentState?.step ?? 0) && 
                        step.stepNumber !== currentQuestion.steps.length &&
                        <Separator className="my-4"/>
                      }
                    </div>
                  )
                )
              }
              {currentState && currentState.step > (currentQuestion?.steps.length ?? 0) && (
                currentQuestionIndex < (stepSolveAssignment?.stepSolveQuestions?.length ?? 0) - 1 ? (
                  <div className="flex justify-end mt-8">
                    <Button
                      variant="link"
                      onClick={() => {
                        posthog.capture("step_solve_next_question_clicked");
                        setCurrentQuestionIndex(prev => prev + 1)
                      }}
                    >
                      Next Question
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 px-4 py-16 sm:px-16 sm:py-32">
                  {
                    stepSolveAssignment?.stepSolveQuestions?.length > 0 ? (
                      <p className="text-center text-lg sm:text-2xl">
                        Congratulations! You have completed your revision. <br /> 
                        You can always revisit this activity to revise your concepts.
                      </p>                  
                    ) : (
                      <p className="text-center text-lg sm:text-2xl">
                        No questions to revise. Please check back later when activities are assigned.
                      </p>
                    )
                  }
                </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StepSolveActivityView;