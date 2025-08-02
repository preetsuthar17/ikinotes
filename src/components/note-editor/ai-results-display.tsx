interface AIResultsDisplayProps {
  aiAction: string | null;
  aiResult: string;
  aiError: string;
}

export function AIResultsDisplay({
  aiAction,
  aiResult,
  aiError,
}: AIResultsDisplayProps) {
  if (!(aiResult || aiError)) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {(aiAction === 'ask' || aiAction === 'summarize') && aiResult && (
        <div className="rounded bg-muted p-3 text-base">
          <span className="font-semibold capitalize">{aiAction}:</span>{' '}
          {aiResult}
        </div>
      )}
      {aiError && (
        <div className="rounded bg-destructive/10 p-3 text-base text-destructive">
          {aiError}
        </div>
      )}
    </div>
  );
}
