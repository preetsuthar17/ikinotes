import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function OnboardingSection() {
  return (
    <section className="flex flex-col items-center gap-8 text-center">
      <header className="flex flex-col gap-4">
        <h2 className="font-bold text-3xl tracking-tight">Welcome to Iki</h2>
        <p className="max-w-lg text-muted-foreground">
          A beautiful, AI-powered note-taking application that helps you
          capture, organize, and enhance your thoughts effortlessly.
        </p>
      </header>

      <div className="flex w-full max-w-sm flex-wrap items-center justify-center gap-4">
        <SignUpButton mode="modal">
          <Button className="w-fit font-medium" size="lg">
            Get Started For Free
          </Button>
        </SignUpButton>
        <SignInButton mode="modal">
          <Button className="w-fit font-medium" size="lg" variant="outline">
            Sign In
          </Button>
        </SignInButton>
      </div>
    </section>
  );
}
