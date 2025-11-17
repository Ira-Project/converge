'use client';

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { QuestionAccordionItem } from "@/components/question-accordion-item";
import { ActivityType, QuestionStatus, Roles } from "@/lib/constants";
import { supabaseClient } from "@/lib/supabaseClient";
import { Suspense, useEffect, useReducer, useState } from "react";
import { type AssignmentState, type AssignmentUpdateActions, AssignmentUpdateActionType } from "@/lib/constants";
import { questionReducer } from "@/reducers/assignment-reducer";
import { explainSchema } from "@/server/api/routers/learnByTeachingActivity/explanation/explanation.input";
import { generateId } from "lucia";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingButton } from "@/components/loading-button";
import dynamic from 'next/dynamic';
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import posthog from "posthog-js";
import { AssignActivityModal } from '@/app/(main)/[classroomId]/activity-preview/[assignmentId]/_components/assign-activity-modal';
import { RichInput } from "@/app/(main)/activity/[activityId]/learn-by-teaching/live/_components/rich-input";
import AssignmentTutorialModal from "@/app/(main)/activity/[activityId]/learn-by-teaching/live/_components/explain-assignment-tutorial-modal";


const FormulaInput = dynamic(() => import('@/app/(main)/activity/[activityId]/learn-by-teaching/live/_components/formula-input'), { ssr: false });

interface Props {
  topic: string;
  topicId: string;
  questions: {
    id: string,
    question: string,
    image?: string | null,
  }[];
  assignmentId: string;
  assignmentName: string;
  classroomId: string;
  testAttemptId: string;
  role: Roles;
}

export const LearnByTeachingPreviewView = ({ topic, topicId, questions, testAttemptId, assignmentId, assignmentName, classroomId, role }: Props) => {
  const explanationMutation = api.explanation.explain.useMutation();

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
    console.log("Setting up subscription with channel:", channelName);
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
          console.log("Received realtime payload:", payload);
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
        console.log("Subscription status:", status);
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          console.log("Successfully subscribed to realtime updates");
          return;
        }
      });

    return () => {
      console.log("Cleaning up subscription");
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
    console.log("Form submitted with values:", values);
    console.log("Is subscribed:", isSubscribed);
    console.log("Mutation loading:", explanationMutation.isLoading);
    
    posthog.capture("learn_by_teaching_explanation_submitted");
    questionsStateDispatch({
      type: AssignmentUpdateActionType.SET_LOADING,
    })

    try {
      await explanationMutation.mutateAsync({
        explanation: values.explanation,
        formula: values.formula,
        channelName: channelName,
        assignmentId: assignmentId,
        testAttemptId: testAttemptId,
      });
      console.log("Explanation submitted successfully");
    } catch (error) {
      console.error("Error submitting explanation:", error);
    }
  });


  return (
    <div className="flex flex-col">
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
            
            {/* Row 1, Col 2: Assign Activity Button */}
            <div className="flex justify-end">
              {role == Roles.Teacher && (
                <AssignActivityModal
                  classroomId={classroomId}
                  assignmentId={assignmentId}
                  activityType={ActivityType.LearnByTeaching}
                  activityName={assignmentName}
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
            
            {/* Row 2, Col 2: Tutorial Modal */}
            <div className="flex justify-end">
              {role == Roles.Teacher && (
                <AssignmentTutorialModal
                  isMobileLayout={true}
                  topic={topic}
                  classroom={{
                    name: "Home",
                    id: classroomId ?? "",
                  }}
                />
              )}
            </div>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 w-full h-12">
            <div className="flex flex-row gap-4 flex-start mr-auto h-8 my-auto">
              <p className="text-lg font-semibold my-auto text-amber-700">
                Learn by Teaching
              </p>
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded my-auto">PREVIEW</span>
              <Separator orientation="vertical" className="h-6 w-px my-auto" />
              <p className="text-sm my-auto">
                {topic}
              </p>
            </div>
            <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
              {role == Roles.Teacher &&
                <>
                  <AssignmentTutorialModal
                    isMobileLayout={false}
                    topic={topic}
                    classroom={{
                      name: "Home",
                      id: classroomId ?? "",
                    }}
                  />
                  <AssignActivityModal
                    classroomId={classroomId}
                    assignmentId={assignmentId}
                    activityType={ActivityType.LearnByTeaching}
                    activityName={assignmentName}
                    topicId={topicId}
                  />
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
                  updateValue={(value: string) => form.setValue('explanation', value)} />
              </div>
              <div className="lg:mb-4 lg:overflow-scroll">
                <FormulaInput
                  formulaList={form.getValues('formula')}
                  updateValue={(value: string[]) => form.setValue('formula', value)} />
              </div>
              <div className="w-full flex flex-col gap-2 lg:grid lg:grid-cols-[1fr__auto]">
                {
                  form.formState.errors.explanation ?
                    <ul className="list-disc rounded-sm bg-destructive/40 p-2 text-[0.8rem] font-medium lg:truncate lg:text-ellipsis lg:mr-2">
                      {form.formState.errors.explanation.message}
                    </ul>
                    :
                    explanationMutation.error &&
                    <ul className="list-disc rounded-sm bg-destructive/40 p-2 text-[0.8rem] font-medium lg:truncate lg:text-ellipsis lg:mr-2">
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
                        {!isSubscribed ? "Connecting..." : "Explain to Ira"}
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
                <Suspense fallback={<Skeleton className="w-full h-16" />}>
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