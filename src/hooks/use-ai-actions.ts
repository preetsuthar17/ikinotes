import { useState } from 'react';

import {
  type AIAction,
  performAIAction,
  processStreamedResponse,
} from '@/services/ai-service';

export function useAIActions() {
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const executeAIAction = async (
    content: string,
    action: AIAction,
    question?: string,
    onContentUpdate?: (newContent: string) => void,
    onTitleUpdate?: (newTitle: string) => void
  ) => {
    setAiAction(action);
    setAiResult('');
    setAiError('');
    setAiLoading(true);

    try {
      const stream = await performAIAction(content, action, question);

      const result = await processStreamedResponse(stream, (chunk) => {
        if (action === 'ask' || action === 'summarize') {
          setAiResult(chunk);
        } else if (action !== 'heading') {
          onContentUpdate?.(chunk);
        }
      });

      if (action === 'ask' || action === 'summarize') {
        setAiResult(result);
      } else if (action === 'heading') {
        onTitleUpdate?.(result.trim());
      } else {
        onContentUpdate?.(result);
      }
    } catch {
      setAiError('Failed to process AI action');
    }
    setAiLoading(false);
  };

  return {
    aiAction,
    aiResult,
    aiLoading,
    aiError,
    executeAIAction,
  };
}
