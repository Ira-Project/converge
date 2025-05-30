'use client'
import React, { useState } from 'react';
import { ArrowRightIcon, RotateCounterClockwiseIcon } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import SubmissionModal from './reasoning-submission-modal';
import AssignmentTutorialModal from './reason-assignment-tutorial-modal';
import ConfirmationModal from './reason-confirmation-modal';
import AssignmentShareModal from './reason-assignment-share-modal'
import DropZone from './drop-zone';
import DraggableStep from './draggable-step';
import { type RouterOutputs } from '@/trpc/shared';
import FormattedText from '@/components/formatted-text';
import { api } from "@/trpc/react";
import { ReasoningPathwayStepResult, Roles } from "@/lib/constants";
import { LoadingButton } from '@/components/loading-button';
import StaticStep from './static-step';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination"
import { ImageModal } from '@/components/image-modal';
import posthog from 'posthog-js';
import { type Part2ComputeCorrectAnswerInput, part2ComputeCorrectAnswerSchema } from '@/server/api/routers/reasoningActivity/reasoning/reasoning.input';

const getColumns = (questionText?: string, answerText?: string) => {
  let columns = 1;
  if (questionText) columns+= 1
  if (answerText) columns+= 1
  return columns;
}

interface ReasoningAssignmentViewProps {
  reasoningAssignment: RouterOutputs["reasonTrace"]["get"];
  reasoningAttemptId: string;
  activityId: string
  topic: string;
  dueDate?: Date;
  isLive: boolean;
  classroomId: string;
  role: Roles;
}

interface StepObject {
  id: string;
  text: string;
  result?: ReasoningPathwayStepResult
}

interface QuestionState {
  correctPathwayOptions: Array<StepObject | null>;
  part: 'part1' | 'part2' | 'part3' | 'complete';
  usedSteps: Array<{ id: string; text: string }>;
  pathwayId?: string;
  finalAnswer?: string;
  errorAnalysisOptions: Array<StepObject | null>;
  errorAnalysisUsedSteps: Array<{ id: string; text: string }>;
  incorrectSteps?: number[];
  part2Error?: string;
  part3Error?: string;
}

const ReasoningStepsAssignment: React.FC<ReasoningAssignmentViewProps> = ({ 
  reasoningAssignment, 
  reasoningAttemptId,
  activityId,
  topic,
  isLive,
  classroomId,
  role,
  dueDate
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    reasoningAssignment?.reasoningQuestions?.map((question) => ({
      correctPathwayOptions: Array(question.question.numberOfSteps).fill(null),
      part: 'part1',
      usedSteps: [],
      pathwayId: undefined,
      finalAnswer: undefined,
      errorAnalysisOptions: Array(question.question.numberOfSteps).fill(null),
      errorAnalysisUsedSteps: [],
      incorrectSteps: [],
      part2Error: undefined,
      part3Error: undefined
    })) ?? []
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<{ id: string; text: string } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const currentQuestion = reasoningAssignment?.reasoningQuestions?.[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];
  const numberOfSteps = currentQuestion?.question.numberOfSteps ?? 0;

  const part1Mutation = api.reasoning.part1IdentifyCorrectPathway.useMutation();
  const part2Mutation = api.reasoning.part2ComputeCorrectAnswer.useMutation();
  const part3Mutation = api.reasoning.part3ErrorAnalysis.useMutation();
  const submissionMutation = api.reasonTrace.submitAttempt.useMutation();


  const handleDragStart = (e: React.DragEvent, option: { id: string; text: string }, index: number | null): void => {
    setIsDragging(true);
    setDraggedItem(option);
    setDraggedIdx(index);
    e.dataTransfer.setData('text/plain', JSON.stringify(option));
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    setIsDragging(false);
    posthog.capture("reason_trace_part_1_step_dropped");

    const newCorrectPathwayOptions = [...currentState!.correctPathwayOptions];
    const newUsedSteps = [...currentState!.usedSteps];

    if (draggedIdx !== null) {
      const temp = newCorrectPathwayOptions[draggedIdx];
      if (temp && newCorrectPathwayOptions[index]) {
        // Reset both steps to pending state when swapping
        [newCorrectPathwayOptions[draggedIdx], newCorrectPathwayOptions[index]] = [
          { ...newCorrectPathwayOptions[index], result: ReasoningPathwayStepResult.PENDING }, 
          { ...temp, result: ReasoningPathwayStepResult.PENDING }
        ];
      }
    } else if (draggedItem) {
      if (newCorrectPathwayOptions[index]) {
        newUsedSteps.splice(
          newUsedSteps.findIndex(step => step.id === newCorrectPathwayOptions[index]?.id),
          1
        );
      }
      // Reset the new step to pending state
      newCorrectPathwayOptions[index] = { ...draggedItem, result: ReasoningPathwayStepResult.PENDING };
      newUsedSteps.push(draggedItem);
    }
    const newQuestionStates = [...questionStates];
    newQuestionStates[currentQuestionIndex] = {
      ...currentState,
      correctPathwayOptions: newCorrectPathwayOptions,
      usedSteps: newUsedSteps,
      part: currentState?.part ?? 'part1',
      pathwayId: currentState?.pathwayId,
      finalAnswer: currentState?.finalAnswer,
      errorAnalysisOptions: currentState?.errorAnalysisOptions ?? Array(numberOfSteps).fill(null) as (StepObject | null)[],
      errorAnalysisUsedSteps: currentState?.errorAnalysisUsedSteps ?? [],
      incorrectSteps: currentState?.incorrectSteps,
      part2Error: currentState?.part2Error,
      part3Error: currentState?.part3Error
    };
    setQuestionStates(newQuestionStates);
  };
  
  // NEW PART 1 FUNCTIONS - Identify correct pathway

  const handleSubmit = async (): Promise<void> => {
    posthog.capture("reason_trace_check_part_1_clicked");
    if (currentState?.correctPathwayOptions.every(step => step)) {
      const result = await part1Mutation.mutateAsync({
        attemptId: reasoningAttemptId,
        questionId: currentQuestion?.question.id ?? '',
        optionIds: currentState.correctPathwayOptions.map(option => option?.id ?? '')
      });

      const newQuestionStates = [...questionStates];
      const updatedOptions = currentState.correctPathwayOptions.map((option, index) => 
        option ? { ...option, result: result.results[index] } : null
      );

      const allStepsCorrect = result.results.every(
        result => result.result == ReasoningPathwayStepResult.CORRECT);

      const nextPart = allStepsCorrect ? 'part2' : 'part1'; 

      newQuestionStates[currentQuestionIndex] = {
        ...currentState,
        correctPathwayOptions: updatedOptions.map(option => 
          option ? {
            id: option.id,
            text: option.text,
            result: option.result?.result
          } : null
        ),
        part: nextPart,
        pathwayId: result.pathwayId
      };
      setQuestionStates(newQuestionStates);
    }
  };

  const reset = (): void => {
    posthog.capture("reason_trace_reset_part_1_clicked");
    const newQuestionStates = [...questionStates];
      newQuestionStates[currentQuestionIndex] = {
      correctPathwayOptions: Array(currentQuestion?.question.numberOfSteps).fill(null) as (StepObject | null)[],
      part: 'part1',
      usedSteps: [],
      pathwayId: undefined,
      finalAnswer: undefined,
      errorAnalysisOptions: Array(currentQuestion?.question.numberOfSteps).fill(null) as (StepObject | null)[],
      errorAnalysisUsedSteps: [],
      incorrectSteps: [],
      part2Error: undefined,
      part3Error: undefined
    };
    setQuestionStates(newQuestionStates);
  };

  // NEW PART 2 FUNCTIONS - Compute correct answer
  const form = useForm<Part2ComputeCorrectAnswerInput>({
    defaultValues: {
      answer: "",
      attemptId: reasoningAttemptId,
      questionId: currentQuestion?.question.id ?? '',
    },
    resolver: zodResolver(part2ComputeCorrectAnswerSchema),
  })

  const handlePart2Submit = async (values: Part2ComputeCorrectAnswerInput) => {
    posthog.capture("reason_trace_check_part_2_clicked", {
      answer: values.answer
    });
    setQuestionStates(questionStates.map(state => ({...state, part2Error: undefined})));
    const result = await part2Mutation.mutateAsync({
      attemptId: reasoningAttemptId,
      questionId: currentQuestion?.question.id ?? '',
      answer: values.answer
    });

    const newQuestionStates = [...questionStates];
    newQuestionStates[currentQuestionIndex] = {
      ...currentState!,
      part: result.correct ? 'part3' : 'part2',
      finalAnswer: values.answer,
      part2Error: result.correct ? undefined : 'Incorrect answer. Please try again.'
    };
    setQuestionStates(newQuestionStates);
  };

  // NEW PART 3 FUNCTIONS - Error analysis
  const handlePart3Drop = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    setIsDragging(false);
    posthog.capture("reason_trace_part_3_step_dropped");

    if (!draggedItem) return;

    const newQuestionStates = [...questionStates];
    const newErrorAnalysisOptions = [...currentState!.errorAnalysisOptions];
    const newErrorAnalysisUsedSteps = [...currentState!.errorAnalysisUsedSteps];

    if (newErrorAnalysisOptions[index]) {
      newErrorAnalysisUsedSteps.splice(
        newErrorAnalysisUsedSteps.findIndex(step => step.id === newErrorAnalysisOptions[index]?.id),
        1
      );
    }

    // Reset the new step to pending state
    newErrorAnalysisOptions[index] = { ...draggedItem, result: ReasoningPathwayStepResult.PENDING };
    newErrorAnalysisUsedSteps.push(draggedItem);

    newQuestionStates[currentQuestionIndex] = {
      ...currentState!,
      errorAnalysisOptions: newErrorAnalysisOptions,
      errorAnalysisUsedSteps: newErrorAnalysisUsedSteps
    };
    setQuestionStates(newQuestionStates);
  };

  const handlePart3Submit = async (): Promise<void> => {
    posthog.capture("reason_trace_check_part_3_clicked");
    if (currentState?.errorAnalysisOptions.every(step => step)) {
      const result = await part3Mutation.mutateAsync({
        attemptId: reasoningAttemptId,
        questionId: currentQuestion?.question.id ?? '',
        pathwayId: currentState.pathwayId ?? '',
        incorrectOptionIds: currentState.errorAnalysisOptions.map(option => option?.id ?? '')
      });

      const newQuestionStates = [...questionStates];
      const updatedOptions = currentState.errorAnalysisOptions.map((option, index) => 
        option ? { ...option, result: result.results[index] } : null);

      const allStepsCorrect = result.results.every(
        result => result.result == ReasoningPathwayStepResult.CORRECT);

      const nextPart = allStepsCorrect ? 'complete' : 'part3';

      newQuestionStates[currentQuestionIndex] = {
        ...currentState,
        errorAnalysisOptions: updatedOptions.map(option => 
          option ? {
            id: option.id,
            text: option.text,
            result: option.result?.result
          } : null
        ),
        part: nextPart,
        incorrectSteps: result.incorrectStepIndices
      };
      setQuestionStates(newQuestionStates);
    }
  }

  const resetPart3 = (): void => {
    posthog.capture("reason_trace_reset_part_3_clicked");
    const newQuestionStates = [...questionStates];
    newQuestionStates[currentQuestionIndex] = {
      ...currentState!,
      errorAnalysisOptions: Array<{ id: string; text: string } | null>(numberOfSteps).fill(null),
      errorAnalysisUsedSteps: []
    };
    setQuestionStates(newQuestionStates);
  };

  // Submission Functions

  const [submissionModalOpen, setSubmissionmodalOpen] = useState(false);

  const submitAssignment = async () => {
    const statuses = questionStates.map(state => state.part);
    await submissionMutation.mutateAsync({
      attemptId: reasoningAttemptId,
      statuses: statuses
    });
    setSubmissionmodalOpen(true);
  }

  const dueDatePassed = dueDate && new Date() > new Date(dueDate);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="grid grid-cols-2 w-full h-12 border-b-slate-200 border-b pl-8 pr-4">
        <div className="flex flex-row gap-4 flex-start mr-auto h-8 my-auto">
          <p className="text-lg font-semibold my-auto text-rose-700">
            Reason Trace
          </p>
          {dueDatePassed && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded my-auto">PAST DUE</span>
          )}
          <Separator orientation="vertical" className="h-6 w-px my-auto" />
          <p className="text-sm my-auto">
            {topic}
          </p>
        </div>
        <SubmissionModal open={submissionModalOpen} />
        <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
          { role !== Roles.Teacher ?
            <>
              {reasoningAttemptId.length > 0 &&
                <AssignmentTutorialModal 
                  topic={topic}
                  classroomId={classroomId} />
              }
              {!dueDatePassed && (
                <ConfirmationModal 
                  onSubmit={submitAssignment} 
                  loading={submissionMutation.isLoading}
                  />
              )}
            </>
            : 
            <>
              {reasoningAttemptId.length > 0 &&
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
      <div className="w-full mx-auto bg-rose-50">
        <Card className="m-16 px-12 py-8">
          <CardContent className="flex flex-col gap-8">
            {/* Part 1 */}
            <>
              {
                <div>
                  <p className="text-center my-auto">
                    <FormattedText text={currentQuestion?.question.topText ?? ''} />
                  </p>
                  {
                    currentQuestion?.question.topImage && (
                      <ImageModal
                        imageSrc={currentQuestion.question.topImage}
                        label="View Question Image"
                      />
                    )
                  }
                  <p className="text-center my-auto">Can you select the line of reasoning to solve this question?</p>
                </div>
              }
              <div className={`
                grid 
                gap-8`}>
                {/* Question Section */}
                {
                  currentQuestion?.question.questionText &&
                  <div className="space-y-4 h-full">
                    <p className="font-semibold text-center">Question</p>
                    <p className="text-center my-auto">
                      <FormattedText text={currentQuestion?.question.questionText ?? ''} />
                    </p>
                    <div className="mx-auto text-center text-muted-foreground">
                      {currentQuestion?.question.questionImage && (
                        <ImageModal
                          imageSrc={currentQuestion.question.questionImage}
                          label="View Question Image"
                        />
                      )}
                    </div>
                  </div>
                }

                {/* Reasoning Steps Section */}
                <div className="flex flex-col gap-4">
                  {
                    currentState?.part === 'part1' && (
                      <h3 className="font-semibold text-center">Identify the Correct Reasoning Pathway</h3>
                    )
                  }
                  <div className="h-full grid grid-rows-auto gap-2 max-w-screen-sm mx-auto w-full">
                    {currentState?.correctPathwayOptions.map((step, index) => (
                      currentState.part === 'part1' ? (
                        <DropZone
                          key={index}
                          index={index}
                          step={step}
                          isDragging={isDragging}
                          onDragOver={handleDragOver} 
                          onDrop={(e) => handleDrop(e, index)}
                          onDragStart={(e) => handleDragStart(e, step!, index)}
                          status={step?.result ?? ReasoningPathwayStepResult.PENDING}
                        />
                      ) : (
                        <StaticStep
                          key={index}
                          text={step?.text ?? ''}
                          status={step?.result ?? ReasoningPathwayStepResult.PENDING}
                        />
                      )
                    ))}
                    {currentState?.part === 'part1' && (
                      <button
                        onClick={reset}
                        className="flex w-full text-sm text-muted-foreground hover:text-gray-900"
                      >
                        <RotateCounterClockwiseIcon className="ml-auto w-4 h-4 mr-1" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Available Steps */}
              {
                currentState?.part === 'part1' &&
                <div className="px-8 rounded-lg">
                  <p className="font-semibold mb-4 mx-auto text-center">
                    Available Steps
                  </p>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-center">
                  {
                    currentQuestion?.question.answerOptions
                    .filter((option) => !currentState?.usedSteps.some(step => step.id === option.id))
                    .map((option) => (
                      <DraggableStep
                        key={option.id}
                        step={option.optionText}
                        onDragStart={(e) => handleDragStart(e, { id: option.id, text: option.optionText }, null)}
                      />
                    ))
                    }
                  </div>
                </div>
              }

              {/* Submit Buttons */}
              {currentState?.part === 'part1' && (
                <LoadingButton 
                  onClick={handleSubmit}
                  disabled={!currentState?.correctPathwayOptions.every(step => step) || part1Mutation.isLoading}
                  loading={part1Mutation.isLoading}
                  variant="link"
                  className="p-2 bottom-0 right-0 mt-auto ml-auto hover:no-underline">
                    <div className="flex flex-row gap-2">
                      <span className="my-auto font-semibold">
                        Check Pathway
                      </span>
                      <Image 
                        className="my-auto" 
                        src="/images/reason-trace.png" 
                        alt="Reason Trace" 
                        width={32} 
                        height={32} />
                    </div>
                </LoadingButton>
              )}

            </>

            {/* Part 2 - Compute the Correct Answer */}
            <>
              <AnimatePresence>
                {(currentState?.part === 'part2' || currentState?.part === 'part3' || currentState?.part === 'complete') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 border-t pt-6"
                  >
                    <div className="space-y-6">
                      <p className="text-center">Great! Now let's compute the correct answer using the pathway you identified.</p>
                      {currentState?.part === 'complete' ? (
                        <div className="flex flex-col items-center gap-4">
                          <p className="text-green-600 font-medium text-center">
                            Correct! The answer is: {currentState.finalAnswer}
                          </p>
                        </div>
                      ) : currentState?.part !== 'part2' ? (
                        <div className="flex flex-col items-center gap-4">
                          <p className="text-green-600 font-medium text-center">
                            Correct answer: {currentState.finalAnswer}
                          </p>
                        </div>
                      ) : (
                        <Form {...form}>
                          <form 
                            onSubmit={form.handleSubmit(handlePart2Submit)}
                            className="flex flex-col gap-4 items-center justify-center"
                          >
                            <div className="flex flex-row items-center justify-center">
                              <FormField
                                control={form.control}
                                name="answer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="text"
                                        placeholder="Enter your answer..."
                                        className="w-full"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              { currentQuestion?.question.correctAnswersUnit && (
                                <div className="text-sm mr-2">
                                  <FormattedText text={currentQuestion?.question.correctAnswersUnit} />
                                </div>
                              )}
                              <LoadingButton 
                                disabled={part2Mutation.isLoading} 
                                loading={part2Mutation.isLoading}
                                variant="link"
                                className="p-2 ml-auto hover:no-underline"
                              >
                                <div className="flex flex-row gap-2">
                                  <span className="my-auto font-semibold">
                                    Compute Answer
                                  </span>
                                  <Image 
                                    className="my-auto" 
                                    src="/images/reason-trace.png" 
                                    alt="Reason Trace" 
                                    width={32} 
                                    height={32} />
                                </div>
                              </LoadingButton>
                            </div>
                            {currentState?.part2Error && (
                              <p className="text-red-500 text-sm">{currentState.part2Error}</p>
                            )}
                          </form>
                        </Form>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>

            {/* Part 3 - Error Analysis */}
            <>
              <AnimatePresence>
                {(currentState?.part === 'part3' || currentState?.part === 'complete') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 border-t pt-6"
                  >
                    <div className="space-y-8">
                      <div className="text-center space-y-4">
                        <h3>Ira has computed an incorrect answer for the same question. Can you help identify the reasoning pathway that would lead to this incorrect answer?</h3>
                        <div className="p-2 max-w-md mx-auto">
                          {currentState?.part !== 'complete' && (
                            <>
                              <p className="font-medium">Incorrect Answer:</p>
                              <p className="text-lg font-semibold">
                                {currentQuestion?.question.answerText ? (
                                  <FormattedText text={currentQuestion.question.answerText} />
                                ) : (
                                  "No incorrect answer available"
                                )}
                                {currentQuestion?.question.correctAnswersUnit && (
                                  <span className="ml-1">
                                    <FormattedText text={currentQuestion?.question.correctAnswersUnit} />
                                  </span>
                                )}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className={`grid ${currentState.part === 'complete' ? 'grid-cols-[1fr_auto_1fr]' : 'grid-cols-1'} gap-8`}>
                        {currentState?.part === 'complete' && (
                          <>
                            <div className="space-y-2">
                              <p className="font-medium text-center text-green-700">✅ Correct Reasoning</p>
                              <p className="text-center text-sm text-green-600 mb-4">
                                Led to: {currentState.finalAnswer}
                                {currentQuestion?.question.correctAnswersUnit && (
                                  <span className="ml-1">
                                    <FormattedText text={currentQuestion?.question.correctAnswersUnit} />
                                  </span>
                                )}
                              </p>
                              {currentState.correctPathwayOptions.map((step, index) => (
                                <StaticStep
                                  key={index}
                                  text={step?.text ?? ''}
                                  status={ReasoningPathwayStepResult.CORRECT}
                                />
                              ))}
                            </div>
                            <div className="text-center text-lg flex items-center justify-center">
                              <span className="text-sm">vs</span>
                            </div>
                          </>
                        )}
                        
                        <div className="space-y-2">
                          {currentState?.part === 'complete' && (
                            <>
                              <p className="font-medium text-center text-red-700">
                                Incorrect Reasoning
                              </p>
                              <p className="text-center text-sm text-red-600 mb-4">
                                Led to: {currentQuestion?.question.answerText ? (
                                  <FormattedText text={currentQuestion.question.answerText} />
                                ) : (
                                  "No incorrect answer available"
                                )}
                                {currentQuestion?.question.correctAnswersUnit && (
                                  <span className="ml-1">
                                    <FormattedText text={currentQuestion?.question.correctAnswersUnit} />
                                  </span>
                                )}
                              </p>
                            </>
                          )}

                          <div className="max-w-screen-sm mx-auto space-y-2">
                            {currentState?.errorAnalysisOptions.map((step, index) => (
                              currentState?.part === 'part3' ? (
                              <DropZone
                                key={index}
                                index={index}
                                step={step}
                                isDragging={isDragging}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handlePart3Drop(e, index)}
                                onDragStart={(e) => handleDragStart(e, step!, index)}
                                status={step?.result ?? ReasoningPathwayStepResult.PENDING}
                              />
                              ) : (
                                <StaticStep
                                  key={index}
                                  text={step?.text ?? ''}
                                  status={step?.result ?? ReasoningPathwayStepResult.PENDING}
                                />
                              )
                            ))}
                            {
                              currentState?.part === 'part3' && (
                                <button
                                  onClick={resetPart3}
                                  className="mt-2 flex ml-auto items-center text-sm text-muted-foreground hover:text-gray-900"
                                >
                                  <RotateCounterClockwiseIcon className="w-4 h-4 mr-1" />
                                  Reset
                                </button>
                              )
                            }
                          </div>
                        </div>
                      </div>
                      {
                        currentState?.part === 'part3' && (
                          <div className="px-8 rounded-lg">
                            <h3 className="font-semibold mb-4 text-center">Available Steps</h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-center">
                              {currentQuestion?.question.answerOptions
                                .filter((option) => !currentState?.errorAnalysisUsedSteps.some(step => step.id === option.id))
                                .map((option) => (
                                  <DraggableStep
                                    key={option.id}
                                    step={option.optionText}
                                    onDragStart={(e) => handleDragStart(e, { id: option.id, text: option.optionText }, null)}
                                  />
                                ))}
                            </div>
                          </div>
                        )
                      } 
                    </div>
                    
                    {/* Submit Buttons */}
                    <div className="flex flex-row gap-2 justify-end">
                      {currentState?.part === 'part3' && (
                        <LoadingButton 
                          variant="link"
                          onClick={handlePart3Submit}
                          disabled={!currentState?.errorAnalysisOptions.every(step => step) || part3Mutation.isLoading}
                          loading={part3Mutation.isLoading}
                          className="p-2 ml-auto hover:no-underline">
                          <div className="flex flex-row gap-2">
                            <span className="my-auto font-semibold">
                              Check Pathway
                            </span>
                            <Image 
                              className="my-auto" 
                              src="/images/reason-trace.png" 
                              alt="Reason Trace" 
                              width={32} 
                              height={32} />
                          </div>
                        </LoadingButton>
                      )}
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </>

            {/* Navigation Arrows */}
            <div className="flex justify-between mt-8">
              <Pagination>
                <PaginationContent>
                  {
                    currentQuestionIndex > 0 && (
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => {
                            setCurrentQuestionIndex(prev => prev - 1)
                            posthog.capture("reason_trace_previous_question_clicked");
                          }}
                        />
                      </PaginationItem>
                    )
                  }
                  {
                    reasoningAssignment?.reasoningQuestions.map((question, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink 
                          onClick={() => {
                            setCurrentQuestionIndex(index)
                            posthog.capture("reason_trace_question_clicked", {
                              questionIndex: index
                            });
                          }}
                          isActive={currentQuestionIndex === index}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))
                  }
                  {
                    currentQuestionIndex < (reasoningAssignment?.reasoningQuestions?.length ?? 0) - 1 && (
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => {
                            setCurrentQuestionIndex(prev => prev + 1)
                            posthog.capture("reason_trace_next_question_clicked");
                          }}
                        />
                      </PaginationItem>
                    )
                  }
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReasoningStepsAssignment;