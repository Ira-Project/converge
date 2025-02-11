'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SubmissionModal from './step-solve-submission-modal';
import AssignmentTutorialModal from './step-solve-tutorial-modal';
import ConfirmationModal from './step-solve-confirmation-modal';
import AssignmentShareModal from './step-solve-share-modal'
import { type RouterOutputs } from '@/trpc/shared';
import { api } from "@/trpc/react";
import { Roles } from "@/lib/constants";
import { Separator } from '@/components/ui/separator';
import StepSolveStepComponent from './step-component';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import FormattedText from '@/components/formatted-text';

interface StepSolveActivityViewProps {
  stepSolveAssignment: RouterOutputs["stepSolve"]["getAssignment"];
  stepSolveAttemptId: string;
  activityId: string
  topic: string;
  dueDate?: Date;
  isLive: boolean;
  classroomId: string;
  role: Roles;
}

interface QuestionState {
  step: number;
  questionAttemptId: string;
  currentStepCorrect?: boolean;
}

const StepSolveActivityView: React.FC<StepSolveActivityViewProps> = ({ 
  stepSolveAssignment, 
  stepSolveAttemptId,
  activityId,
  topic,
  isLive,
  classroomId,
  role,
  dueDate
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
  const submissionMutation = api.stepSolve.submitAttempt.useMutation();

  // Submission Functions
  const [submissionModalOpen, setSubmissionmodalOpen] = useState(false);
  const submitAssignment = async () => {
    await submissionMutation.mutateAsync({
      attemptId: stepSolveAttemptId,
      activityId: activityId
    });
    setSubmissionmodalOpen(true);
  }

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
      questionId: currentQuestion.q.id,
      questionAttemptId: currentState?.questionAttemptId ?? undefined,
      optionId: input.optionId,
      answer: input.userAnswer
    });

    setQuestionStates(prev => {
      const newStates = [...prev];
      if (newStates[currentQuestionIndex]) {
        const currentStep = currentQuestion.q.steps.find(step => step.id === input.stepId);
        const isLastStep = currentStep?.stepNumber === currentQuestion.q.steps.length;
        
        newStates[currentQuestionIndex] = {
          ...newStates[currentQuestionIndex],
          currentStepCorrect: result.isCorrect,
          // If it's the last step and the answer is correct, automatically increment the step
          step: result.isCorrect && isLastStep ? newStates[currentQuestionIndex].step + 1 : newStates[currentQuestionIndex].step,
          questionAttemptId: result.questionAttemptId
        };
      }
      return newStates;
    });
  }

  const handleContinue = () => {
    setQuestionStates(prev => {
      const newStates = [...prev];
      const currentState = newStates[currentQuestionIndex];
      
      if (currentState && currentState.step === currentState.step) {
        newStates[currentQuestionIndex] = {
          ...currentState,
          step: currentState.step + 1,
          currentStepCorrect: undefined
        };
      }
      return newStates;
    });
  };


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
            {topic}
          </p>
        </div>
        <SubmissionModal open={submissionModalOpen} />
        <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
          { role !== Roles.Teacher ?
            <>
              {
                stepSolveAttemptId.length > 0 &&
                <AssignmentTutorialModal 
                  topic={topic}
                  classroomId={classroomId} />
              }
              <ConfirmationModal 
                onSubmit={submitAssignment} 
                loading={submissionMutation.isLoading || (dueDate && new Date() > new Date(dueDate) ? true : false)}
                />
            </>
            : 
            <>
              {
                stepSolveAttemptId.length > 0 &&
                <AssignmentTutorialModal 
                  topic={topic}
                  classroomId={classroomId} />
              }
              <AssignmentShareModal 
                activityId={activityId}
                isLive={isLive} />
            </>
          }
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
                    text={currentQuestion?.q.questionText ?? ""}
                  />
                  <div className="flex justify-center">
                    {currentQuestion?.q.questionImage && (
                      <Image
                        src={currentQuestion.q.questionImage}
                        alt="Question Image"
                        width={500}
                        height={500}
                      />
                    )}
                  </div>
                </div>
              </>

              {
                currentQuestion?.q.steps.map((step) => 
                  step.stepNumber <= (currentState?.step ?? 0) && (
                    <div key={step.id}>
                      <StepSolveStepComponent
                        id={step.id}
                        stepNumber={step.stepNumber}
                        stepText={step.stepText}
                        stepTextPart2={step.stepTextPart2}
                        stepImage={step.stepImage}
                        attemptId={stepSolveAttemptId}
                        options={step.opt}
                        answer={step.stepSolveAnswer}
                        handleSubmitAnswer={handleSubmitAnswer}
                        isCompleted={(currentState?.step ?? 0) > step.stepNumber}
                        isCorrect={currentState?.currentStepCorrect}
                        isLoading={checkStepMutation.isLoading}
                        isDisabled={checkStepMutation.isLoading}
                        handleContinue={handleContinue}
                        isLast={step.stepNumber === currentQuestion.q.steps.length}
                        stepSolveAnswerUnits={step.stepSolveAnswerUnits ?? undefined} />
                      {
                        step.stepNumber < (currentState?.step ?? 0) && 
                        step.stepNumber !== currentQuestion.q.steps.length &&
                        <Separator className="my-4"/>
                      }
                    </div>
                  )
                )
              }
              {currentState && currentState.step > (currentQuestion?.q.steps.length ?? 0) && (
                currentQuestionIndex < (stepSolveAssignment?.stepSolveQuestions?.length ?? 0) - 1 ? (
                  <div className="flex justify-end mt-8">
                    <Button
                      variant="link"
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    >
                      Next Question
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end mt-8">
                    <p className="text-sm text-muted-foreground">
                      You've completed all questions. Please submit your assignment.
                    </p>
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