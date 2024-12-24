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
import { PaperPlaneIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import SubmissionModal from "./submission-modal";
import ConfirmationModal from "./confirmation-modal";
import AssignmentTutorialModal from "./assignment-tutorial-modal";
import AssignmentPublishModal from "./assignment-publish-modal";
import Link from "next/link";
import dynamic from 'next/dynamic';

const FormulaInput = dynamic(() => import('./formula-input'), { ssr: false });


interface Props {
  topic: string;
  questions: {
    id: string,
    question: string,
    image?: string | null,
  }[];
  dueDate?: Date;
  assignmentName?: string;
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

export const AssignmentView = ({ topic, questions, testAttemptId, assignmentName, assignmentId, classroom, isLive, dueDate, role }: Props) => {
  const explanationMutation = api.explanation.explain.useMutation();
  const submissionMutation = api.explainTestAttempt.submit.useMutation();

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

  console.log(explanationMutation.error);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 w-full h-12 shadow-md">
        <Link href={`/classroom/${classroom?.id}`} className="my-auto ml-2 justify-start">
          <Button variant="link" className="my-auto ml-2 justify-start">
          ← Back
          </Button>
        </Link>
        <p className="mr-auto justify-center align-items-middle align-items-center mx-auto text-lg font-semibold my-auto">
          {assignmentName && `${assignmentName} - `} {topic}
        </p>
        <SubmissionModal open={submissionModalOpen} />
        <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
          { isLive ?
            <>
              <AssignmentTutorialModal 
                topic={topic}
                classroom={classroom}
                assignmentName={assignmentName} />
              <ConfirmationModal 
                onSubmit={submitAssignment} 
                loading={submissionMutation.isLoading || (dueDate && new Date() > new Date(dueDate) ? true : false)}
                />
            </>
            : 
            <>
              <p className="text-sm font-semibold my-auto">
                This is a preview
              </p>
              <AssignmentTutorialModal 
                topic={topic}
                classroom={classroom}
                assignmentName={assignmentName} />
              {
                role === Roles.Teacher && 
                <AssignmentPublishModal 
                  assignmentId={assignmentId} />
              }
            </>
          }
        </div>
        
      </div>
      <div className="grid grid-cols-[0.9fr_1.1fr] h-[calc(100vh-48px)] overflow-y-hidden">
        <div className="flex flex-col gap-4 w-full px-8 py-8 overflow-y-hidden border-r-slate-200 border shadow-lg bg-iraYellowLight bg-opacity-20">
            <Form {...form}>
              <form 
                onSubmit={onSubmit} 
                className="h-full grid grid-rows-[32px_1fr_auto_32px] gap-2">
                <p className="font-semibold"> Enter Explanation Below</p>
                <div className="mb-4 bg-white max-h-full overflow-hidden">
                  <RichInput 
                    updateValue={(value: string) => form.setValue('explanation', value)}/>
                </div>
                <div className="mb-4 overflow-scroll">
                  <FormulaInput 
                    formulaList={form.getValues('formula')}
                    updateValue={(value: string[]) => form.setValue('formula', value)}/>
                </div>
                <div className="w-full grid grid-cols-[1fr__auto]">
                  {
                    form.formState.errors.explanation ?
                    <ul className="list-disc rounded-sm bg-destructive/40 p-2 text-[0.8rem] font-medium truncate  text-ellipsis mr-2">
                      {form.formState.errors.explanation.message}
                    </ul>
                    : 
                    explanationMutation.error &&
                    <ul className="list-disc rounded-lș bg-destructive/40 p-2 text-[0.8rem] font-medium truncate text-ellipsis mr-2">
                      {explanationMutation.error.message}
                    </ul>
                  }
                  <div className="ml-auto flex flex-row justify-end">
                    <LoadingButton 
                      dontShowChildrenWhileLoading
                      disabled={explanationMutation.isLoading || !isSubscribed} 
                      loading={explanationMutation.isLoading || !isSubscribed}
                      className="p-2 bottom-0 right-0 mt-auto ml-auto"
                      type="submit">
                        <div className="flex flex-row gap-2">
                        Explain to Ira
                        <PaperPlaneIcon className="w-4 h-4 ml-2 my-auto"/>
                        </div>
                    </LoadingButton>
                  </div>
                </div>
              </form>
            </Form>
        </div>
        <div className="flex flex-col gap-4 w-full px-8 py-8 h-full overflow-y-hidden">
          <p className="font-semibold"> Questions for Ira </p>
          <ScrollArea className="grid overflow-y-auto max-h-full">
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