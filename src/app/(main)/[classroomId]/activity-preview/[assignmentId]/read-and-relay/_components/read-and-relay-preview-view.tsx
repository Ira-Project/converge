'use client';

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
import { generateId } from "lucia";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import ReadingPassage from "@/app/(main)/activity/[activityId]/read-and-relay/live/_components/reading-passage";
import FormattedText from "@/components/formatted-text";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/icons";
import { LoadingButton } from "@/components/loading-button";
import Image from "next/image";
import posthog from "posthog-js";
import { AssignActivityModal } from '@/app/(main)/[classroomId]/activity-preview/[assignmentId]/_components/assign-activity-modal';
import ReadAndRelayTutorialModal from "@/app/(main)/activity/[activityId]/read-and-relay/live/_components/read-and-relay-tutorial-modal";

interface Props {
  topic: string;
  topicId: string;
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
  assignmentId: string;
  assignmentName: string;
  classroomId: string;
  attemptId: string;
  role: Roles;
}

export const ReadAndRelayPreviewView = ({ 
  topic, 
  topicId, 
  readingPassage, 
  maxNumberOfHighlights, 
  maxNumberOfFormulas, 
  maxHighlightLength, 
  maxFormulaLength, 
  questions, 
  attemptId, 
  assignmentId, 
  assignmentName, 
  classroomId, 
  role 
}: Props) => {
  const evaluateReadingMutation = api.evaluateReading.evaluateReading.useMutation();

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
  const [isPanelHidden, setIsPanelHidden] = useState(false);

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

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="w-full border-b border-slate-200 bg-white">
        <div className="px-4 sm:px-8 py-4 sm:py-3">
          {/* Mobile: 2x2 Grid Layout */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:hidden">
            {/* Row 1, Col 1: Read and Relay Title */}
            <div className="flex items-center">
              <h1 className="text-base font-semibold text-blue-700 whitespace-nowrap">
                Read and Relay
              </h1>
            </div>
            
            {/* Row 1, Col 2: Assign Activity Button */}
            <div className="flex justify-end">
              {role == Roles.Teacher && (
                <AssignActivityModal
                  classroomId={classroomId}
                  assignmentId={assignmentId}
                  activityType={ActivityType.ReadAndRelay}
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
              {role == Roles.Teacher && attemptId.length > 0 && 
                <ReadAndRelayTutorialModal 
                  isMobileLayout={true}
                  topic={topic}
                  classroom={{
                    name: "Home",
                    id: classroomId ?? "",
                  }} />
              }
            </div>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left section - Main info */}
            <div className="flex flex-row items-center gap-4 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-blue-700 whitespace-nowrap">
                  Read and Relay
                </h1>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium">
                  PREVIEW
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Separator orientation="vertical" className="h-4 w-px" />
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium text-slate-700 truncate">
                    {topic}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right section - Actions */}
            <div className="flex flex-row justify-end gap-3 flex-shrink-0">
              {role == Roles.Teacher &&
                <>
                  {attemptId.length > 0 && 
                    <ReadAndRelayTutorialModal 
                      topic={topic}
                      isMobileLayout={false}
                      classroom={{
                        name: "Home",
                        id: classroomId ?? "",
                      }} />
                  }
                  <AssignActivityModal
                    classroomId={classroomId}
                    assignmentId={assignmentId}
                    activityType={ActivityType.ReadAndRelay}
                    activityName={assignmentName}
                    topicId={topicId}
                  />
                </>
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content - Responsive Layout */}
      <div className={`flex flex-col h-[calc(100vh-80px)] sm:h-[calc(100vh-72px)] overflow-y-hidden ${
        isPanelHidden 
          ? 'lg:grid lg:grid-cols-[1fr_auto]' 
          : 'lg:grid lg:grid-cols-[1fr_auto_1fr]'
      }`}>
        {/* Reading Passage Section */}
        <div className={`flex flex-col gap-4 w-full px-4 sm:px-6 py-4 sm:py-6 overflow-y-hidden border-r-0 lg:border-r-slate-200 lg:border-r bg-blue-50 ${
          isPanelHidden ? 'h-full' : 'h-[50vh] lg:h-full'
        }`}>
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
                <span className="my-auto font-semibold text-sm">
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

        {/* Toggle Button */}
        <div className="hidden lg:flex items-center justify-center w-8">
          <button
            onClick={() => setIsPanelHidden(!isPanelHidden)}
            className="flex items-center justify-center w-6 h-20 bg-white border border-slate-200 rounded-l-lg shadow-sm hover:bg-slate-50 transition-colors"
            title={isPanelHidden ? "Show cheatsheet and questions" : "Hide cheatsheet and questions"}
          >
            <svg 
              className={`w-3 h-3 text-slate-600 transition-transform ${isPanelHidden ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Mobile Toggle Button - Always Visible */}
        <div className={`lg:hidden flex items-center justify-between p-3 bg-slate-100 border-b border-slate-200 ${
          isPanelHidden ? 'fixed bottom-0 left-0 right-0 z-10 shadow-lg' : ''
        }`}>
          <h3 className="font-medium text-slate-700">Cheatsheet & Questions</h3>
          <button
            onClick={() => setIsPanelHidden(!isPanelHidden)}
            className="flex items-center justify-center w-8 h-8 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50 transition-colors"
            title={isPanelHidden ? "Show section" : "Hide section"}
          >
            <svg 
              className={`w-4 h-4 text-slate-600 transition-transform ${isPanelHidden ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Questions and Cheatsheet Section */}
        {!isPanelHidden && (
          <div className="flex flex-col w-full h-[50vh] lg:h-full overflow-y-hidden">
            {/* Cheatsheet Section */}
            <div className="h-2/5 px-4 sm:px-6 py-4 sm:py-6 border-b flex flex-col gap-2">
              <p className="font-medium text-sm"> Cheatsheet for Ira </p>
              <ScrollArea className="h-full overflow-scroll rounded-lg border p-3 sm:p-4">
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
            
            {/* Questions Section */}
            <div className="h-3/5 px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col gap-2 h-full"> 
                <p className="font-medium text-sm"> Questions </p>
                <p className="text-sm text-muted-foreground"> Ira will answer these questions based on your explanation </p>
                <ScrollArea className="flex flex-col gap-4 h-full overflow-scroll">
                  <Accordion type="single" collapsible className="w-full pr-2 sm:pr-4">
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
        )}
      </div>
    </div>
  );
} 