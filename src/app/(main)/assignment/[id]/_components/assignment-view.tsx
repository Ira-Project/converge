'use client';

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { QuestionAccordionItem } from "@/components/question-accordion-item";
import { QuestionStatus } from "@/lib/constants";
import { supabaseClient } from "@/lib/supabaseClient";
import { Suspense, useEffect, useReducer, useState } from "react";
import { type AssignmentState, type AssignmentUpdateActions, AssignmentUpdateActionType } from "@/lib/constants";
import { questionReducer } from "@/reducers/assignment-reducer";
import { explainSchema } from "@/server/api/routers/explanation/explanation.input";
import { generateId } from "lucia";
import AssignmentHeader from "./assignment-header";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import SubmissionModal from "./submission-modal";
import ConfirmationModal from "./confirmation-modal";
import { RichInput } from "./rich-input";

interface Props {
  topic: string;
  questions: {
    id: string,
    question: string,
  }[];
  assignmentName: string;
  assignmentId: string;
  classroom?: {
    name: string;
    id: string;
  } | null;
  timeLimit?: number | null;
  testAttemptId: string;
}

export const AssignmentView = ({ topic, questions, testAttemptId, assignmentName, assignmentId, classroom, timeLimit }: Props) => {
  const explanationMutation = api.explanation.explain.useMutation();
  const submissionMutation = api.testAttempt.submit.useMutation();

  const initialState: AssignmentState = {
    validNodeIds: [],
    questions: questions.map((question) => {
      return {
        id: question.id,
        status: QuestionStatus.UNANSWERED,
        questionText: question.question,
        // answerText: question.answer,
        computedAnswerText: "",
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
      channelName: channelName,
      testAttemptId: testAttemptId,
      assignmentId: assignmentId, 
    },
    resolver: zodResolver(explainSchema),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    questionsStateDispatch({
      type: AssignmentUpdateActionType.SET_LOADING,
    })

    await explanationMutation.mutateAsync({
      explanation: values.explanation,
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

  return (
    <div className="max-h-[calc(100vh-64px)] overflow-y-hidden grid grid-rows-[auto_auto_1fr_auto] px-16 py-12 gap-4">
      <div className="grid grid-cols-2 items-center gap-16">
        <div className="flex flex-col gap-4">
            <AssignmentHeader
              assignmentName={assignmentName}
              classroom={classroom}
              timeLimit={timeLimit}
              numberOfQuestions={0} 
              />
            <p className="text-muted-foreground">
              {`
                Can you teach the concepts of 
                ${topic.toLocaleLowerCase()} 
                so Ira can successfully answer the questions?
              `}  
            </p>
        </div>
        <div className="flex flex-col gap-8">
          <div className="ml-auto">
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <p className="w-full text-center text-sm text-muted-foreground pb-2"> Ira's Knowledge </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-48">
                  <small>The concept map represents the AI's knowledge. As you explain the nodes will turn green indicating that a concept has been understood</small>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 items-center gap-16">
        <p className="font-semibold"> Explanation </p>
        <p className="font-semibold"> Questions </p>
      </div>
      <div className="grid grid-cols-2 min-h-0 gap-16">
        <div>
          <Form {...form}>
            <form className="h-full" onSubmit={onSubmit}>
              <RichInput 
                updateValue={(value: string) => form.setValue('explanation', value)}
                loading={explanationMutation.isLoading || !isSubscribed}
                disabled={explanationMutation.isLoading || !isSubscribed}/>
              {
                explanationMutation.error &&
                <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive -translate-y-16 mt-4">
                  {explanationMutation.error.message}
                </ul>
              }
            </form>
          </Form>
        </div>
        <ScrollArea className="grid overflow-y-auto pr-6">
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
                      //answerText={question.answerText} 
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
      <div className="ml-auto mr-4">
        <ConfirmationModal 
          onSubmit={submitAssignment} 
          loading={submissionMutation.isLoading} />
      </div>
      <SubmissionModal open={submissionModalOpen} />
    </div>
  );
}