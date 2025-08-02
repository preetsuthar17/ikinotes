import { useEffect, useRef } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

interface NoteContentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

export function NoteContentEditor({
  content,
  onContentChange,
}: NoteContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  return (
    <ScrollArea className="w-full flex-1">
      <Textarea
        className="h-auto min-h-[80px] w-full flex-1 rounded-ele border-none bg-transparent p-0 text-base shadow-none focus:outline-none"
        onBlur={(e) => onContentChange(e.target.value)}
        onChange={(e) => onContentChange(e.target.value)}
        ref={textareaRef}
        style={{
          boxShadow: 'none',
          border: 'none',
          outline: 'none',
          overflowY: 'auto',
          height: '100%',
          maxHeight: '100%',
          resize: 'none',
          background: 'transparent',
        }}
        value={content}
      />
    </ScrollArea>
  );
}
