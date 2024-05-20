'use client';

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import { type RouterOutputs } from '@/trpc/shared'
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { Accordion } from "@/components/ui/accordion";
import { QuestionAccordionItem } from "../../../../../components/question-accordion-item";
import { QuestionStatus } from "@/lib/constants";
import { supabaseClient } from "@/lib/supabaseClient";
import { use, useEffect, useReducer, useState } from "react";
import { type QuestionState, type QuestionsUpdateActions } from "@/lib/constants";
import { questionReducer } from "../reducers/question-reducer";
import { explainSchema } from "@/server/api/routers/explanation/explanation.input";

interface Props {
  assignmentTemplate: RouterOutputs["assignmentTemplate"]["get"]; 
}

export const AssignmentPreview = ({ assignmentTemplate }: Props) => {

  const explanationMutation = api.explanation.explain.useMutation();

  const initialState:QuestionState[] = assignmentTemplate.questions.map((question) => ({
    id: question.id.toString(),
    status: QuestionStatus.UNANSWERED,
    questionText: question.question,
    answerText: question.answer,
    working: "",
    workingComplete: false,
  }));

  const [questionsState, questionsStateDispatch] = useReducer(questionReducer, initialState);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const channelName = "hello";

  useEffect(() => {
    const channelA = supabaseClient.channel(channelName)
    channelA
      .on(
        'broadcast',
        { event: 'action' }, 
        (action) => {
          const stateDispatch = action.payload as unknown as QuestionsUpdateActions;
          questionsStateDispatch(stateDispatch); 
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
    },
    resolver: zodResolver(explainSchema),
  })


  const onSubmit = form.handleSubmit(async (values) => {
    await explanationMutation.mutateAsync({
      explanation: values.explanation,
      channelName: channelName,
    });
  });

  return (
    <>
      <Form {...form}>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem>
                <FormLabel asChild>Explanation</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    className="h-40 resize-none pr-8"
                    required 
                    placeholder="Enter your explanation here">                      
                  </Textarea>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          <LoadingButton 
            dontShowChildrenWhileLoading
            disabled={!form.formState.isDirty || explanationMutation.isLoading || !isSubscribed} 
            loading={explanationMutation.isLoading || !isSubscribed}
            className="ml-auto mr-4 p-2 -translate-y-16 h-8 w-8">
              <PaperPlaneIcon />
          </LoadingButton>
          {
            explanationMutation.error &&
            <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive -translate-y-16 mt-4">
              {explanationMutation.error.message}
            </ul>
          }
        </form>
      </Form>
      <p className="font-semibold"> Questions </p>
      <ScrollArea className="gap-4 flex flex-col overflow-y-auto pr-4">
        <Accordion type="single" collapsible className="w-full">
          {
            questionsState.map((question) => (
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
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </>
  );
}