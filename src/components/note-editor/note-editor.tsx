import { useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { TagInput } from '@/components/ui/tag-input';
import { updateNote } from '@/lib/note-service';

import { AIActionsToolbar } from './ai-actions-toolbar';
import { AIEditModal } from './ai-edit-modal';
import { AIResultsDisplay } from './ai-results-display';
import { NoteContentEditor } from './note-content-editor';
import { NoteNavigation } from './note-navigation';

interface NoteEditorProps {
  note: any;
  content: string;
  title: string;
  tags: string[];
  allTags: string[];
  loading: boolean;
  unsaved: boolean;
  saving: boolean;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSave: () => void;
  onDelete: () => void;
  aiAction: string | null;
  aiResult: string;
  aiError: string;
  aiLoading: boolean;
  onAIAction: (action: string, question?: string) => void;
  headingLoading: boolean;
  onAIHeading: () => void;
}

export function NoteEditor({
  note,
  content,
  title,
  tags,
  allTags,
  loading,
  unsaved,
  saving,
  onContentChange,
  onTitleChange,
  onTagsChange,
  onSave,
  onDelete,
  aiAction,
  aiResult,
  aiError,
  aiLoading,
  onAIAction,
  headingLoading,
  onAIHeading,
}: NoteEditorProps) {
  const [askInput, setAskInput] = useState('');
  const [showAiEdit, setShowAiEdit] = useState(false);
  const [aiEditContent, setAiEditContent] = useState('');

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  const handleAIEditConfirm = async (editedContent: string) => {
    setShowAiEdit(false);
    if (note) {
      try {
        const _updated = await updateNote(note.id, {
          content: editedContent,
          title,
          tags,
        });
        onContentChange(editedContent);
      } catch {
        // Handle error silently
      }
    }
  };

  return (
    <>
      <NoteNavigation onDelete={onDelete} />

      <Input
        className="w-full border-none bg-transparent p-0 font-semibold text-2xl text-[#1d4ed8] focus-visible:border-0 focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0"
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Note title..."
        style={{ minHeight: 0, boxShadow: 'none', border: 'none' }}
        value={title}
      />

      <TagInput
        onTagsChange={onTagsChange}
        placeholder="Add tags..."
        suggestions={allTags}
        tags={tags}
      />

      <div
        className="flex flex-1 flex-col gap-3"
        style={{ height: 'calc(100vh-220px)' }}
      >
        <AIActionsToolbar
          aiLoading={aiLoading}
          askInput={askInput}
          hasContent={!!content.trim()}
          headingLoading={headingLoading}
          onAsk={(question) => onAIAction('ask', question)}
          onAskInputChange={setAskInput}
          onEditWithAI={() => {
            setAiEditContent(content);
            setShowAiEdit(true);
          }}
          onFixGrammar={() => onAIAction('fix')}
          onGenerateHeading={onAIHeading}
          onRewrite={() => onAIAction('rewrite')}
          onSummarize={() => onAIAction('summarize')}
        />

        <AIEditModal
          editedContent={aiEditContent}
          onConfirm={handleAIEditConfirm}
          onEditedContentChange={setAiEditContent}
          onOpenChange={setShowAiEdit}
          open={showAiEdit}
          originalContent={content}
        />

        <AIResultsDisplay
          aiAction={aiAction}
          aiError={aiError}
          aiResult={aiResult}
        />

        <NoteContentEditor
          content={content}
          onContentChange={onContentChange}
        />

        {unsaved && (
          <Alert
            className="fixed right-3 bottom-3 w-fit max-w-[95%] rounded-0 text-center"
            variant="info"
          >
            You have unsaved changes.
          </Alert>
        )}

        <Button
          disabled={!unsaved}
          loading={saving}
          onClick={onSave}
          variant="default"
        >
          Save
        </Button>
      </div>
    </>
  );
}
