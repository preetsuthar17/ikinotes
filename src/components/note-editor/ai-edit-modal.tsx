import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  performAIAction,
  processStreamedResponse,
} from '@/services/ai-service';
import { getDiffLines } from '@/utils/diff-utils';

interface AIEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalContent: string;
  editedContent: string;
  onEditedContentChange: (content: string) => void;
  onConfirm: (content: string) => void;
}

export function AIEditModal({
  open,
  onOpenChange,
  originalContent,
  editedContent,
  onEditedContentChange,
  onConfirm,
}: AIEditModalProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRunAIEdit = async () => {
    if (!prompt.trim()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const enhancedPrompt =
        prompt.trim() +
        "\nDo not include any meta text like 'Here's a summary:', 'Here's a simplified version:', or similar. Only output the result.";

      const stream = await performAIAction(
        originalContent,
        'rewrite',
        enhancedPrompt
      );
      const result = await processStreamedResponse(stream);
      onEditedContentChange(result);
    } catch {
      setError('Failed to process AI action');
    }
    setLoading(false);
  };

  const diffLines = getDiffLines(originalContent, editedContent);

  return (
    <Modal onOpenChange={onOpenChange} open={open}>
      <ModalContent className="flex h-full max-h-[95vh] w-full max-w-[95%] flex-col gap-4 p-4 sm:p-8">
        <ModalHeader>
          <ModalTitle>Edit with AI</ModalTitle>
        </ModalHeader>

        <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden sm:flex-row sm:gap-8">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-semibold">Original Note</span>
            <ScrollArea className="flex-1 whitespace-pre-wrap rounded-card border border-border bg-muted/30 p-2 text-base">
              {originalContent}
            </ScrollArea>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-semibold">AI Edited Note (Diff)</span>
            <ScrollArea className="flex-1 whitespace-pre-wrap rounded-card border border-border p-2 text-base">
              {diffLines.map((line, idx) => (
                <div
                  key={idx}
                  style={{
                    background:
                      line.type === 'added'
                        ? '#e6ffed'
                        : line.type === 'removed'
                          ? '#ffeef0'
                          : 'transparent',
                    color:
                      line.type === 'added'
                        ? '#22863a'
                        : line.type === 'removed'
                          ? '#b31d28'
                          : undefined,
                  }}
                >
                  {line.type === 'added'
                    ? '+ '
                    : line.type === 'removed'
                      ? '- '
                      : '  '}
                  {line.text}
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            className="w-full"
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt for AI..."
            size="lg"
            type="text"
            value={prompt}
          />
          <Button
            className="self-end"
            disabled={loading || !prompt.trim()}
            onClick={handleRunAIEdit}
            variant="outline"
          >
            Run AI Edit
          </Button>
          {error && (
            <div className="rounded bg-destructive/10 p-3 text-base text-destructive">
              {error}
            </div>
          )}
        </div>

        <ModalFooter className="justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            disabled={editedContent.trim() === originalContent.trim()}
            onClick={() => onConfirm(editedContent)}
            type="button"
            variant="default"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
