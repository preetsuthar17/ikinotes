import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AIActionsToolbarProps {
  askInput: string;
  onAskInputChange: (value: string) => void;
  onAsk: (question: string) => void;
  onSummarize: () => void;
  onRewrite: () => void;
  onFixGrammar: () => void;
  onEditWithAI: () => void;
  onGenerateHeading: () => void;
  aiLoading: boolean;
  headingLoading: boolean;
  hasContent: boolean;
}

export function AIActionsToolbar({
  askInput,
  onAskInputChange,
  onAsk,
  onSummarize,
  onRewrite,
  onFixGrammar,
  onEditWithAI,
  onGenerateHeading,
  aiLoading,
  headingLoading,
  hasContent,
}: AIActionsToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onAsk(askInput);
        }}
      >
        <Input
          className="rounded border text-sm"
          disabled={aiLoading}
          onChange={(e) => onAskInputChange(e.target.value)}
          placeholder="Ask a question..."
          type="text"
          value={askInput}
        />
        <Button
          disabled={aiLoading || !askInput.trim() || !hasContent}
          type="submit"
          variant="outline"
        >
          Ask
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          className="grow"
          disabled={aiLoading || !hasContent}
          onClick={onSummarize}
          variant="outline"
        >
          Summarize
        </Button>
        <Button
          className="grow"
          disabled={aiLoading || !hasContent}
          onClick={onRewrite}
          variant="outline"
        >
          Rewrite
        </Button>
        <Button
          className="grow"
          disabled={aiLoading || !hasContent}
          onClick={onFixGrammar}
          variant="outline"
        >
          Fix Grammar
        </Button>
        <Button
          className="grow"
          disabled={aiLoading || !hasContent}
          onClick={onEditWithAI}
          variant="outline"
        >
          Edit with AI
        </Button>
        <Button
          className="grow"
          disabled={headingLoading || !hasContent}
          onClick={onGenerateHeading}
          variant="outline"
        >
          Generate Heading
        </Button>
      </div>
    </div>
  );
}
