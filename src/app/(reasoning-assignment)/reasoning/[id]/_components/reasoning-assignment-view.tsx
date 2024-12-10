'use client'
import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, RotateCounterClockwiseIcon } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SubmissionModal from './submission-modal';
import AssignmentTutorialModal from '@/app/(assignment)/assignment/[id]/_components/assignment-tutorial-modal';
import ConfirmationModal from './confirmation-modal';
import AssignmentPublishModal from '@/app/(assignment)/assignment/[id]/_components/assignment-publish-modal';
import DropZone from './drop-zone';
import DraggableStep from './draggable-step';
import { type RouterOutputs } from '@/trpc/shared';
import FormattedText from '@/components/formatted-text';
import { api } from "@/trpc/react";
import { PathwayStepResult } from '@/server/api/routers/reasoning/reasoning.service';
import { LoadingButton } from '@/components/loading-button';
import StaticStep from './static-step';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Part3FinalCorrectAnswerInput, part3FinalCorrectAnswerSchema } from '@/server/api/routers/reasoning/reasoning.input';
import { Input } from '@/components/ui/input';

interface ReasoningAssignmentViewProps {
  reasoningAssignment: RouterOutputs["reasoningAssignment"]["get"];
  reasoningAttemptId: string;
}

interface StepObject {
  id: string;
  text: string;
  result?: PathwayStepResult
}

interface QuestionState {
  reasoningPathwayOptions: Array<StepObject | null>;
  part: 'part1' | 'part2' | 'part3' | 'complete';
  usedSteps: Array<{ id: string; text: string }>;
  part2Steps: Array<StepObject | null>;
  part2UsedSteps: Array<{ id: string; text: string }>;
  pathwayId?: string;
  incorrectSteps?: number[];
  part3Error?: string;
}

const ReasoningStepsAssignment: React.FC<ReasoningAssignmentViewProps> = ({ reasoningAssignment, reasoningAttemptId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    reasoningAssignment?.reasoningQuestions?.map((question) => ({
      reasoningPathwayOptions: Array(question.question.numberOfSteps).fill(null),
      part: 'part1',
      usedSteps: [],
      part2Steps: Array(question.question.numberOfSteps).fill(null),
      part2UsedSteps: []
    })) ?? []
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<{ id: string; text: string } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const currentQuestion = reasoningAssignment?.reasoningQuestions?.[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];
  const numberOfSteps = currentQuestion?.question.numberOfSteps ?? 0;

  const part1Mutation = api.reasoning.part1EvaluatePathway.useMutation();
  const part2Mutation = api.reasoning.part2CorrectPathway.useMutation();
  const part3Mutation = api.reasoning.part3FinalCorrectAnswer.useMutation();
  const submissionMutation = api.reasoningAssignment.submitAttempt.useMutation();


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

    const newReasoningPathwayOptions = [...currentState!.reasoningPathwayOptions];
    const newUsedSteps = [...currentState!.usedSteps];

    if (draggedIdx !== null) {
      const temp = newReasoningPathwayOptions[draggedIdx];
      if (temp && newReasoningPathwayOptions[index]) {
        [newReasoningPathwayOptions[draggedIdx], newReasoningPathwayOptions[index]] = [newReasoningPathwayOptions[index], temp];
      }
    } else if (draggedItem) {
      if (newReasoningPathwayOptions[index]) {
        newUsedSteps.splice(
          newUsedSteps.findIndex(step => step.id === newReasoningPathwayOptions[index]?.id),
          1
        );
      }
      newReasoningPathwayOptions[index] = draggedItem;
      newUsedSteps.push(draggedItem);
    }
    const newQuestionStates = [...questionStates];
    newQuestionStates[currentQuestionIndex] = {
      ...currentState,
      reasoningPathwayOptions: newReasoningPathwayOptions,
      usedSteps: newUsedSteps,
      part: currentState?.part ?? 'part1',
      part2Steps: Array<StepObject | null>(numberOfSteps).fill(null),
      part2UsedSteps: []
    };
    setQuestionStates(newQuestionStates);
  };
  
  // PART 1 FUNCTIONS

  const handleSubmit = async (): Promise<void> => {
    if (currentState?.reasoningPathwayOptions.every(step => step)) {
      const result = await part1Mutation.mutateAsync({
        attemptId: reasoningAttemptId,
        questionId: currentQuestion?.question.id ?? '',
        optionIds: currentState.reasoningPathwayOptions.map(option => option?.id ?? '')
      });

      const newQuestionStates = [...questionStates];
      const updatedOptions = currentState.reasoningPathwayOptions.map((option, index) => 
        option ? { ...option, result: result.results[index] } : null
      );

      const allStepsCorrect = result.results.every(
        result => result.result == PathwayStepResult.CORRECT);

      const nextPart = allStepsCorrect ? 'part2' : 'part1'; 

      newQuestionStates[currentQuestionIndex] = {
        ...currentState,
        reasoningPathwayOptions: updatedOptions.map(option => 
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
    const newQuestionStates = [...questionStates];
    newQuestionStates[currentQuestionIndex] = {
      reasoningPathwayOptions: Array(currentQuestion?.question.numberOfSteps).fill(null) as (StepObject | null)[],
      part: 'part1',
      usedSteps: [],
      part2Steps: Array<StepObject | null>(numberOfSteps).fill(null),
      part2UsedSteps: []
    };
    setQuestionStates(newQuestionStates);
  };

  // PART 2 FUNCTIONS
  const handlePart2Drop = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    setIsDragging(false);

    if (!draggedItem) return;

    const newQuestionStates = [...questionStates];
    const newPart2Steps = [...currentState!.part2Steps];
    const newPart2UsedSteps = [...currentState!.part2UsedSteps];

    if (newPart2Steps[index]) {
      newPart2UsedSteps.splice(
        newPart2UsedSteps.findIndex(step => step.id === newPart2Steps[index]?.id),
        1
      );
    }

    newPart2Steps[index] = draggedItem;
    newPart2UsedSteps.push(draggedItem);

    newQuestionStates[currentQuestionIndex] = {
      ...currentState!,
      part2Steps: newPart2Steps,
      part2UsedSteps: newPart2UsedSteps
    };
    setQuestionStates(newQuestionStates);
  };

  const handlePart2Submit = async (): Promise<void> => {
    if (currentState?.part2Steps.every(step => step)) {
      const result = await part2Mutation.mutateAsync({
        attemptId: reasoningAttemptId,
        questionId: currentQuestion?.question.id ?? '',
        optionIds: currentState.part2Steps.map(option => option?.id ?? ''),
        pathwayId: currentState.pathwayId ?? ''
      });

      const incorrectIndices = result.incorrectOptions

      const newQuestionStates = [...questionStates];
      const updatedOptions = currentState.part2Steps.map((option, index) => 
        option ? { ...option, result: result.results[index] } : null);

      const allStepsCorrect = result.results.every(
        result => result.result == PathwayStepResult.CORRECT);

      const nextPart = allStepsCorrect ? 'part3' : 'part2';

      newQuestionStates[currentQuestionIndex] = {
        ...currentState,
        part2Steps: updatedOptions.map(option => 
          option ? {
            id: option.id,
            text: option.text,
            result: option.result?.result
          } : null
        ),
        part: nextPart,
        incorrectSteps: incorrectIndices
      };
      setQuestionStates(newQuestionStates);
    }
  }

  const resetPart2 = (): void => {
    const newQuestionStates = [...questionStates];
    newQuestionStates[currentQuestionIndex] = {
      ...currentState!,
      part2Steps: Array<{ id: string; text: string } | null>(numberOfSteps).fill(null),
      part2UsedSteps: []
    };
    setQuestionStates(newQuestionStates);
  };

  // PART 3 FUNCTIONS
  const form = useForm<Part3FinalCorrectAnswerInput>({
    defaultValues: {
      answer: "",
      attemptId: reasoningAttemptId,
      questionId: currentQuestion?.question.id ?? '',
    },
    resolver: zodResolver(part3FinalCorrectAnswerSchema),
  })

  const handlePart3Submit = async (values: Part3FinalCorrectAnswerInput) => {
    setQuestionStates(questionStates.map(state => ({...state, part3Error: undefined})));
    const result = await part3Mutation.mutateAsync({
      attemptId: reasoningAttemptId,
      questionId: currentQuestion?.question.id ?? '',
      answer: values.answer
    });

    const newQuestionStates = [...questionStates];
    newQuestionStates[currentQuestionIndex] = {
      ...currentState!,
      part: result.correct ? 'complete' : 'part3',
      part3Error: result.correct ? undefined : 'Incorrect answer. Please try again.'
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

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 w-full h-12 shadow-md fixed top-0 bg-white z-10">
        <Link href={`/classroom/${reasoningAssignment?.classroom?.id}`} className="my-auto ml-2 justify-start">
          <Button variant="link" className="my-auto ml-2 justify-start">
          ← Back
          </Button>
        </Link>
        <p className="mr-auto justify-center align-items-middle align-items-center mx-auto text-lg font-semibold my-auto">
          {reasoningAssignment?.topic?.name} - Reasoning
        </p>
        <SubmissionModal open={submissionModalOpen} />
        <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
          { true ?
            <>
              <AssignmentTutorialModal 
                topic={"Hello"}
                classroom={{name: "Hello", id: "1"}}
                assignmentName={"Hello"} />
              <ConfirmationModal 
                onSubmit={submitAssignment} 
                loading={false}
                />
            </>
            : 
            <>
              <p className="text-sm font-semibold my-auto">
                This is a preview
              </p>
              <AssignmentTutorialModal 
                topic={"Hello"}
                classroom={{name: "Hello", id: "1"}}
                assignmentName={"Hello"} />
              {
                true && 
                <AssignmentPublishModal 
                  assignmentId={"1"} />
              }
            </>
          }
        </div>
      </div>

    <div className="w-full max-w-[80%] mx-auto p-6 mt-12">
      <Card>
        <CardContent className="space-y-8">

          {/* Part 1 */}
          <>
            <h3 className="text-center text-lg my-4">
              Ira has computed an <strong>incorrect</strong> answer to a question as shown below. Can you select the line of reasoning Ira took to arrive at the answer?
            </h3>
            <div className="grid grid-cols-3 gap-8">
              {/* Question Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-center">Question</h3>
                <p className="text-center leading-relaxed">
                  <FormattedText text={currentQuestion?.question.questionText ?? ''} />
                </p>
              </div>

              {/* Reasoning Steps Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-center">Reasoning Steps</h3>
                <div className="space-y-2">
                  {currentState?.reasoningPathwayOptions.map((step, index) => (
                    currentState.part === 'part1' ? (
                      <DropZone
                        key={index}
                        index={index}
                        step={step}
                        isDragging={isDragging}
                        onDragOver={handleDragOver} 
                        onDrop={(e) => handleDrop(e, index)}
                        onDragStart={(e) => handleDragStart(e, step!, index)}
                        status={step?.result ?? PathwayStepResult.PENDING}
                      />
                    ) : (
                      <StaticStep
                        key={index}
                        text={step?.text ?? ''}
                        status={step?.result ?? PathwayStepResult.PENDING}
                      />
                    )
                  ))}
                  {currentState?.part === 'part1' && (
                    <button
                      onClick={reset}
                      className="mt-2 flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      <RotateCounterClockwiseIcon className="w-4 h-4 mr-1" />
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Answer Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-center">Answer</h3>
                <p className="text-lg text-center leading-relaxed">
                  <FormattedText text={currentQuestion?.question.answerText ?? ''} />
                </p>
              </div>
            </div>

            {/* Available Steps */}
            {
              currentState?.part === 'part1' &&
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-4">Available Steps</h3>
                <div className="grid grid-cols-2 gap-2">
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
                disabled={!currentState?.reasoningPathwayOptions.every(step => step) || part1Mutation.isLoading}
                loading={part1Mutation.isLoading}
                className="w-full mt-4"
              >
              Submit
              </LoadingButton>
            )}

          </>

          {/* Part 2 */}

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
                    <h3 className="text-center text-lg">Fix Ira’s mistake by replacing the incorrect option with the correct reasoning pathway.</h3>
                    <div className={`grid ${currentState.part === 'part3' ? 'grid-cols-[1fr_auto_1fr]' : 'grid-cols-2'} gap-8`}>
                      <div className="space-y-2">
                        <h4 className="font-medium">Ira's Reasoning:</h4>
                        {currentState.reasoningPathwayOptions.map((step, index) => (
                          <StaticStep
                            key={index}
                            text={step?.text ?? ''}
                            status={
                              currentState.part === 'part3' 
                              && currentState.incorrectSteps?.includes(index) 
                              ? PathwayStepResult.WRONG
                              : PathwayStepResult.PENDING
                            }
                          />
                        ))}
                      </div>
                      {
                        currentState.part === 'part3' && (
                          <div className="text-center text-lg flex items-center justify-center">
                            <ArrowRightIcon className="w-6 h-6" />
                          </div>
                        )
                      }
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Correct Reasoning:</h4>
                        {currentState.part2Steps.map((step, index) => (
                          currentState.part === 'part2' ? (
                          <DropZone
                            key={index}
                            index={index}
                            step={step}
                            isDragging={isDragging}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handlePart2Drop(e, index)}
                            onDragStart={(e) => handleDragStart(e, step!, index)}
                            status={step?.result ?? PathwayStepResult.PENDING}
                          />
                          ) : (
                            <StaticStep
                              key={index}
                              text={step?.text ?? ''}
                              status={step?.result ?? PathwayStepResult.PENDING}
                            />
                          )
                        ))}
                        {
                          currentState.part === 'part2' && (
                            <button
                              onClick={resetPart2}
                              className="mt-2 flex items-center text-sm text-gray-600 hover:text-gray-900"
                            >
                              <RotateCounterClockwiseIcon className="w-4 h-4 mr-1" />
                              Reset
                            </button>
                          )
                        }
                      </div>
                    </div>
                    {
                      currentState.part === 'part2' && (
                        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-semibold mb-4">Available Steps</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {currentQuestion?.question.answerOptions
                              .filter((option) => !currentState?.part2UsedSteps.some(step => step.id === option.id))
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
                  {currentState?.part === 'part2' && (
                    <LoadingButton 
                      onClick={handlePart2Submit}
                      disabled={!currentState?.reasoningPathwayOptions.every(step => step) || part2Mutation.isLoading}
                      loading={part2Mutation.isLoading}
                      className="w-full mt-4"
                    >
                    Submit
                    </LoadingButton>
                  )}


                </motion.div>
              )}
            </AnimatePresence>

          </>

          {/* Part 3 */}

          <>
            <AnimatePresence>
              {(currentState?.part === 'part3' || currentState?.part === 'complete') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 border-t pt-6"
                >
                  <div className="space-y-6">
                    <h3 className="text-center text-lg">Now let's compute the correct answer.</h3>
                    {currentState?.part === 'complete' ? (
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-green-600 font-medium text-center">
                          🎉 Correct! The answer is: {form.getValues().answer}
                        </p>
                      </div>
                    ) : (
                      <Form {...form}>
                        <form 
                          onSubmit={form.handleSubmit(handlePart3Submit)}
                          className="flex flex-col gap-4 items-center justify-center"
                        >
                          <div className="flex flex-row gap-4 items-center justify-center">
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
                            <LoadingButton 
                              disabled={part3Mutation.isLoading} 
                              loading={part3Mutation.isLoading}
                              type="submit"
                            >
                              Submit
                            </LoadingButton>
                          </div>
                          {currentState?.part3Error && (
                            <p className="text-red-500 text-sm">{currentState.part3Error}</p>
                          )}
                        </form>
                      </Form>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>

          {/* Navigation Arrows */}
          <div className="flex justify-between mt-8">
            <button 
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
              className={`p-2 rounded-full transition-colors ${
                currentQuestionIndex === 0 
                  ? 'text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={currentQuestionIndex === (reasoningAssignment?.reasoningQuestions?.length ?? 0) - 1}
              className={`p-2 rounded-full transition-colors ${
                currentQuestionIndex === (reasoningAssignment?.reasoningQuestions?.length ?? 0) - 1
                  ? 'text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ArrowRightIcon className="w-6 h-6" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default ReasoningStepsAssignment;