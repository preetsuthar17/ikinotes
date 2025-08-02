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
        className="custom-scrollbar w-full bg-transparent text-base focus:outline-none border-none shadow-none p-0 h-auto rounded-ele px-0 py-2 flex-1 min-h-[calc(100vh-460px)] md:min-h-[calc(100dvh-320px)]"
        style={{
          boxShadow: "none",
          border: "none",
          outline: "none",
          overflowY: "auto",
          height: "100%",
          maxHeight: "100%",
          resize: "none",
          background: "transparent",
        }}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
      />
    </div>
  );
}