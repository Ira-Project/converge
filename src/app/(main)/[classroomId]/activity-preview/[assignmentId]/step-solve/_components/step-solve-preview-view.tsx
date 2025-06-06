'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AssignActivityModal } from '@/app/(main)/activity-preview/_components/assign-activity-modal';
import ConceptsModal from '@/components/ui/concepts-modal';
import { type RouterOutputs } from '@/trpc/shared';
import { type ActivityType, Roles } from "@/lib/constants";
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/react';
import FormattedText from '@/components/formatted-text';
import Image from 'next/image';
import StepSolveStepComponent from './step-component';

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

  // Fetch concepts for teachers
  const { data: concepts = [] } = api.stepSolve.getStepSolveAssignmentConceptsById.useQuery(
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

  return (
    <div className="flex flex-col min-h-full h-full">
      {/* Header */}
      <div className="grid grid-cols-2 w-full h-12 border-b-slate-200 border-b pl-8 pr-4">
        <div className="flex flex-row gap-4 flex-start mr-auto h-8 my-auto">
          <p className="text-lg font-semibold my-auto text-teal-600">
            Step Solve
          </p>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded my-auto">PREVIEW</span>
          <Separator orientation="vertical" className="h-6 w-px my-auto" />
          <p className="text-sm my-auto">
            {topic}
          </p>
        </div>
        <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
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
              {currentQuestion ? (
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
                </>
              ) : (
                <div className="flex flex-col gap-4 px-16 py-32">
                  <p className="text-center text-2xl">
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