import { type ContentSegment } from "./_components/reading-passage";

export const parseContent = (content: string): ContentSegment[] => {
  // First split by LaTeX delimiters ($!$)
  const parts = content.split(/(\$!\$.*?\$!\$)/);
  const segments: ContentSegment[] = [];
  let segmentIndex = 0;

  parts.forEach(part => {
    const trimmedPart = part.trim();
    if (!trimmedPart) return;

    if (part.startsWith('$!$') && part.endsWith('$!$')) {
      const latexContent = part.slice(3, -3).trim();
      if (latexContent) {
        segments.push({
          id: `segment-${segmentIndex++}`,
          type: 'latex',
          content: latexContent
        });
      }
    } else {
      // Split the part by HTML tags and process each separately
      const htmlParts = part.match(/<(h[1-3]|p)>[\s\S]*?<\/\1>/g) ?? [part];
      
      htmlParts.forEach(htmlPart => {
        const tagMatch = htmlPart.match(/<(h[1-3]|p)>([\s\S]*?)<\/\1>/);
        
        if (tagMatch) {
          const content = tagMatch[2]?.trim();
          if (content) {
            segments.push({
              id: `segment-${segmentIndex++}`,
              type: 'text',
              content: content,
              tag: tagMatch[1] as 'h1' | 'h2' | 'h3' | 'p'
            });
          }
        } else if (htmlPart.trim()) {
          // Default to paragraph if no tag found
          segments.push({
            id: `segment-${segmentIndex++}`,
            type: 'text',
            content: htmlPart.trim(),
            tag: 'p'
          });
        }
      });
    }
  });
  
  return segments;
};

export const getStartContainer = (element: Element | null): Element | null => {
  if (!element) return null;
  if (element.id?.includes('segment')) {
    return element;
  }
  return getStartContainer(element.parentElement);
};