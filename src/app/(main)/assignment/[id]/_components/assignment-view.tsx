'use client';

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import { type RouterOutputs } from '@/trpc/shared'
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { QuestionAccordionItem } from "@/components/question-accordion-item";
import { QuestionStatus } from "@/lib/constants";
import { supabaseClient } from "@/lib/supabaseClient";
import { useEffect, useReducer, useState } from "react";
import { type AssignmentState, type AssignmentUpdateActions, AssignmentUpdateActionType } from "@/lib/constants";
import { questionReducer } from "@/reducers/assignment-reducer";
import { explainSchema } from "@/server/api/routers/explanation/explanation.input";
import { generateId } from "lucia";
import dynamic from "next/dynamic";
import AssignmentHeader from "./assignment-header";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PaperPlaneIcon } from "@/components/icons";

const ConceptGraph = dynamic(
  () => import("../../../../../components/concept-graph").then((mod) => mod.ConceptGraph),
  {
    ssr: false,
  }
);

interface Props {
  assignmentName: string;
  classroom?: {
    name: string;
    id: string;
  } | null;
  timeLimit?: number | null;
  assignmentTemplate: RouterOutputs["assignmentTemplate"]["get"];
  testAttemptId: string;
}

export const AssignmentView = ({ assignmentTemplate, testAttemptId, assignmentName, classroom, timeLimit }: Props) => {

  const explanationMutation = api.explanation.explain.useMutation();

  const initialState: AssignmentState = {
    validNodeIds: [],
    questions: assignmentTemplate.questions.map((question) => {
      return {
        id: question.id.toString(),
        status: QuestionStatus.UNANSWERED,
        questionText: question.question,
        answerText: question.answer,
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
      assignmentTemplateId: assignmentTemplate.id,
      testAttemptId: testAttemptId,
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
      assignmentTemplateId: assignmentTemplate.id,
    });
  });

  return (
    <div className="max-h-[calc(100vh-64px)] overflow-y-hidden grid grid-rows-[auto_auto_1fr_auto] px-16 py-12 gap-4">
      <div className="grid grid-cols-2 items-center gap-16">
        <div className="flex flex-col gap-4">
            <AssignmentHeader
              assignmentName={assignmentName}
              classroom={classroom}
              timeLimit={timeLimit}
              numberOfQuestions={assignmentTemplate.questions.length} />
            <p className="text-muted-foreground">
              {`
                Can you teach the concepts of 
                ${assignmentTemplate.name.toLocaleLowerCase()} 
                so Ira can successfully answer the questions?
              `}  
            </p>
        </div>
        <div className="flex flex-col gap-8">
          <div className="ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <p className="w-full text-center text-sm text-muted-foreground pb-2"> Concept Map </p>
                    <ConceptGraph 
                      hideLabels
                      validNodes={assignmentState.validNodeIds}
                      assignmentTemplate={assignmentTemplate}/>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-48">
                  <small>The concept map represents the AI's knowledge. As you explain the nodes will turn green indicating that a concept has been understood</small>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 items-center gap-16">
        <p className="font-semibold"> Explanation </p>
        <p className="font-semibold"> Question </p>
      </div>
      <div className="grid grid-cols-2 min-h-0 gap-16">
        <div>
          <Form {...form}>
            <form className="h-full" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem className="h-full">
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="h-full resize-none pr-8"
                        required 
                        placeholder="Enter your explanation here" />                      
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              <div className="w-full">
              <LoadingButton 
                dontShowChildrenWhileLoading
                disabled={!form.formState.isDirty || explanationMutation.isLoading || !isSubscribed} 
                loading={explanationMutation.isLoading || !isSubscribed}
                className="flex justify-end ml-auto mr-4 p-2 -translate-y-12 h-8 w-8">
                  <PaperPlaneIcon />
              </LoadingButton>
              </div>
              {
                explanationMutation.error &&
                <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive -translate-y-16 mt-4">
                  {explanationMutation.error.message}
                </ul>
              }
            </form>
          </Form>
        </div>
        <ScrollArea className="grid overflow-y-auto pr-4">
          <div className="flex flex-col gap-4">
            <Accordion type="single" collapsible className="w-full">
              {
                assignmentState.questions.map((question) => (
                  <QuestionAccordionItem 
                    status={question.status}
                    key={question.id}
                    id={question.id.toString()}
                    questionText={question.questionText}
                    answerText={question.answerText} 
                    workingText={question.working !== "" ? question.working : undefined}
                    />
                ))
              }
            </Accordion>
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
      <div className="ml-auto mr-4">
        <Button>Submit Assignment</Button>
      </div>
    </div>
  );
}