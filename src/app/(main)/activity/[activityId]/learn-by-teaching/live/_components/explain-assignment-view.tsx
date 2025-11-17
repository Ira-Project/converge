'use client';

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { QuestionAccordionItem } from "@/components/question-accordion-item";
import { QuestionStatus, Roles } from "@/lib/constants";
import { supabaseClient } from "@/lib/supabaseClient";
import { Suspense, useEffect, useReducer, useState } from "react";
import { type AssignmentState, type AssignmentUpdateActions, AssignmentUpdateActionType } from "@/lib/constants";
import { questionReducer } from "@/reducers/assignment-reducer";
import { explainSchema } from "@/server/api/routers/learnByTeachingActivity/explanation/explanation.input";
import { generateId } from "lucia";
import { Skeleton } from "@/components/ui/skeleton";
import { RichInput } from "./rich-input";
import { LoadingButton } from "@/components/loading-button";
import SubmissionModal from "./submission-modal";
import ConfirmationModal from "./explain-confirmation-modal";
import AssignmentTutorialModal from "./explain-assignment-tutorial-modal";
import dynamic from 'next/dynamic';
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import AssignmentShareModal from "./explain-assignment-share-modal";
import posthog from "posthog-js";

const FormulaInput = dynamic(() => import('./formula-input'), { ssr: false });

interface Props {
  activityId: string
  topic: string;
  questions: {
    id: string,
    question: string,
    image?: string | null,
  }[];
  dueDate?: Date;
  assignmentId: string;
  isLive: boolean;
  classroom?: {
    name: string;
    id: string;
  } | null;
  timeLimit?: number | null;
  testAttemptId: string;
  role: Roles;
}

export const AssignmentView = ({ activityId, topic, questions, testAttemptId, assignmentId, classroom, isLive, dueDate, role }: Props) => {
  const explanationMutation = api.explanation.explain.useMutation();
  const submissionMutation = api.learnByTeaching.submit.useMutation();

  const initialState: AssignmentState = {
    validNodeIds: [],
    questions: questions.map((question) => {
      return {
        id: question.id,
        status: QuestionStatus.UNANSWERED,
        questionText: question.question,
        questionImage: question.image,
        computedAnswerText: "",
        image: "",
        imageHeight: undefined,
        imageWidth: undefined,
        working: "",
        workingComplete: false,
      };
    }),
  };

  const [assignmentState, questionsStateDispatch] = useReducer(questionReducer, initialState);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [channelName] = useState<string>(generateId(21));

  useEffect(() => {
    const channelA = supabaseClient.channel('table-db-changes')
    channelA
      .on(
        'postgres_changes',
        {
          schema: 'public',
          event: 'INSERT',
          table: 'ira_project_actions',
          filter: 'channel_id=eq.' + channelName, 
        },
        (payload) => {
          const actionPayload = payload.new.payload as JSON;
          const actionType = payload.new.actionType as AssignmentUpdateActions;
          const action = {
            type: actionType,
            payload: actionPayload,
          } as unknown as AssignmentUpdateActions;
          questionsStateDispatch(action)
        }
      )
      .subscribe((status) => {
        if(status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          return;
        }
      });

    return () => {
      void supabaseClient.removeChannel(channelA)
    }
  }, [supabaseClient, channelName]);
  
  const form = useForm({
    defaultValues: {
      explanation: "",
      formula: [""],
      channelName: channelName,
      testAttemptId: testAttemptId,
      assignmentId: assignmentId, 
    },
    resolver: zodResolver(explainSchema),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    posthog.capture("learn_by_teaching_explanation_submitted");
    questionsStateDispatch({
      type: AssignmentUpdateActionType.SET_LOADING,
    })

    await explanationMutation.mutateAsync({
      explanation: values.explanation,
      formula: values.formula,
      channelName: channelName,
      assignmentId: assignmentId,
      testAttemptId: testAttemptId,
    });
  });

  const [submissionModalOpen, setSubmissionmodalOpen] = useState(false);

  const submitAssignment = async () => {
    await submissionMutation.mutateAsync({
      testAttemptId: testAttemptId,
    });
    setSubmissionmodalOpen(true);
  }

  const dueDatePassed = dueDate && new Date() > new Date(dueDate);

  return (
    <div className="flex flex-col">
      <SubmissionModal open={submissionModalOpen} />
      {/* Header */}
      <div className="w-full border-b border-slate-200 bg-white">
        <div className="px-4 sm:px-8 py-4 sm:py-3">
          {/* Mobile: 2x2 Grid Layout */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:hidden">
            {/* Row 1, Col 1: Learn by Teaching Title */}
            <div className="flex items-center">
              <h1 className="text-base font-semibold text-amber-700 whitespace-nowrap">
                Learn by Teaching
              </h1>
            </div>
            
            {/* Row 1, Col 2: Submit Activity Button */}
            <div className="flex justify-end">
              { role !== Roles.Teacher ? (
                // Student: Submit button (if not past due)
                !dueDatePassed && (
                  <ConfirmationModal 
                    onSubmit={submitAssignment} 
                    loading={submissionMutation.isLoading}
                    />
                )
              ) : (
                // Teacher: Share button
                <AssignmentShareModal 
                  activityId={activityId}
                  isLive={isLive} />
              )}
            </div>
            
            {/* Row 2, Col 1: Topic + Status Badge */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-700 truncate">
                {topic}
              </p>
              {dueDatePassed && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium">
                  PAST DUE
                </span>
              )}
            </div>
            
            {/* Row 2, Col 2: Help Modal */}
            <div className="flex justify-end">
              { testAttemptId.length > 0 && (
                <AssignmentTutorialModal 
                  topic={topic}
                  classroom={classroom}
                  isMobileLayout={true} />
              )}
            </div>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 w-full h-12">
            <div className="flex flex-row gap-4 flex-start mr-auto h-8 my-auto">
              <p className="text-lg font-semibold my-auto text-amber-700">
                Learn by Teaching
              </p>
              {dueDatePassed && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded my-auto">PAST DUE</span>
              )}
              <Separator orientation="vertical" className="h-6 w-px my-auto" />
              <p className="text-sm my-auto">
                {topic}
              </p>
                         </div>
             <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
              { role !== Roles.Teacher ?
                <>
                  { testAttemptId.length > 0 && 
                    <AssignmentTutorialModal 
                      topic={topic}
                      classroom={classroom}
                      isMobileLayout={false} />
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
                  { testAttemptId.length > 0 && 
                    <AssignmentTutorialModal 
                      topic={topic}
                      classroom={classroom}
                      isMobileLayout={false} />
                  }
                  <AssignmentShareModal 
                    activityId={activityId}
                    isLive={isLive} />
                </>
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col lg:grid lg:grid-cols-[0.9fr_1.1fr] min-h-[calc(100vh-80px)] lg:h-[calc(100vh-48px)]">
        {/* Explanation Section */}
        <div className="flex flex-col gap-4 w-full px-4 sm:px-8 py-4 sm:py-8 border-b lg:border-b-0 lg:border-r border-slate-200 bg-amber-50 lg:overflow-y-hidden">
            <Form {...form}>
              <form 
                onSubmit={onSubmit} 
                className="h-full flex flex-col lg:grid lg:grid-rows-[32px_1fr_auto_32px] gap-4 lg:gap-0">
                <p className="font-medium text-sm">Enter Explanation Below</p>
                <div className="flex-1 lg:mb-8 bg-white min-h-[200px] lg:max-h-full lg:overflow-hidden">
                  <RichInput 
                    updateValue={(value: string) => form.setValue('explanation', value)}/>
                </div>
                <div className="lg:mb-4 lg:overflow-scroll">
                  <FormulaInput 
                    formulaList={form.getValues('formula')}
                    updateValue={(value: string[]) => form.setValue('formula', value)}/>
                </div>
                <div className="w-full flex flex-col gap-2 lg:grid lg:grid-cols-[1fr__auto]">
                  {
                    form.formState.errors.explanation ?
                    <ul className="list-disc rounded-sm bg-destructive/40 p-2 text-[0.8rem] font-medium lg:truncate lg:text-ellipsis lg:mr-2">
                      {form.formState.errors.explanation.message}
                    </ul>
                    : 
                    explanationMutation.error &&
                    <ul className="list-disc rounded-lș bg-destructive/40 p-2 text-[0.8rem] font-medium lg:truncate lg:text-ellipsis lg:mr-2">
                      {explanationMutation.error.message}
                    </ul>
                  }
                  <div className="w-full lg:ml-auto flex flex-row justify-center lg:justify-end">
                    <LoadingButton 
                      variant="link"
                      dontShowChildrenWhileLoading
                      disabled={explanationMutation.isLoading || !isSubscribed} 
                      loading={explanationMutation.isLoading || !isSubscribed}
                      className="p-2 lg:bottom-0 lg:right-0 lg:mt-auto lg:ml-auto hover:no-underline"
                      type="submit">
                        <div className="flex flex-row gap-2">
                        <span className="my-auto font-semibold">
                          Explain to Ira
                        </span>
                        <Image 
                          className="my-auto" 
                          src="/images/learn-by-teaching.png" 
                          alt="Learn By Teaching" 
                          width={32} 
                          height={32} />
                        </div>
                    </LoadingButton>
                  </div>
                </div>
              </form>
            </Form>
        </div>
        
        {/* Questions Section */}
        <div className="flex flex-col gap-4 w-full px-4 sm:px-8 py-4 sm:py-8 min-h-[400px] lg:h-full lg:overflow-y-hidden">
          <div className="flex flex-col gap-2"> 
            <p className="font-medium text-sm"> Questions </p>
            <p className="text-sm text-muted-foreground"> Ira will answer these questions based on your explanation </p>
          </div>
          <ScrollArea className="flex-1 lg:grid lg:overflow-y-auto lg:max-h-full">
            <div className="flex flex-col gap-4">
              <Accordion type="single" collapsible className="w-full">
                <Suspense fallback={<Skeleton className="w-full h-16"/>}>
                  {
                    assignmentState.questions.map((question) => (
                      <QuestionAccordionItem 
                        status={question.status}
                        key={question.id}
                        id={question.id.toString()}
                        questionText={question.questionText}
                        questionImage={question.questionImage ?? undefined}
                        //answerText={question.answerText} 
                        image={question.image}
                        imageHeight={question.imageHeight}
                        imageWidth={question.imageWidth}
                        workingText={question.working !== "" ? question.working : undefined}
                        workingComplete={question.workingComplete}
                        computedAnswerText={question.computedAnswerText}
                        />
                    ))
                  }
                </Suspense>
              </Accordion>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}