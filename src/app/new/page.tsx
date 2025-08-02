'use client';

import { ArrowLeft, Home, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TagInput } from '@/components/ui/tag-input';
import { Textarea } from '@/components/ui/textarea';
import {
  deleteNote,
  getNotes,
  type Note,
  updateNote,
} from '@/lib/note-service';

export default function NewNotePage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(true);
  const [_summary, setSummary] = useState('');
  const [_summarizing, setSummarizing] = useState(false);
  const [_summaryError, setSummaryError] = useState('');
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [askInput, setAskInput] = useState('');
  const [showAiEdit, setShowAiEdit] = useState(false);
  const [aiEditContent, setAiEditContent] = useState('');
  const [_aiHeading, _setAiHeading] = useState('');
  const [headingLoading, setHeadingLoading] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  function _handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    setUnsaved(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      // Removed scrollTop restore to prevent auto-scroll to end
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    setUnsaved(true);
  }

  async function handleSave() {
    if (!note) {
      return;
    }
    setSaving(true);
    try {
      const updated = await updateNote(note.id, { content, title, tags });
      setUnsaved(false);
      setNote(updated);
    } catch (_error) {}
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  }

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadNote() {
      setLoading(true);
      try {
        const notes = await getNotes();
        const found = notes.find((n) => n.id === id);
        if (found) {
          setNote(found);
          setContent(found.content);
          setTitle(found.title);
          setTags(found.tags || []);
        }
        // Gather all unique tags from all notes
        setAllTags(Array.from(new Set(notes.flatMap((n) => n.tags || []))));
      } catch (_error) {}
      setLoading(false);
    }

    loadNote();
  }, [id]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  // Simple line diff function
  function getDiffLines(oldStr: string, newStr: string) {
    const oldLines = oldStr.split('\n');
    const newLines = newStr.split('\n');
    const diff = [];
    let i = 0,
      j = 0;
    while (i < oldLines.length || j < newLines.length) {
      if (
        i < oldLines.length &&
        j < newLines.length &&
        oldLines[i] === newLines[j]
      ) {
        diff.push({ type: 'unchanged', text: oldLines[i] });
        i++;
        j++;
      } else if (
        j < newLines.length &&
        (!oldLines[i] || oldLines[i] !== newLines[j])
      ) {
        diff.push({ type: 'added', text: newLines[j] });
        j++;
      } else if (
        i < oldLines.length &&
        (!newLines[j] || oldLines[i] !== newLines[j])
      ) {
        diff.push({ type: 'removed', text: oldLines[i] });
        i++;
      } else {
        i++;
        j++;
      }
    }
    return diff;
  }

  async function handleDelete() {
    if (!note) {
      return;
    }
    try {
      await deleteNote(note.id);
      router.push('/');
    } catch (_error) {}
  }

  async function _handleSummarize() {
    setSummarizing(true);
    setSummary('');
    setSummaryError('');
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.body) {
        throw new Error('No response body');
      }
      const reader = res.body.getReader();
      let result = '';
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        result += decoder.decode(value, { stream: true });
        setSummary(result);
      }
      result += decoder.decode();
      setSummary(result);
      setSummarizing(false);
    } catch (_e) {
      setSummaryError('Failed to summarize');
      setSummarizing(false);
    }
  }

  async function handleAIAction(
    action: string,
    question?: string,
    overrideContent?: string
  ) {
    setAiAction(action);
    setAiResult('');
    setAiError('');
    setAiLoading(true);
    try {
      const usedContent = overrideContent ?? content;
      const res = await fetch('/api/ai-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: usedContent, action, question }),
      });
      if (!res.body) {
        throw new Error('No response body');
      }
      const reader = res.body.getReader();
      let result = '';
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        result += decoder.decode(value, { stream: true });
        if (action === 'ask' || action === 'summarize') {
          setAiResult(result);
        }
        // Do not setTitle here for heading
        else if (action !== 'heading') {
          setContent(result);
        }
      }
      result += decoder.decode();
      if (action === 'ask' || action === 'summarize') {
        setAiResult(result);
      } else if (action === 'heading') {
        setTitle(result.trim());
        setUnsaved(true);
      } else {
        setContent(result);
      }
    } catch (_e) {
      setAiError('Failed to process AI action');
    }
    setAiLoading(false);
  }

  async function handleAIHeading() {
    setHeadingLoading(true);
    await handleAIAction('heading');
    setHeadingLoading(false);
  }

  return (
    <main
      className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-4"
      style={{ height: '100vh', minHeight: '100vh' }}
    >
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <>
          <nav className="right-12 flex items-center gap-2 md:absolute">
            <Button asChild size={'icon'} variant="ghost">
              <Link href={'/'}>
                <ArrowLeft />
              </Link>
            </Button>
            <Button asChild size={'icon'} variant="ghost">
              <Link href={'/'}>
                <Home />
              </Link>
            </Button>
            <Button
              aria-label="Delete note"
              className="ml-auto"
              onClick={handleDelete}
              size={'icon'}
              variant="ghost"
            >
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          </nav>
          <Input
            className="w-full border-none bg-transparent p-0 font-semibold text-2xl text-[#1d4ed8] focus-visible:border-0 focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0"
            onChange={handleTitleChange}
            placeholder="Note title..."
            style={{ minHeight: 0, boxShadow: 'none', border: 'none' }}
            value={title}
          />
          <TagInput
            className="mb-2"
            onTagsChange={(newTags) => {
              setTags(newTags);
              setUnsaved(true);
            }}
            placeholder="Add tags..."
            suggestions={allTags}
            tags={tags}
          />
          <div
            className="flex flex-1 flex-col gap-3"
            style={{ height: 'calc(100vh - 220px)' }}
          >
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleAIAction('ask', askInput);
              }}
            >
              <Input
                className="rounded border px-4 py-1 text-sm"
                disabled={aiLoading}
                onChange={(e) => setAskInput(e.target.value)}
                placeholder="Ask a question..."
                type="text"
                value={askInput}
              />
              <Button
                disabled={aiLoading || !askInput.trim() || !content.trim()}
                type="submit"
                variant="outline"
              >
                Ask
              </Button>
            </form>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Button
                className="grow"
                disabled={aiLoading || !content.trim()}
                onClick={() => handleAIAction('summarize')}
                variant="outline"
              >
                Summarize
              </Button>
              <Button
                className="grow"
                disabled={aiLoading || !content.trim()}
                onClick={() => handleAIAction('rewrite')}
                variant="outline"
              >
                Rewrite
              </Button>
              <Button
                className="grow"
                disabled={aiLoading || !content.trim()}
                onClick={() => handleAIAction('fix')}
                variant="outline"
              >
                Fix Grammar
              </Button>
              <Button
                className="grow"
                disabled={aiLoading || !content.trim()}
                onClick={() => {
                  setAiEditContent(content);
                  setShowAiEdit(true);
                  setAiEditPrompt('');
                }}
                variant="outline"
              >
                Edit with AI
              </Button>
              <Button
                className="grow"
                disabled={headingLoading || !content.trim()}
                onClick={handleAIHeading}
                variant="outline"
              >
                Generate Heading
              </Button>
            </div>
            <Modal onOpenChange={setShowAiEdit} open={showAiEdit}>
              <ModalContent className="flex h-full max-h-[95vh] w-full max-w-[95%] flex-col gap-4 p-4 sm:p-8">
                <ModalHeader>
                  <ModalTitle>Edit with AI</ModalTitle>
                </ModalHeader>
                <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden sm:flex-row sm:gap-8">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="mb-2 font-semibold">Original Note</span>
                    <ScrollArea className="flex-1 whitespace-pre-wrap rounded-card border border-border bg-muted/30 p-2 text-base">
                      {content}
                    </ScrollArea>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="mb-2 font-semibold">
                      AI Edited Note (Diff)
                    </span>
                    <ScrollArea className="flex-1 whitespace-pre-wrap rounded-card border border-border p-2 text-base">
                      {getDiffLines(content, aiEditContent).map((line, idx) => (
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
                </div>{' '}
                <div className="flex flex-col gap-4">
                  <Input
                    className="w-full"
                    onChange={(e) => setAiEditPrompt(e.target.value)}
                    placeholder="Enter your prompt for AI..."
                    size={'lg'}
                    type="text"
                    value={aiEditPrompt}
                  />
                  <Button
                    className="self-end"
                    disabled={aiLoading || !aiEditPrompt.trim()}
                    onClick={async () => {
                      setAiLoading(true);
                      setAiError('');
                      try {
                        const prompt =
                          aiEditPrompt.trim() +
                          "\nDo not include any meta text like 'Here's a summary:', 'Here's a simplified version:', or similar. Only output the result.";
                        const res = await fetch('/api/ai-action', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            content,
                            action: 'rewrite',
                            question: prompt,
                          }),
                        });
                        if (!res.body) {
                          throw new Error('No response body');
                        }
                        const reader = res.body.getReader();
                        let result = '';
                        const decoder = new TextDecoder();
                        while (true) {
                          const { done, value } = await reader.read();
                          if (done) {
                            break;
                          }
                          result += decoder.decode(value, { stream: true });
                        }
                        result += decoder.decode();
                        setAiEditContent(result);
                      } catch (_e) {
                        setAiError('Failed to process AI action');
                      }
                      setAiLoading(false);
                    }}
                    variant="outline"
                  >
                    Run AI Edit
                  </Button>
                </div>
                <ModalFooter className="mt-6 justify-end">
                  <Button
                    onClick={() => setShowAiEdit(false)}
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={aiEditContent.trim() === content.trim()}
                    onClick={async () => {
                      setShowAiEdit(false);
                      if (note) {
                        try {
                          const updated = await updateNote(note.id, {
                            content: aiEditContent,
                            title,
                            tags,
                          });
                          setUnsaved(false);
                          setNote(updated);
                          setContent(aiEditContent);
                        } catch (_error) {}
                      }
                    }}
                    type="button"
                    variant="default"
                  >
                    Confirm
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <div className="flex gap-2">
              {(aiAction === 'ask' || aiAction === 'summarize') && aiResult && (
                <div className="mb-2 rounded bg-muted p-3 text-base">
                  <span className="font-semibold capitalize">{aiAction}:</span>{' '}
                  {aiResult}
                </div>
              )}
              {aiError && (
                <div className="mb-2 rounded bg-destructive/10 p-3 text-base text-destructive">
                  {aiError}
                </div>
              )}
            </div>
            <ScrollArea className="w-full flex-1">
              <Textarea
                className="h-auto min-h-[80px] w-full flex-1 rounded-ele border-none bg-transparent p-0 px-0 py-2 text-base shadow-none focus:outline-none"
                onBlur={(e) => {
                  setContent(e.target.value);
                }}
                onChange={(e) => {
                  setContent(e.target.value);
                  setUnsaved(true);
                }}
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
            {unsaved && (
              <Alert
                className="fixed right-3 bottom-3 w-fit max-w-[95%] rounded-0 text-center"
                variant={'info'}
              >
                You have unsaved changes.
              </Alert>
            )}
            <Button
              disabled={!unsaved}
              loading={saving}
              onClick={handleSave}
              variant="default"
            >
              Save
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
