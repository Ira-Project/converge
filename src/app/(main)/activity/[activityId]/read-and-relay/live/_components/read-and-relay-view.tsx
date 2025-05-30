'use client';

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
import { generateId } from "lucia";
import { Skeleton } from "@/components/ui/skeleton";
import SubmissionModal from "./read-and-relay-submission-modal";
import { Separator } from "@/components/ui/separator";
import ReadAndRelayTutorialModal from "./read-and-relay-tutorial-modal";
import ReadAndRelayShareModal from "./read-and-relay-share-modal";
import ReadAndRelayConfirmationModal from "./read-and-relay-confirmation-modal";
import ReadingPassage from "./reading-passage";
import FormattedText from "@/components/formatted-text";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/icons";
import { LoadingButton } from "@/components/loading-button";
import Image from "next/image";
import posthog from "posthog-js";
interface Props {
  activityId: string
  topic: string;
  readingPassage: string;
  maxNumberOfHighlights: number;
  maxNumberOfFormulas: number;
  maxHighlightLength: number;
  maxFormulaLength: number;
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
  attemptId: string;
  role: Roles;
}

export const ReadAndRelayAssignmentView = ({ activityId, readingPassage, topic, questions, attemptId, assignmentId, classroom, isLive, dueDate, role, maxNumberOfHighlights, maxNumberOfFormulas, maxHighlightLength, maxFormulaLength }: Props) => {
  const evaluateReadingMutation = api.evaluateReading.evaluateReading.useMutation();
  const submissionMutation = api.readAndRelay.submitAttempt.useMutation();

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
  
  interface Highlight {
    id: string;
    text: string;
  }
  interface Formula {
    id: string;
    text: string;
  }
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);

  const onSubmit = (async () => {
    posthog.capture("read_and_relay_cheatsheet_submitted");
    questionsStateDispatch({
      type: AssignmentUpdateActionType.SET_LOADING,
    })

    await evaluateReadingMutation.mutateAsync({
      highlights: highlights.map(h => h.text),
      formulas: formulas.map(f => f.text),
      channelName: channelName,
      assignmentId: assignmentId,
      attemptId: attemptId,
    });
  });

  const [submissionModalOpen, setSubmissionmodalOpen] = useState(false);

  const submitAssignment = async () => {
    await submissionMutation.mutateAsync({
      attemptId: attemptId,
    });
    setSubmissionmodalOpen(true);
  };

  const dueDatePassed = dueDate && new Date() > new Date(dueDate);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 w-full h-12 border-b-slate-200 border-b pl-8 pr-4">
        <div className="flex flex-row gap-4 flex-start mr-auto h-8 my-auto">
          <p className="text-lg font-semibold my-auto text-blue-700">
            Read and Relay
          </p>
          <Separator orientation="vertical" className="h-6 w-px my-auto" />
          <p className="text-sm my-auto">
            {topic}
          </p>
        </div>
        <SubmissionModal open={submissionModalOpen} />
        <div className="flex flex-row ml-auto mr-4 my-auto gap-4">
          { role !== Roles.Teacher ?
            <>
              { attemptId.length > 0 && 
                <ReadAndRelayTutorialModal 
                  topic={topic}
                  classroom={classroom} />
              }
              <ReadAndRelayConfirmationModal 
                onSubmit={submitAssignment} 
                loading={submissionMutation.isLoading}
                dueDatePassed={dueDatePassed}
                />
            </>
            : 
            <>
              { attemptId.length > 0 && 
                <ReadAndRelayTutorialModal 
                  topic={topic}
                  classroom={classroom} />
              }
              <ReadAndRelayShareModal 
                activityId={activityId}
                isLive={isLive} />
            </>
          }
        </div>
      </div>
      <div className="grid grid-cols-[1fr_1fr] h-[calc(100vh-48px)] overflow-y-hidden">
        <div className="flex flex-col gap-4 w-full px-6 py-6 overflow-y-hidden border-r-slate-200 border-r bg-blue-50">
          <div className="h-full overflow-y-auto">
            <ReadingPassage 
              maxNumberOfHighlights={maxNumberOfHighlights}
              maxNumberOfFormulas={maxNumberOfFormulas}
              maxHighlightLength={maxHighlightLength}
              maxFormulaLength={maxFormulaLength}
              content={readingPassage}
              highlights={highlights}
              formulas={formulas}
              setHighlights={setHighlights}
              setFormulas={setFormulas}
            />
          </div>
          <div className="ml-auto flex flex-row justify-end h-8">
            <LoadingButton 
              variant="link"
              dontShowChildrenWhileLoading
              disabled={evaluateReadingMutation.isLoading || !isSubscribed || (highlights.length === 0 && formulas.length === 0)} 
              loading={evaluateReadingMutation.isLoading || !isSubscribed}
              className="p-2 bottom-0 right-0 mt-auto ml-auto hover:no-underline"
              onClick={onSubmit}
              type="submit">
                <div className="flex flex-row gap-2">
                <span className="my-auto font-semibold">
                  Share Cheatsheet with Ira
                </span>
                <Image 
                  className="my-auto" 
                  src="/images/read-and-relay.png" 
                  alt="Read and Relay" 
                  width={32} 
                  height={32} />
                </div>
            </LoadingButton>
          </div>
        </div>
        <div className="flex flex-col w-full h-full overflow-y-hidden">
          <div className="h-2/5 px-6 py-6 border-b flex flex-col gap-2">
            <p className="font-medium text-sm"> Cheatsheet for Ira </p>
            <ScrollArea className="h-full overflow-scroll rounded-lg border p-4">
              <div className="flex flex-col gap-4 my-auto">
                <div>
                  <p className="font-medium text-sm mb-2">Highlighted Concepts</p>
                  {highlights.length === 0 ? (
                    <p className="text-sm text-muted-foreground mb-8">No concepts highlighted yet. Highlight text in yellow to add concepts.</p>
                  ) : (
                    highlights.map((highlight) => (
                      <div key={highlight.id} className="grid grid-cols-[1fr_auto] gap-2 mb-2">
                        <div
                          className="text-sm bg-yellow-200 px-1 py-1 my-auto rounded"
                        > 
                          <FormattedText
                            text={highlight.text}
                            padding={true}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setHighlights(highlights.filter(h => h.id !== highlight.id))}
                          className="my-auto"
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm mb-2">Highlighted Formula</p>
                  {formulas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No formulas highlighted yet. Highlight text in green to add formulas.</p>
                  ) : (
                    formulas.map((formula) => (
                      <div key={formula.id} className="grid grid-cols-[1fr_auto] gap-2 mb-2">
                        <div
                          className="text-sm bg-green-200 px-1 py-1 my-auto rounded"
                        > 
                        <FormattedText
                          text={formula.text}
                          padding={true}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormulas(formulas.filter(f => f.id !== formula.id))}
                          className="my-auto"
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
          <div className="h-3/5 px-6 py-6">
            <div className="flex flex-col gap-2 h-full"> 
              <p className="font-medium text-sm"> Questions </p>
              <p className="text-sm text-muted-foreground"> Ira will answer these questions based on your explanation </p>
              <ScrollArea className="flex flex-col gap-4 h-full overflow-scroll">
                <Accordion type="single" collapsible className="w-full pr-4">
                  <Suspense fallback={<Skeleton className="w-full h-16"/>}>
                    {assignmentState.questions.map((question) => (
                      <QuestionAccordionItem 
                        status={question.status}
                        key={question.id}
                        id={question.id.toString()}
                        questionText={question.questionText}
                        questionImage={question.questionImage ?? undefined}
                        image={question.image}
                        imageHeight={question.imageHeight}
                        imageWidth={question.imageWidth}
                        workingText={question.working !== "" ? question.working : undefined}
                        workingComplete={question.workingComplete}
                        computedAnswerText={question.computedAnswerText}
                      />
                    ))}
                  </Suspense>
                </Accordion>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}