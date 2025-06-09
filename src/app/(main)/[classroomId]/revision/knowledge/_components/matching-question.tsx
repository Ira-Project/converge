// MatchingQuestion.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { Match } from '../../types';
import { LoadingButton } from '@/components/loading-button';
import Image from 'next/image';

import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import FormattedText from '@/components/formatted-text';
import posthog from 'posthog-js';
import { FlagQuestionModal } from './flag-question-modal';
import { KnowledgeZapQuestionType } from '@/lib/constants';
import { Flag } from 'lucide-react';
import { RotateCounterClockwiseIcon } from '@/components/icons';

interface MatchingQuestionProps {
  assignmentAttemptId: string;
  matchingQuestionId: string;
  questionId: string;
  question: string;
  imageUrl?: string | null;
  optionsA: string[];
  optionsB: string[];
  stackPush: () => void;
  stackPop: () => void;
  classroomId: string;
}

const MatchingQuestion: React.FC<MatchingQuestionProps> = ({ 
  assignmentAttemptId, matchingQuestionId, questionId, question, imageUrl, optionsA, optionsB, stackPush, stackPop, classroomId 
}) => {
  
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);

  const checkMatchingAnswer = api.knowledgeQuestions.checkMatchingAnswer.useMutation();

  // Add helper function to clean LaTeX content for data attributes
  const cleanLatexForDataAttribute = (text: string) => {
    return text.replace(/\$!\$(.*?)\$!\$/g, 'latex_$1')
      .replace(/[^a-zA-Z0-9-_]/g, '_');
  };

  const handleSubmit = async () => {
    posthog.capture("knowledge_zap_matching_question_submitted");
    const result = await checkMatchingAnswer.mutateAsync({
      assignmentAttemptId: assignmentAttemptId,
      matchingQuestionId: matchingQuestionId,
      questionId: questionId,
      answer: matches,
      classroomId: classroomId,
    });
    setIsCorrect(result.correct);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    posthog.capture("knowledge_zap_matching_question_reset");
    setMatches([]);
    setSelectedTerm(null);
    setSelectedDefinition(null);
  };

  useEffect(() => {
    drawLines();
  }, [matches]);

  const drawLines = () => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous lines
    const existingCanvas = container.querySelector('canvas');
    existingCanvas?.remove();

    // Create new canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    container.appendChild(canvas);

    // Draw lines for each match
    matches.forEach(match => {
      const termElement = container.querySelector(`[data-option="${cleanLatexForDataAttribute(match.optionA)}"]`);
      const defElement = container.querySelector(`[data-option="${cleanLatexForDataAttribute(match.optionB)}"]`);
      
      if (termElement && defElement) {
        const termRect = termElement.getBoundingClientRect();
        const defRect = defElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate start and end points with gaps
        const gapSize = 20; // Size of the gap between line and button
        const startX = termRect.right - containerRect.left + gapSize;
        const endX = defRect.left - containerRect.left - gapSize;
        const startY = termRect.top - containerRect.top + termRect.height / 2;
        const endY = defRect.top - containerRect.top + defRect.height / 2;

        // Draw the main line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#4D7C0F';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw the arrow head
        const arrowSize = 8;
        const angle = Math.atan2(endY - startY, endX - startX);
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle - Math.PI / 6),
          endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle + Math.PI / 6),
          endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = '#4D7C0F';
        ctx.fill();
      }
    });
    
    posthog.capture("knowledge_zap_matching_question_lines_drawn");
  };

  const handleMatch = (term: string, definition: string) => {
    // Check if this exact match already exists
    const existingMatchIndex = matches.findIndex(
      m => m.optionA === term && m.optionB === definition
    );

    if (existingMatchIndex !== -1) {
      // Remove the match if it exists
      const newMatches = matches.filter((_, index) => index !== existingMatchIndex);
      setMatches(newMatches);
    } else {
      // Remove any existing matches that use either the term or definition
      const filteredMatches = matches.filter(
        m => m.optionA !== term && m.optionB !== definition
      );
      
      // Add the new match
      const newMatches = [...filteredMatches, { optionA: term, optionB: definition }];
      setMatches(newMatches);
    }
    
    setSelectedTerm(null);
    setSelectedDefinition(null);
  };

  const getButtonClassNames = (
    isSelected: boolean,
  ) => {
    return `w-full p-3 text-left rounded-lg transition-colors text-center text-sm
    ${isSelected ? 'bg-lime-300' : 'bg-lime-100'}`;
  };

  const handleContinue = () => {
    posthog.capture("knowledge_zap_matching_question_continue_clicked");
    setMatches([]);
    setSelectedTerm(null);
    setSelectedDefinition(null);
    setIsCorrect(false);
    setIsSubmitted(false);
    if (isCorrect) {
      stackPop();
    } else {
      stackPush();
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <p className="text-xl text-center flex-1"> 
          <FormattedText text={question} />
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFlagModalOpen(true)}
          className="text-lime-600 hover:bg-lime-50 flex items-center gap-1"
        >
          <Flag className="h-4 w-4" />
        </Button>
      </div>
      {imageUrl && (
        <Image 
          className="my-auto mx-auto" 
          src={imageUrl} 
          alt={question} 
          width={500} 
          height={300} />
      )}
      <p className="text-sm text-center text-muted-foreground">Match the terms to the definitions</p>
      <div>
        <div ref={containerRef} className="grid grid-cols-2 gap-32 relative">
          <div className="space-y-2 h-full flex flex-col">
            {optionsA.map((option) => (
              <button
                key={option}
                data-option={cleanLatexForDataAttribute(option)}
                onClick={() => {
                  if (isSubmitted) return; // Prevent interaction after submission
                  if (selectedDefinition) {
                    handleMatch(option, selectedDefinition);
                  } else {
                    setSelectedTerm(option);
                  }
                }}
                className={`${getButtonClassNames(
                  selectedTerm === option,
                )} flex-1`}
                disabled={isSubmitted || (matches.some(m => m.optionA === option) && !selectedDefinition)} // Disable after submission or if already matched
                style={{
                  boxShadow: '4px 4px 8px rgba(229, 249, 186, 100), -4px -4px 8px rgba(255, 255, 255, 100)',
                  opacity: isSubmitted ? 0.6 : 1, // Visual feedback for disabled state
                  cursor: isSubmitted ? 'not-allowed' : 'pointer',
                }}
              >
                <FormattedText text={option} />
              </button>
            ))}
          </div>
          <div className="space-y-2 h-full flex flex-col">
            {optionsB.map((def) => (
              <button
                key={def}
                data-option={cleanLatexForDataAttribute(def)}
                onClick={() => {
                  if (isSubmitted) return; // Prevent interaction after submission
                  if (selectedTerm) {
                    handleMatch(selectedTerm, def);
                  } else {
                    setSelectedDefinition(def);
                  }
                }}
                className={getButtonClassNames(
                  selectedDefinition === def,
                )}
                disabled={isSubmitted || (matches.some(m => m.optionB === def) && !selectedTerm)} // Disable after submission or if already matched
                style={{
                  boxShadow: '4px 4px 8px rgba(229, 249, 186, 100), -4px -4px 8px rgba(255, 255, 255, 100)',
                  opacity: isSubmitted ? 0.6 : 1, // Visual feedback for disabled state
                  cursor: isSubmitted ? 'not-allowed' : 'pointer',
                }}
              >
                <FormattedText text={def} />
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2 flex justify-end mt-2">
          <Button
            variant="link"
            size="sm"
            onClick={handleReset}
            disabled={isSubmitted || matches.length === 0} // Disable reset button after submission
            className="flex items-center gap-2 text-muted-foreground hover:text-gray-900"
            style={{
              opacity: isSubmitted ? 0.6 : 1, // Visual feedback for disabled state
              cursor: isSubmitted ? 'not-allowed' : 'pointer',
            }}
          >
            <RotateCounterClockwiseIcon className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {!isSubmitted && (
        <LoadingButton 
          loading={checkMatchingAnswer.isLoading}
          disabled={matches.length !== optionsA.length || checkMatchingAnswer.isLoading}
          variant="link"
          className="p-2 ml-auto hover:no-underline"
          onClick={handleSubmit}
        >
          <div className="flex flex-row gap-2">
            <span className="my-auto font-semibold">
              Submit
            </span>
            <Image 
              className="my-auto" 
              src="/images/knowledge-zap.png" 
              alt="Knowledge Zap" 
              width={32} 
              height={32} />
          </div>
        </LoadingButton>
      )}

      {isSubmitted && (
        <div className="flex flex-col gap-2">
          {isCorrect ? 
          <div className="flex flex-col items-center gap-4">
            <p className="text-green-600 font-medium text-center">
              🎉 Great Job! You got it right!
            </p>
          </div>
          : <div className="flex flex-col items-center gap-4">
            <p className="text-destructive font-medium text-center">
              Whoops! That's not quite right. You'll get it next time!
            </p>
          </div>}
          <Button 
            variant="link" 
            className="p-2 ml-auto" 
            onClick={handleContinue}
          >
            <div className="flex flex-row gap-2 w-full">
              <span className="my-auto font-semibold">
                Continue
              </span>
              <Image 
                  className="my-auto" 
                  src="/images/knowledge-zap.png" 
                  alt="Knowledge Zap" 
                  width={32} 
                  height={32} />
            </div>
          </Button>
        </div>
      )}

      <FlagQuestionModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        questionId={questionId}
        questionText={question}
        questionType={KnowledgeZapQuestionType.MATCHING}
        classroomId={classroomId}
      />
    </div>
  );
};

export default MatchingQuestion;