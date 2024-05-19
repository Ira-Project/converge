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
import { QuestionAccordionItem } from "./question-accordion-item";
import { QuestionStatus } from "@/lib/constants";

interface Props {
  assignmentTemplate: RouterOutputs["assignmentTemplate"]["get"]; 
}

export const AssignmentPreview = ({ assignmentTemplate }: Props) => {

  // const createAssignment = api.assignment.create.useMutation();

  
  const form = useForm({
    defaultValues: {
      explanation: "",
    },
    // resolver: zodResolver(createAssignmentSchema),
  })

  const questions = [...assignmentTemplate.questions]

  const onSubmit = form.handleSubmit(async (values) => {

    // const id = await createAssignment.mutateAsync(
    //   {
    //     ...values,
    //     conceptGraphId: conceptGraphId,
    //   }
    // );
    // void router.replace(`/assignment/${id}`)
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
                <FormLabel>Explanation</FormLabel>
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
          {
            // createAssignment.error &&
            // <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
            //   {createAssignment.error.message}
            // </ul>
          }
          <LoadingButton 
            dontShowChildrenWhileLoading
            disabled={!form.formState.isDirty} // || createAssignment.isLoading}
            // loading={createAssignment.isLoading}
            className="ml-auto mr-4 p-2 -translate-y-16 h-8 w-8">
              <PaperPlaneIcon />
          </LoadingButton>
        </form>
      </Form>
      <p className="font-semibold"> Questions </p>
      <ScrollArea className="gap-4 flex flex-col overflow-y-auto pr-4">
        <Accordion type="single" collapsible className="w-full">
          {
            questions.map((question) => (
              <QuestionAccordionItem 
                status={QuestionStatus.UNANSWERED}
                key={question.id}
                id={question.id.toString()}
                questionText={question.question}
                answerText={question.answer} 
                workingText={question.id === 7 ? "This is a working text" : undefined}
                />
            ))
          }
          </Accordion>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </>
  );
}