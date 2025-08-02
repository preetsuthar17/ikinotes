'use client';

import { useState } from 'react';

// Components
import { NoteEditor } from '@/components/note-editor';

// Hooks
import { useAIActions } from '@/hooks/use-ai-actions';
import { useNote } from '@/hooks/use-note';

export default function NewNotePage() {
  const [headingLoading, setHeadingLoading] = useState(false);

  const {
    note,
    content,
    title,
    tags,
    allTags,
    loading,
    unsaved,
    saving,
    handleSave,
    handleDelete,
    updateContent,
    updateTitle,
    updateTags,
  } = useNote();

  const { aiAction, aiResult, aiLoading, aiError, executeAIAction } =
    useAIActions();

  const handleAIAction = (action: string, question?: string) => {
    executeAIAction(
      content,
      action as any,
      question,
      updateContent,
      updateTitle
    );
  };

  const handleAIHeading = async () => {
    setHeadingLoading(true);
    await executeAIAction(
      content,
      'heading',
      undefined,
      updateContent,
      updateTitle
    );
    setHeadingLoading(false);
  };

  return (
    <main
      className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-4"
      style={{ height: '100vh', minHeight: '100vh' }}
    >
      <NoteEditor
        aiAction={aiAction}
        aiError={aiError}
        aiLoading={aiLoading}
        aiResult={aiResult}
        allTags={allTags}
        content={content}
        headingLoading={headingLoading}
        loading={loading}
        note={note}
        onAIAction={handleAIAction}
        onAIHeading={handleAIHeading}
        onContentChange={updateContent}
        onDelete={handleDelete}
        onSave={handleSave}
        onTagsChange={updateTags}
        onTitleChange={updateTitle}
        saving={saving}
        tags={tags}
        title={title}
        unsaved={unsaved}
      />
    </main>
  );
}
