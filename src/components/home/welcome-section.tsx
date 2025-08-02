// Third-party
import { SignInButton, SignUpButton } from '@clerk/nextjs';

// UI Components
import { Button } from '@/components/ui/button';

export function WelcomeSection() {
  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-2xl">Welcome to Iki</h2>
        <p className="text-muted-foreground">
          A beautiful, open-source note-taking application. Sign in to start
          creating and managing your notes.
        </p>
      </div>
      <div className="flex justify-center gap-4">
        <SignInButton mode="modal">
          <Button size="lg">Get Started</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button size="lg" variant="outline">
            Create Account
          </Button>
        </SignUpButton>
      </div>
    </section>
  );
}
