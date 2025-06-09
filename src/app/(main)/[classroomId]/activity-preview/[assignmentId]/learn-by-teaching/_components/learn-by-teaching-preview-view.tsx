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
import { AssignActivityModal } from '@/app/(main)/activity-preview/_components/assign-activity-modal';
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
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error("Subscription failed with status:", status);
          setIsSubscribed(false);
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
      <div className="grid grid-cols-2 w-full h-12 border-b-slate-200 border-b pl-8 pr-4">
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
      <div className="grid grid-cols-[0.9fr_1.1fr] h-[calc(100vh-48px)] overflow-y-hidden">
        <div className="flex flex-col gap-4 w-full px-8 py-8 overflow-y-hidden border-r-slate-200 border-r bg-amber-50">
          <Form {...form}>
            <form
              onSubmit={onSubmit}
              className="h-full grid grid-rows-[32px_1fr_auto_32px]">
              <p className="font-medium text-sm">Enter Explanation Below</p>
              <div className="mb-8 bg-white max-h-full overflow-hidden">
                <RichInput
                  updateValue={(value: string) => form.setValue('explanation', value)} />
              </div>
              <div className="mb-4 overflow-scroll">
                <FormulaInput
                  formulaList={form.getValues('formula')}
                  updateValue={(value: string[]) => form.setValue('formula', value)} />
              </div>
              <div className="w-full grid grid-cols-[1fr__auto]">
                {
                  form.formState.errors.explanation ?
                    <ul className="list-disc rounded-sm bg-destructive/40 p-2 text-[0.8rem] font-medium truncate  text-ellipsis mr-2">
                      {form.formState.errors.explanation.message}
                    </ul>
                    :
                    explanationMutation.error &&
                    <ul className="list-disc rounded-sm bg-destructive/40 p-2 text-[0.8rem] font-medium truncate text-ellipsis mr-2">
                      {explanationMutation.error.message}
                    </ul>
                }
                <div className="ml-auto flex flex-row justify-end">
                  <LoadingButton
                    variant="link"
                    dontShowChildrenWhileLoading
                    disabled={explanationMutation.isLoading || !isSubscribed}
                    loading={explanationMutation.isLoading || !isSubscribed}
                    className="p-2 bottom-0 right-0 mt-auto ml-auto hover:no-underline"
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
        <div className="flex flex-col gap-4 w-full px-8 py-8 h-full overflow-y-hidden">
          <div className="flex flex-col gap-2">
            <p className="font-medium text-sm"> Questions </p>
            <p className="text-sm text-muted-foreground"> Ira will answer these questions based on your explanation </p>
          </div>
          <ScrollArea className="grid overflow-y-auto max-h-full">
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