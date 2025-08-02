'use client';

// Home Components
import { 
  AuthLoadingSection,
  ErrorMessage, 
  HomeHeader, 
  NotesFilter, 
  NotesList, 
  OnboardingSection 
} from '@/components/home';

// Hooks
import { useHomeState } from '@/hooks';export default function Home() {
  const {
    loading,
    tagFilter,
    dateOrder,
    error,
    allTags,
    grouped,
    untagged,
    hasNotes,
    isSignedIn,
    isLoaded,
    setTagFilter,
    setDateOrder,
    handleCreateNote,
  } = useHomeState();

  // Show loading state while Clerk is determining authentication status
  if (!isLoaded) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-14 px-4 py-12">
        <HomeHeader showAuth={false} />
        <AuthLoadingSection />
      </main>
    );
  }

  // Show onboarding for unauthenticated users
  if (!isSignedIn) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-14 px-4 py-12">
        <HomeHeader showAuth={false} />
        <OnboardingSection />
      </main>
    );
  }

  // Show main app for authenticated users
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-14 px-4 py-12">
      <HomeHeader onCreateNote={handleCreateNote} />

      <section className="flex flex-col gap-6">
        {error && <ErrorMessage message={error} />}
        <div className="flex flex-col gap-14">
          <NotesFilter
            allTags={allTags}
            dateOrder={dateOrder}
            onDateOrderChange={setDateOrder}
            onTagFilterChange={setTagFilter}
            tagFilter={tagFilter}
          />
          <div className="font-medium">
            <NotesList
              grouped={grouped}
              hasNotes={hasNotes}
              loading={loading}
              untagged={untagged}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
