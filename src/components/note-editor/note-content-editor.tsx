import { Textarea } from '@/components/ui/textarea';

interface NoteContentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

export function NoteContentEditor({
  content,
  onContentChange,
}: NoteContentEditorProps) {
  return (
    <div className="h-full w-full">
      <Textarea
        className="custom-scrollbar h-auto min-h-[calc(100vh-460px)] w-full flex-1 rounded-ele border-none bg-transparent p-0 px-0 py-2 text-base shadow-none focus:outline-none md:min-h-[calc(100dvh-320px)]"
        onChange={(e) => onContentChange(e.target.value)}
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
    </div>
  );
}
