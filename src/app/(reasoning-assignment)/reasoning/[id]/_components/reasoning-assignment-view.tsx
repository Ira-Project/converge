'use client'
import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, RotateCounterClockwiseIcon } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Roles } from '@/lib/constants';
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
import { SubmitButton } from '@/components/submit-button';

interface ReasoningAssignmentViewProps {
  reasoningAssignment: RouterOutputs["reasoningAssignment"]["get"];
  reasoningAttemptId: string;
}

interface QuestionState {
  reasoningPathwayOptions: Array<{ id: string; text: string; result?: PathwayStepResult } | null>;
  part: 'identify' | 'review1' | 'review2';
  usedSteps: Array<{ id: string; text: string }>;
}

const ReasoningStepsAssignment: React.FC<ReasoningAssignmentViewProps> = ({ reasoningAssignment, reasoningAttemptId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    reasoningAssignment?.reasoningQuestions?.map((question) => ({
      reasoningPathwayOptions: Array(question.question.numberOfSteps).fill(null),
      part: 'identify',
      usedSteps: []
    })) ?? []
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<{ id: string; text: string } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const currentQuestion = reasoningAssignment?.reasoningQuestions?.[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];

  const part1Mutation = api.reasoning.part1EvaluatePathway.useMutation();

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
      part: currentState?.part ?? 'identify'
    };
    setQuestionStates(newQuestionStates);
  };
  
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
        result => result.result === PathwayStepResult.CORRECT
      );

      const nextPart = allStepsCorrect ? (
        currentState.part === 'identify' ? 'review1' : 
        currentState.part === 'review1' ? 'review2' : 
        'review2'
      ) : currentState.part;

      newQuestionStates[currentQuestionIndex] = {
        ...currentState,
        reasoningPathwayOptions: updatedOptions.map(option => 
          option ? {
            id: option.id,
            text: option.text,
            result: option.result?.result
          } : null
        ),
        part: nextPart
      };
      setQuestionStates(newQuestionStates);
      console.log('API Response:', result);
    }
  };

  const reset = (): void => {
    const newQuestionStates = [...questionStates];
    newQuestionStates[currentQuestionIndex] = {
      reasoningPathwayOptions: Array(currentQuestion?.question.numberOfSteps).fill(null) as ({ id: string; text: string; } | null)[],
      part: 'identify',
      usedSteps: []
    };
    setQuestionStates(newQuestionStates);
  };

  const submitAssignment = async () => {
    console.log("Submit");
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 w-full h-12 shadow-md fixed top-0 bg-white z-10">
        <Link href={`/classroom/1`} className="my-auto ml-2 justify-start">
          <Button variant="link" className="my-auto ml-2 justify-start">
          ← Back
          </Button>
        </Link>
        <p className="mr-auto justify-center align-items-middle align-items-center mx-auto text-lg font-semibold my-auto">
          {/* {assignmentName && `${assignmentName} - `} {topic} */}
          Reasoning Assignment
        </p>
        <SubmissionModal open={false} />
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
        <CardHeader>
          <CardTitle className="text-center">
            Can you identify the steps in this reasoning?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Question Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Question</h3>
              <p className="text-sm">
                <FormattedText text={currentQuestion?.question.questionText ?? ''} />
              </p>
            </div>

            {/* Reasoning Steps Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Reasoning Steps</h3>
              <div className="space-y-2">
                {currentState?.reasoningPathwayOptions.map((step, index) => (
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
                ))}
                <button
                  onClick={reset}
                  className="mt-2 flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <RotateCounterClockwiseIcon className="w-4 h-4 mr-1" />
                  Reset
                </button>
              </div>
            </div>

            {/* Answer Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Answer</h3>
              <p className="text-sm">
                <FormattedText text={currentQuestion?.question.answerText ?? ''} />
              </p>
            </div>
          </div>

          {/* Available Steps */}
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

          {/* Submit Buttons */}
          {currentState?.part === 'identify' && (
            <LoadingButton 
              onClick={handleSubmit}
              disabled={!currentState?.reasoningPathwayOptions.every(step => step) || part1Mutation.isLoading}
              loading={part1Mutation.isLoading}
              className="w-full mt-4"
            >
            Submit
            </LoadingButton>
          )}

          {/* Review Section */}
          <AnimatePresence>
            {(currentState?.part === 'review1' || currentState?.part === 'review2') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 border-t pt-6"
              >
                {/* First Review */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">First Review</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <h4 className="font-medium">Your Steps:</h4>
                      {currentState.reasoningPathwayOptions.map((step, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          {step?.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Second Review */}
                <div className="space-y-6 border-t pt-6">
                  <h3 className="font-semibold text-lg">Second Review</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <h4 className="font-medium">Your Steps:</h4>
                      {currentState.reasoningPathwayOptions.map((step, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          {step?.text ?? ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Continue button only shown during first review */}
                {currentState.part === 'review1' && (
                  <SubmitButton 
                    onClick={handleSubmit}
                    className="w-full mt-4"
                  >
                    Continue to Second Review
                  </SubmitButton>
                )}
              </motion.div>
            )}
          </AnimatePresence>

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