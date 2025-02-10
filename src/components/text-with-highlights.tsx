import React from 'react';

type TextTagType = 'h1' | 'h2' | 'h3' | 'p';

interface TextWithHighlightsProps {
  text: string;
  type: TextTagType;
  highlights?: Array<{
    start: number;
    end: number;
    color?: string;
  }>;
}

const TextWithHighlights: React.FC<TextWithHighlightsProps> = ({
  text,
  type,
  highlights = []
}) => {
  const Tag = type;
  
  if (!highlights.length) {
    return <Tag>{text}</Tag>;
  }

  // Sort highlights by start position
  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
  
  const textParts: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedHighlights.forEach((highlight, index) => {
    // Add non-highlighted text before this highlight
    if (highlight.start > lastIndex) {
      textParts.push(
        <span key={`text-${index}`}>
          {text.slice(lastIndex, highlight.start)}
        </span>
      );
    }

    // Add highlighted text
    textParts.push(
      <span 
        key={`highlight-${index}`}
        className={highlight.color === 'green' ? `bg-green-200` : 'bg-amber-200'}
      >
        {text.slice(highlight.start, highlight.end)}
      </span>
    );

    lastIndex = highlight.end;
  });

  // Add any remaining text after the last highlight
  if (lastIndex < text.length) {
    textParts.push(
      <span key="text-end">
        {text.slice(lastIndex)}
      </span>
    );
  }

  return <Tag>{textParts}</Tag>;
};

export default TextWithHighlights; 