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


interface Props {
  activityId: string
  topic: string;
  readingPassage: string;
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

export const ReadAndRelayAssignmentView = ({ activityId, readingPassage, topic, questions, attemptId, assignmentId, classroom, isLive, dueDate, role }: Props) => {
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
  
  const [highlights, setHighlights] = useState<string[]>([]);
  const [formulas, setFormulas] = useState<string[]>([]);

  const onSubmit = (async () => {
    questionsStateDispatch({
      type: AssignmentUpdateActionType.SET_LOADING,
    })

    await evaluateReadingMutation.mutateAsync({
      highlights: highlights,
      formulas: formulas,
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
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 w-full h-12 border-b-slate-200 border-b pl-8 pr-4">
        <div className="flex flex-row gap-4 flex-start mr-auto h-8 my-auto">
          <p className="text-lg font-semibold my-auto text-fuchsia-700">
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
                loading={submissionMutation.isLoading || (dueDate && new Date() > new Date(dueDate) ? true : false)}
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
      <div className="grid grid-cols-[0.9fr_1.1fr] h-[calc(100vh-48px)] overflow-y-hidden">
        <div className="flex flex-col gap-4 w-full px-8 py-8 overflow-y-hidden border-r-slate-200 border-r bg-amber-50">
          <ReadingPassage content={readingPassage}/>
        </div>
        <div className="flex flex-col gap-4 w-full px-8 py-8 h-full overflow-y-hidden">
          <div className="flex flex-col gap-2"> 
            <p className="font-medium text-sm"> Questions </p>
            <p className="text-sm text-muted-foreground"> Ira will answer these questions based on your explanation </p>
          </div>
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
                        // answerText={question.answerText} 
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