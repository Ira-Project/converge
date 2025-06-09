'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AssignActivityModal } from '@/app/(main)/[classroomId]/activity-preview/[assignmentId]/_components/assign-activity-modal';
import ConceptsModal from '@/components/ui/concepts-modal';
import { type RouterOutputs } from '@/trpc/shared';
import { type ActivityType, Roles } from "@/lib/constants";
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/react';
import FormattedText from '@/components/formatted-text';
import Image from 'next/image';
import StepSolveStepComponent from './step-component';
import { Button } from '@/components/ui/button';

interface StepSolvePreviewViewProps {
  assignmentAttemptId: string;
  stepSolveAssignment?: RouterOutputs["stepSolve"]["getStepSolveAssignmentById"];
  stepSolveAttemptId: string;
  assignmentId: string;
  activityType: ActivityType;
  activityName: string;
  topicId: string;
  topic: string;
  classroomId: string;
  role: Roles;
}

interface QuestionState {
  step: number;
  currentStepCorrect?: boolean;
  questionAttemptId: string;
}

const StepSolvePreview: React.FC<StepSolvePreviewViewProps> = ({ 
  stepSolveAssignment,
  stepSolveAttemptId,
  assignmentId,
  activityType,
  activityName,
  topicId,
  topic,
  classroomId,
  role,
}: StepSolvePreviewViewProps) => {

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    stepSolveAssignment?.stepSolveQuestions?.map(() => ({
      step: 1,
      currentStepCorrect: undefined,
      questionAttemptId: ''
    })) ?? [] 
  );

  const currentQuestion = stepSolveAssignment?.stepSolveQuestions?.[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];
  const totalQuestions = stepSolveAssignment?.stepSolveQuestions?.length ?? 0;

  // Check if current question is completed
  const isCurrentQuestionCompleted = currentQuestion && currentState
    ? (currentState.step > currentQuestion.q.steps.length)
    : false;

  // Check if all questions are completed
  const allQuestionsCompleted = currentQuestionIndex >= totalQuestions - 1 && isCurrentQuestionCompleted;

  // Fetch concepts for teachers
  const { data: concepts = [], isLoading: isConceptsLoading } = api.stepSolve.getStepSolveAssignmentConceptsById.useQuery(
    { assignmentId }, 
    { enabled: role === Roles.Teacher }
  );

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
      questionId: currentQuestion.q.id,
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

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Get question completion status for progress indicators
  const getQuestionStatus = (index: number) => {
    if (index < currentQuestionIndex) return 'completed';
    if (index === currentQuestionIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="flex flex-col min-h-full h-full">
      {/* Header */}
      <div className="w-full border-b border-slate-200 bg-white">
        <div className="px-4 sm:px-8 py-4 sm:py-3">
          {/* Mobile: 2x2 Grid Layout */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:hidden">
            {/* Row 1, Col 1: Step Solve Title */}
            <div className="flex items-center">
              <h1 className="text-base font-semibold text-teal-600 whitespace-nowrap">
                Step Solve
              </h1>
            </div>
            
            {/* Row 1, Col 2: Assign Activity Button */}
            <div className="flex justify-end">
              { role == Roles.Teacher && (
                <AssignActivityModal 
                  classroomId={classroomId}
                  assignmentId={assignmentId}
                  activityType={activityType}
                  activityName={activityName}
                  topicId={topicId}
                  />
              )}
            </div>
            
            {/* Row 2, Col 1: Topic + Preview Badge */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-700 truncate">
                {topic}
              </p>
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium">
                PREVIEW
              </span>
            </div>
            
            {/* Row 2, Col 2: Concepts Modal */}
            <div className="flex justify-end">
              { role == Roles.Teacher && stepSolveAttemptId.length > 0 && (
                <ConceptsModal 
                  topic={topic}
                  classroomId={classroomId}
                  concepts={concepts.map(c => ({
                    id: c.id,
                    text: c.name,
                    answerText: c.name,
                  }))}
                  activityType="Step Solve"
                  isLoading={isConceptsLoading}
                  isMobileLayout={true}
                  />
              )}
            </div>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left section - Main info */}
            <div className="flex flex-row items-center gap-4 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-teal-600 whitespace-nowrap">
                  Step Solve
                </h1>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium">
                  PREVIEW
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Separator orientation="vertical" className="h-4 w-px" />
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium text-slate-700 truncate">
                    {topic}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right section - Actions */}
            <div className="flex flex-row justify-end gap-3 flex-shrink-0">
              { role == Roles.Teacher &&
                <>
                  {stepSolveAttemptId.length > 0 && <ConceptsModal 
                    topic={topic}
                    classroomId={classroomId}
                    concepts={concepts.map(c => ({
                      id: c.id,
                      text: c.name,
                      answerText: c.name,
                    }))}
                    activityType="Step Solve"
                    isLoading={isConceptsLoading}
                    isMobileLayout={false}
                    />}
                  <AssignActivityModal 
                    classroomId={classroomId}
                    assignmentId={assignmentId}
                    activityType={activityType}
                    activityName={activityName}
                    topicId={topicId}
                    />
                </>
              }
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full mx-auto bg-teal-50 min-h-[calc(100vh-80px)]">
        <div className="p-4 sm:p-8 lg:p-16">
          {/* Question Progress Indicators */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            {stepSolveAssignment?.stepSolveQuestions?.map((_, index) => {
              const status = getQuestionStatus(index);
              return (
                <div
                  key={index}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border-2 
                    ${status === 'completed' 
                      ? 'border-green-600 bg-green-600 text-white' 
                      : status === 'current'
                      ? 'border-teal-600 bg-teal-600 text-white' 
                      : 'border-teal-600 bg-white'
                    }`}
                >
                  {status === 'completed' && (
                    <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
          <Card className="px-4 py-8 sm:px-12 sm:py-12">
            <CardContent className="flex flex-col gap-8">
              {!allQuestionsCompleted && currentQuestion ? (
                <>
                  <div className="text-center text-lg">
                    <FormattedText 
                      text={currentQuestion.q.questionText ?? ""}
                    />
                    <div className="flex justify-center">
                      {currentQuestion.q.questionImage && (
                        <Image
                          src={currentQuestion.q.questionImage}
                          alt="Question Image"
                          width={500}
                          height={500}
                        />
                      )}
                    </div>
                  </div>

                  {
                    currentQuestion.q.steps.map((step) => 
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

                  {/* Navigation Buttons for Preview Mode */}
                  <div className="flex justify-between items-center mt-8">
                    <div>
                      {currentQuestionIndex > 0 && (
                        <Button 
                          onClick={handlePreviousQuestion}
                          variant="link"
                          className="text-teal-600 hover:text-teal-700 px-4 py-2 text-base font-medium"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous
                        </Button>
                      )}
                    </div>
                    <div>
                      {currentQuestionIndex < totalQuestions - 1 && (
                        <Button 
                          onClick={handleNextQuestion}
                          variant="link"
                          className="text-teal-600 hover:text-teal-700 px-4 py-2 text-base font-medium"
                        >
                          Next
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4 px-4 py-16 sm:px-16 sm:py-32">
                  <p className="text-center text-lg sm:text-2xl">
                    Congratulations! You have completed the activity. <br /> 
                    Make sure to hit the submit button to record your score.
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

export default StepSolvePreview; 