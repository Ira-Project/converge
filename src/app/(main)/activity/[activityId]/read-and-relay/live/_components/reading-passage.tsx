import React, { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';


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

type HighlightColor = 'yellow' | 'green';

interface Props {
  /** Content with LaTeX delimited by $!$ */
  content: string;
  /** Initial highlights */
  initialHighlights?: Highlight[];
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

const ReadingPassage: React.FC<Props> = ({
  content = "This is regular text $!$ \\frac{1}{2} $!$ and more text $!$ x^2 $!$ at the end.",
  initialHighlights = [],
  onHighlightsChange
}) => {
  const [segments, setSegments] = useState<ContentSegment[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const [currentColor, setCurrentColor] = useState<HighlightColor>('yellow');

  useEffect(() => {
    setSegments(parseContent(content));
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
        content: segment.content
      };
      setHighlights(prev => [...prev, newHighlight]);
    }
  };

  const handleTextSelection = (segmentId: string) => {
    const selection = window.getSelection();
    if (!selection?.toString()) return;

    const newHighlight: Highlight = {
      id: `highlight-${Date.now()}`,
      segmentId,
      color: currentColor,
      content: selection.toString()
    };

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
    const highlight = highlights.find(h => h.segmentId === segment.id);
    const bgColorClass = highlight ? 
      (highlight.color === 'yellow' ? 'bg-yellow-200' : 'bg-green-200') : '';

    if (segment.type === 'latex') {
      try {
        const html = katex.renderToString(segment.content, {
          throwOnError: false,
          output: 'html'
        });
        
        return (
          <span
            key={segment.id}
            className={`inline-block cursor-pointer mx-1 px-1 rounded ${bgColorClass}`}
            onClick={() => handleLatexClick(segment)}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (error) {
        console.error('Error rendering LaTeX:', error);
        return <span key={segment.id} className="text-red-500">Error rendering LaTeX</span>;
      }
    }

    return (
      <span
        key={segment.id}
        className={`inline ${bgColorClass}`}
        onMouseUp={() => handleTextSelection(segment.id)}
      >
        {segment.content}
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