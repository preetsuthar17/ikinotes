import { ArrowLeft, Home, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface NoteNavigationProps {
  onDelete: () => void;
}

export function NoteNavigation({ onDelete }: NoteNavigationProps) {
  return (
    <nav className="right-12 flex items-center gap-2 md:absolute">
      <Button asChild size="icon" variant="ghost">
        <Link href="/">
          <ArrowLeft />
        </Link>
      </Button>
      <Button asChild size="icon" variant="ghost">
        <Link href="/">
          <Home />
        </Link>
      </Button>
      <Button
        aria-label="Delete note"
        className="ml-auto"
        onClick={onDelete}
        size="icon"
        variant="ghost"
      >
        <Trash2 className="h-5 w-5 text-destructive" />
      </Button>
    </nav>
  );
}
