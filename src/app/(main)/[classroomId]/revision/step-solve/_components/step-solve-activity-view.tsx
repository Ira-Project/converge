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
      answer: input.userAnswer
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
      <div className="grid grid-cols-2 w-full h-12 border-b-slate-200 border-b pl-8 pr-4">
        <div className="flex flex-row gap-4 flex-start mr-auto h-8 my-auto">
          <p className="text-lg font-semibold my-auto text-teal-700">
            Step Solve
          </p>
          <Separator orientation="vertical" className="h-6 w-px my-auto" />
          <p className="text-sm my-auto">
            Revision
          </p>
        </div>
        <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
          <AssignmentTutorialModal 
            classroomId={classroomId} />
        </div>
      </div>
      <div className="w-full mx-auto bg-teal-50 min-h-[calc(100vh-48px)]">
        <div className="m-16">
          {/* Question Progress Indicators */}
          <div className="flex justify-center gap-4 mb-4">
            {stepSolveAssignment?.stepSolveQuestions?.map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full flex items-center justify-center border-2 
                  ${index === currentQuestionIndex 
                    ? 'border-teal-600 bg-teal-600 text-white' 
                    : 'border-teal-600 bg-white'
                  }`}
              />
            ))}
          </div>
          <Card className="px-12 py-8">
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
                  <div className="flex flex-col gap-4 px-16 py-32">
                  {
                    stepSolveAssignment?.stepSolveQuestions?.length > 0 ? (
                      <p className="text-center text-2xl">
                        Congratulations! You have completed your revision. <br /> 
                        You can always revisit this activity to revise your concepts.
                      </p>                  
                    ) : (
                      <p className="text-center text-2xl">
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