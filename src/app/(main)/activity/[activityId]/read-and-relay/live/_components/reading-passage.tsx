import React, { useState, useEffect } from 'react';
import katex from 'katex';

import './reading-passage.css';
import TextWithHighlights from '@/components/text-with-highlights';
import { getStartContainer, parseContent } from '../utils';
import { toast } from 'sonner';

export type ContentSegment = {
  id: string;
  type: 'text' | 'latex';
  content: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p';
};

type SegmentHighlight = {
  segmentId: string;
  startIndex: number;
  endIndex: number;
  highlightId: string;
  color: HighlightColor;
};

type HighlightColor = 'yellow' | 'green';

interface Props {
  content: string;
  highlights: {id: string, text: string}[];
  formulas: {id: string, text: string}[];
  maxNumberOfHighlights: number;
  maxNumberOfFormulas: number;
  maxHighlightLength: number;
  maxFormulaLength: number;
  setHighlights: (highlights: {id: string, text: string}[]) => void;
  setFormulas: (formulas: {id: string, text: string}[]) => void;
}

const ReadingPassage: React.FC<Props> = ({
  content,
  highlights,
  formulas,
  maxNumberOfHighlights,
  maxNumberOfFormulas,
  maxHighlightLength,
  maxFormulaLength,
  setHighlights,
  setFormulas
}) => {

  const [segments, setSegments] = useState<ContentSegment[]>([]);
  const [segmentHighlights, setSegmentHighlights] = useState<Record<string, SegmentHighlight[]>>({});
  const [currentColor, setCurrentColor] = useState<HighlightColor>('yellow');

  useEffect(() => {
    setSegments(parseContent(content));
    console.log("SEGMENTS: ", segments);
    const initialHighlights: Record<string, SegmentHighlight[]> = {};
    segments.forEach(segment => {
      initialHighlights[segment.id] = [];
    });
    setSegmentHighlights(initialHighlights);
  }, [content]);

  useEffect(() => {
    // Create a set of valid highlight IDs from both highlights and formulas
    const validHighlightIds = new Set([
      ...highlights.map(h => h.id),
      ...formulas.map(f => f.id)
    ]);

    // Create new segmentHighlights object with filtered highlights
    const updatedSegmentHighlights = Object.fromEntries(
      Object.entries(segmentHighlights).map(([segmentId, highlights]) => [
        segmentId,
        highlights.filter(h => validHighlightIds.has(h.highlightId))
      ])
    );

    setSegmentHighlights(updatedSegmentHighlights);
  }, [highlights, formulas]);

  const handleLatexClick = (segment: ContentSegment) => {
    const existingSegmentHighlights = segmentHighlights[segment.id] ?? [];

    // Check max number of highlights/formulas
    if (currentColor === 'yellow' && highlights.length >= maxNumberOfHighlights) {
      toast.error(`Cannot add more than ${maxNumberOfHighlights} concept highlights`);
      return;
    }
    if (currentColor === 'green' && formulas.length >= maxNumberOfFormulas) {
      toast.error(`Cannot add more than ${maxNumberOfFormulas} formula highlights`);
      return;
    }

    // Check length
    if (currentColor === 'yellow' && segment.content.length > maxHighlightLength) {
      toast.error(`Highlight cannot be longer than ${maxHighlightLength} characters`);
      return;
    }
    if (currentColor === 'green' && segment.content.length > maxFormulaLength) {
      toast.error(`Formula highlight cannot be longer than ${maxFormulaLength} characters`);
      return;
    }

    const highlightId = `highlight-${Date.now()}`;
    
    if (existingSegmentHighlights.length === 0) {
      // Add new highlight based on color
      if (currentColor === 'yellow') {
        setHighlights([...highlights, { id: highlightId, text: `$!$${segment.content}$!$` }]);
      } else {
        setFormulas([...formulas, { id: highlightId, text: `$!$${segment.content}$!$` }]);
      }

      const segmentHighlight: SegmentHighlight = {
        segmentId: segment.id,
        startIndex: 0,
        endIndex: segment.content.length,
        highlightId: highlightId,
        color: currentColor
      }
      setSegmentHighlights({
        ...segmentHighlights,
        [segment.id]: [...(segmentHighlights[segment.id] ?? []), segmentHighlight]
      });
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection?.toString()) return;

    // Check max number of highlights/formulas
    if (currentColor === 'yellow' && highlights.length >= maxNumberOfHighlights) {
      toast.error(`Cannot add more than ${maxNumberOfHighlights} concept highlights`);
      selection.removeAllRanges();
      return;
    }
    if (currentColor === 'green' && formulas.length >= maxNumberOfFormulas) {
      toast.error(`Cannot add more than ${maxNumberOfFormulas} formula highlights`);
      selection.removeAllRanges();
      return;
    }

    // Check length
    if (currentColor === 'yellow' && selection.toString().length > maxHighlightLength) {
      toast.error(`Highlight cannot be longer than ${maxHighlightLength} characters`);
      selection.removeAllRanges();
      return;
    }
    if (currentColor === 'green' && selection.toString().length > maxFormulaLength) {
      toast.error(`Formula highlight cannot be longer than ${maxFormulaLength} characters`);
      selection.removeAllRanges();
      return;
    }

    const range = selection.getRangeAt(0);
    const startContainer = getStartContainer(range.startContainer.parentElement);
    const endContainer = getStartContainer(range.endContainer.parentElement);

    if(!startContainer || !endContainer) {
      console.log("Something went horribly wrong");
      return;
    }

    const startSegmentId = startContainer.id;
    const endSegmentId = endContainer.id;

    // When start and end containers are the same, we can simplify the logic
    if(startContainer.id === endContainer.id) {
      const highlightId = `highlight-${Date.now()}`;
      
      // Get existing highlights for this segment
      const existingHighlights = segmentHighlights[startSegmentId] ?? [];
      
      // Find the closest previous highlight's end index
      let offsetAdjustment = 0;
      for (const highlight of existingHighlights) {
        if (highlight.startIndex < range.startOffset) {
          offsetAdjustment = highlight.endIndex;
        }
      }

      // Adjust start and end based on the closest previous highlight
      const adjustedStart = range.startOffset + offsetAdjustment;
      const adjustedEnd = Math.min(range.endOffset + offsetAdjustment, segments.find(s => s.id === startSegmentId)?.content.length ?? 0);
      
      const highlightContent = startContainer.textContent?.substring(adjustedStart, adjustedEnd) ?? '';

      const segmentHighlight: SegmentHighlight = {
        segmentId: startSegmentId,
        startIndex: adjustedStart,
        endIndex: adjustedEnd,
        highlightId: highlightId,
        color: currentColor
      };

      // Sort highlights by startIndex to maintain order
      const updatedHighlights = [...existingHighlights, segmentHighlight]
        .sort((a, b) => a.startIndex - b.startIndex);

      setSegmentHighlights({
        ...segmentHighlights,
        [startSegmentId]: updatedHighlights
      });

      // Add highlight based on color
      if (currentColor === 'yellow') {
        setHighlights([...highlights, { id: highlightId, text: highlightContent }]);
      } else {
        setFormulas([...formulas, { id: highlightId, text: highlightContent }]);
      }

      selection.removeAllRanges();
      return;
    }

    let currentSegmentId = endSegmentId;

    const highlightId = `highlight-${Date.now()}`;
    let highlightContent = "";
    
    // Create a copy of the current segmentHighlights
    const updatedSegmentHighlights = { ...segmentHighlights };
    
    while (currentSegmentId !== startSegmentId) {
      const segment = segments.find(s => s.id === currentSegmentId);

      if(!segment) {
        console.log("Something went horribly wrong");
        break;
      }

      const existingHighlights = updatedSegmentHighlights[segment.id] ?? [];
      let offsetAdjustment = 0;
      
      // Calculate offset adjustment based on existing highlights
      for (const highlight of existingHighlights) {
        if (highlight.startIndex < (currentSegmentId === endSegmentId ? range.endOffset : segment.content.length)) {
          offsetAdjustment = highlight.endIndex;
        }
      }

      if(segment.type === "latex") {
        highlightContent = "$!$" + segment.content + "$!$" + highlightContent;
        const segmentHighlight: SegmentHighlight = {
          segmentId: segment.id,
          startIndex: 0,
          endIndex: segment.content.length,
          highlightId: highlightId,
          color: currentColor
        }
        updatedSegmentHighlights[segment.id] = [
          ...(updatedSegmentHighlights[segment.id] ?? []),
          segmentHighlight
        ].sort((a, b) => a.startIndex - b.startIndex);
      } else { 
        let endOffset = segment.content.length;
        if(currentSegmentId === endSegmentId) {
          endOffset = Math.min(range.endOffset + offsetAdjustment, segment.content.length);
          highlightContent = endContainer.textContent?.substring(0, endOffset) + " " + highlightContent;
        } else { 
          const segmentElement = document.getElementById(segment.id);
          if(!segmentElement) {
            console.log("Something went horribly wrong");
            break;
          }
          endOffset = Math.min(segment.content.length + offsetAdjustment, segmentElement.textContent?.length ?? 0);
          highlightContent = segmentElement.textContent?.substring(0, endOffset) + " " + highlightContent;
        }
        const segmentHighlight: SegmentHighlight = {
          segmentId: segment.id,
          startIndex: 0,
          endIndex: endOffset,
          highlightId: highlightId,
          color: currentColor
        }
        updatedSegmentHighlights[segment.id] = [
          ...(updatedSegmentHighlights[segment.id] ?? []),
          segmentHighlight
        ].sort((a, b) => a.startIndex - b.startIndex);
      }

      const currentSegmentIndex = segments.findIndex(s => s.id === currentSegmentId);
      const prevSegmentId = segments[currentSegmentIndex - 1]?.id
      if(!prevSegmentId) {
        console.log("Some weird shit is happening");
        break;
      }
      currentSegmentId = prevSegmentId;
    }

    // Handle the start segment
    const startSegment = segments.find(s => s.id === startSegmentId);
    const existingStartHighlights = updatedSegmentHighlights[startSegment?.id ?? ""] ?? [];
    let startOffsetAdjustment = 0;
    
    // Find the closest previous highlight's end index
    for (const highlight of existingStartHighlights) {
      if (highlight.startIndex < range.startOffset) {
        startOffsetAdjustment = highlight.endIndex;
      }
    }

    const finalSegmentHighlight: SegmentHighlight = {
      segmentId: startSegment?.id ?? "",
      startIndex: range.startOffset + startOffsetAdjustment,
      endIndex: startSegment?.content.length ?? 0,
      highlightId: highlightId,
      color: currentColor
    };
    
    updatedSegmentHighlights[startSegment?.id ?? ""] = [
      ...(updatedSegmentHighlights[startSegment?.id ?? ""] ?? []),
      finalSegmentHighlight
    ];

    // Update the segmentHighlights state
    setSegmentHighlights(updatedSegmentHighlights);
    
    // Add space after the start container content
    const adjustedStart = range.startOffset + startOffsetAdjustment;
    highlightContent = startContainer.textContent?.substring(adjustedStart) + " " + highlightContent;

    // Add highlight based on color
    if (currentColor === 'yellow') {
      setHighlights([...highlights, { id: highlightId, text: highlightContent }]);
    } else {
      setFormulas([...formulas, { id: highlightId, text: highlightContent }]);
    }

    selection.removeAllRanges();
  };

  const renderSegment = (segment: ContentSegment) => {
    if (segment.type === 'latex') {
      try {
        const html = katex.renderToString(segment.content, {
          throwOnError: false,
          output: 'html'
        });
        
        // Get highlights for this segment
        const currentSegmentHighlights = segmentHighlights[segment.id] ?? [];
        const hasHighlight = currentSegmentHighlights.length > 0;
        
        return (
          <span
            id={segment.id}
            key={segment.id}
            className={`inline-block cursor-pointer mx-1 px-1 rounded ${
              hasHighlight ? 
              currentSegmentHighlights[0]?.color === 'yellow' ? 'bg-yellow-200' : 'bg-green-200' : ''
            }`}
            onMouseUp={() => {
              const selection = window.getSelection();
              if(selection?.toString()) {
                toast.error("Partial highlight not supported for LaTeX")
              }
            }}
            onClick={() => handleLatexClick(segment)}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (error) {
        console.error('Error rendering LaTeX:', error);
        return <span key={segment.id} className="text-red-500">Error rendering LaTeX</span>;
      }
    }

    // Get highlights for this segment
    const currentSegmentHighlights = segmentHighlights[segment.id] ?? [];
    
    // Convert SegmentHighlight[] to format expected by TextWithHighlights
    const convertedHighlights = currentSegmentHighlights.map(highlight => ({
      start: highlight.startIndex,
      end: highlight.endIndex,
      color: highlight.color,
    }));

    return (
      <span
        id={segment.id}
        key={segment.id}
        data-segment-id={segment.id}
        className="inline"
        onMouseUp={() => handleTextSelection()}
      >
        <TextWithHighlights
          text={segment.content}
          type={segment.tag ?? 'p'}
          highlights={convertedHighlights}
        />
      </span>
    );
  };

  return (
    <div className="mx-auto relative h-full">
      <div className="mb-6 bg-white rounded-lg shadow-md p-4 h-full">
        <div className="h-full overflow-y-auto" id="reading-passage">
          {segments.map(segment => renderSegment(segment))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <div className="group relative flex items-center">
          <div className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Concept Highlighter
          </div>
          <button
            onClick={() => setCurrentColor('yellow')}
            className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all ${
              currentColor === 'yellow' 
                ? 'bg-yellow-200 ring-2 ring-yellow-400' 
                : 'bg-yellow-100 hover:bg-yellow-200'
            }`}
            type="button"
            title="Concept Highlighter"
          >
            <span className="w-6 h-6 bg-yellow-400 rounded-full"></span>
          </button>
        </div>
        <div className="group relative flex items-center">
          <div className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Formula Highlighter
          </div>
          <button
            onClick={() => setCurrentColor('green')}
            className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all ${
              currentColor === 'green' 
                ? 'bg-green-200 ring-2 ring-green-400' 
                : 'bg-green-100 hover:bg-green-200'
            }`}
            type="button"
            title="Formula Highlighter"
          >
            <span className="w-6 h-6 bg-green-400 rounded-full"></span>
          </button>
        </div>
      </div> 
    </div>
  );
};

export default ReadingPassage;