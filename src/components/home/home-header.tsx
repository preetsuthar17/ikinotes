// Third-party
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import { Github, NotebookPen } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// UI Components
import { Button } from '@/components/ui/button';

interface HomeHeaderProps {
  onCreateNote?: () => Promise<void>;
  showAuth?: boolean;
}

export function HomeHeader({ onCreateNote, showAuth = true }: HomeHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNote = async () => {
    if (!onCreateNote) {
      return;
    }
    setIsLoading(true);
    try {
      await onCreateNote();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="font-bold text-3xl tracking-tight">Iki</h1>
      </div>
      <div className="flex gap-2">
        {showAuth && (
          <>
            <SignedOut>
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="outline">Sign Up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  },
                }}
              />
            </SignedIn>
          </>
        )}
        <Button asChild size="icon" variant="secondary">
          <Link
            href="http://github.com/preetsuthar17/iki"
            rel="noopener"
            target="_blank"
          >
            <Github />
          </Link>
        </Button>
        {showAuth && (
          <SignedIn>
            <Button loading={isLoading} onClick={handleCreateNote}>
              New Note
              <NotebookPen />
            </Button>
          </SignedIn>
        )}
      </div>
    </header>
  );
}
