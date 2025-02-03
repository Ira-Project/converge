import React, { useState, useEffect } from 'react';
import katex from 'katex';


type ContentSegment = {
  id: string;
  type: 'text' | 'latex';
  content: string;
};

type Highlight = {
  id: string;
  segmentId: string;
  color: HighlightColor;
  content: string;
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
  /** Content with LaTeX delimited by $!$ */
  // content: string;
  readingPassage: string;
  /** Initial highlights */
  /** Callback when highlights change */
  onHighlightsChange?: (highlights: Highlight[]) => void;
}

const parseContent = (content: string): ContentSegment[] => {
  const segments = content.split('$!$');
  return segments.map((segment, index) => ({
    id: `segment-${index}`,
    type: index % 2 === 0 ? 'text' : 'latex',
    content: segment.trim()
  }));
};

const getStartContainer = (element: Element | null) => {
  if (!element) return null;
  if (element.id?.includes('segment')) {
    return element;
  }
  return getStartContainer(element.parentElement);
};

const ReadingPassage: React.FC<Props> = ({
  readingPassage,
  onHighlightsChange
}) => {

  const content = "<strong>This is</strong> regular<br/> text $!$ \\frac{1}{2} $!$ <strong>and more text</strong> $!$ x^2 + x^3 $!$ at the end."
  const [segments, setSegments] = useState<ContentSegment[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [segmentHighlights, setSegmentHighlights] = useState<{
    segmentId: string;
    highlights: SegmentHighlight[];
  }[]>([]);
  const [currentColor, setCurrentColor] = useState<HighlightColor>('yellow');

  useEffect(() => {
    setSegments(parseContent(content));
    console.log("SEGMENTS: ", segments);
    for (const segment of segments) {
      setSegmentHighlights(prev => [...prev, {
        segmentId: segment.id,
        highlights: []
      }]);
    }
  }, [content]);

  useEffect(() => {
    onHighlightsChange?.(highlights);
  }, [highlights, onHighlightsChange]);

  const handleLatexClick = (segment: ContentSegment) => {
    // Check if this segment is already highlighted
    const existingHighlight = highlights.find(h => h.segmentId === segment.id);
    
    if (existingHighlight) {
      // Remove highlight if it exists
      setHighlights(prev => prev.filter(h => h.id !== existingHighlight.id));
    } else {
      // Add new highlight
      const newHighlight: Highlight = {
        id: `highlight-${Date.now()}`,
        segmentId: segment.id,
        color: currentColor,
        content: segment.content,
      };
      setHighlights(prev => [...prev, newHighlight]);
    }
  };

  const handleTextSelection = (segmentId: string) => {
    const selection = window.getSelection();
    console.log("SELECTION: ", selection);
    if (!selection?.toString()) return;

    console.log(selection.toString());

    const range = selection.getRangeAt(0);
    console.log("RANGE: ", range);
    const segmentHighlights: SegmentHighlight[] = [];

    const startContainer = getStartContainer(range.startContainer.parentElement);
    const endContainer = getStartContainer(range.endContainer.parentElement);

    if(!startContainer || !endContainer) {
      console.log("Something went horribly wrong");
      return;
    }

    const startSegmentId = startContainer.id;
    const endSegmentId = endContainer.id;
    let currentSegmentId = endSegmentId;

    console.log("START SEGMENT ID: ", startSegmentId);
    console.log("END SEGMENT ID: ", endSegmentId);
    console.log("CURRENT SEGMENT ID: ", currentSegmentId);

    const highlightId = `highlight-${Date.now()}`;
    let highlightContent = "";
    
    while (currentSegmentId !== startSegmentId) {
      const segment = segments.find(s => s.id === currentSegmentId);

      if(!segment) {
        console.log("Something went horribly wrong");
        break;
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
        segmentHighlights.push(segmentHighlight);
      } else { 
        let endOffset = segment.content.length;
        if(currentSegmentId === endSegmentId) {
          endOffset = range.endOffset;
          highlightContent = endContainer.textContent?.substring(0, endOffset) + highlightContent;
        } else { 
          const segmentElement = document.getElementById(segment.id);
          if(!segmentElement) {
            console.log("Something went horribly wrong");
            break;
          }
          highlightContent = segmentElement.textContent?.substring(0, endOffset) + highlightContent;
        }
        const segmentHighlight: SegmentHighlight = {
          segmentId: segment.id,
          startIndex: 0,
          endIndex: endOffset,
          highlightId: highlightId,
          color: currentColor
        }
        segmentHighlights.push(segmentHighlight);
      }

      const currentSegmentIndex = segments.findIndex(s => s.id === currentSegmentId);
      const prevSegmentId = segments[currentSegmentIndex - 1]?.id
      if(!prevSegmentId) {
        console.log("Some weird shit is happening");
        break;
      }
      currentSegmentId = prevSegmentId;
    }

    const startSegment = segments.find(s => s.id === startSegmentId);

    segmentHighlights.push({
      segmentId: startSegment?.id ?? "",
      startIndex: range.startOffset,
      endIndex: startSegment?.content.length ?? 0,
      highlightId: highlightId,
      color: currentColor
    });

    console.log("RANGE START CONTAINER: ", startContainer);
    console.log("START CONTAINER TEXT CONTENT: ", startContainer.textContent);
    highlightContent = startContainer.textContent?.substring(range.startOffset) + highlightContent;

    console.log("CONTENT: ", highlightContent);
    console.log("SEGMENT HIGHLIGHTS: ", segmentHighlights);

    const newHighlight: Highlight = {
      id: highlightId,
      segmentId: startSegment?.id ?? "",
      color: currentColor,
      content: highlightContent
    }
  
    setHighlights(prev => [...prev, newHighlight]);
    selection.removeAllRanges();
  };

  const removeHighlight = (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
  };

  const toggleColor = () => {
    setCurrentColor(prev => prev === 'yellow' ? 'green' : 'yellow');
  };

  const renderSegment = (segment: ContentSegment) => {
    if (segment.type === 'latex') {
      try {
        const html = katex.renderToString(segment.content, {
          throwOnError: false,
          output: 'html'
        });
        
        return (
          <span
            id={segment.id}
            key={segment.id}
            className={`inline-block cursor-pointer mx-1 px-1 rounded`}
            onClick={() => handleLatexClick(segment)}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (error) {
        console.error('Error rendering LaTeX:', error);
        return <span key={segment.id} className="text-red-500">Error rendering LaTeX</span>;
      }
    }

    // Get highlights for this segment from segmentHighlights
    const currentSegmentHighlights = segmentHighlights
      .find(sh => sh.segmentId === segment.id)?.highlights ?? [];
    
    // Sort highlights by start index
    const sortedHighlights = currentSegmentHighlights
      .sort((a, b) => a.startIndex - b.startIndex);

    // Split the text content into parts based on highlights
    let lastIndex = 0;
    const parts: JSX.Element[] = [];

    sortedHighlights.forEach((highlight, index) => {
      // Add unhighlighted text before this highlight
      if (highlight.startIndex > lastIndex) {
        parts.push(
          <span 
            id={segment.id}
            key={`text-${index}`}
            dangerouslySetInnerHTML={{ 
              __html: segment.content.slice(lastIndex, highlight.startIndex) 
            }}
          />
        );
      }

      // Add highlighted text
      parts.push(
        <span
          id={segment.id}
          key={`highlight-${index}`}
          className={`${highlight.color === 'yellow' ? 'bg-yellow-200' : 'bg-green-200'}`}
          dangerouslySetInnerHTML={{ 
            __html: segment.content.slice(highlight.startIndex, highlight.endIndex) 
          }}
        />
      );

      lastIndex = highlight.endIndex;
    });

    // Add any remaining unhighlighted text
    if (lastIndex < segment.content.length) {
      parts.push(
        <span 
          id={segment.id}
          key={`text-last`}
          dangerouslySetInnerHTML={{ 
            __html: segment.content.slice(lastIndex) 
          }}
        />
      );
    }

    return (
      <span
        id={segment.id}
        key={segment.id}
        data-segment-id={segment.id}
        className="inline"
        onMouseUp={() => handleTextSelection(segment.id)}
      >
        {parts}
      </span>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4 flex items-center space-x-4">
        <button
          onClick={toggleColor}
          className={`px-4 py-2 rounded-lg font-medium ${
            currentColor === 'yellow' ? 'bg-yellow-200' : 'bg-green-200'
          }`}
          type="button"
        >
          Current Color: {currentColor}
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="text-xl">
          {segments.map(segment => renderSegment(segment))}
        </div>
      </div>

      {highlights.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Highlights:</h3>
          <div className="space-y-2">
            {highlights.map(highlight => {
              const segment = segments.find(s => s.id === highlight.segmentId);
              return (
                <div 
                  key={highlight.id} 
                  className={`p-2 rounded flex justify-between items-center ${
                    highlight.color === 'yellow' ? 'bg-yellow-200' : 'bg-green-200'
                  }`}
                >
                  <span className="font-mono">
                    {segment?.type === 'latex' ? (
                      <span dangerouslySetInnerHTML={{
                        __html: katex.renderToString(highlight.content, {
                          throwOnError: false,
                          output: 'html'
                        })
                      }} />
                    ) : (
                      highlight.content
                    )}
                  </span>
                  <button
                    onClick={() => removeHighlight(highlight.id)}
                    className="text-red-500 hover:text-red-700"
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              )}
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingPassage;