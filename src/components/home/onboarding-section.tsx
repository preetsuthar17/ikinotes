import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function OnboardingSection() {
    return (
        <section className="flex flex-col items-center gap-8 text-center">
            <header className="flex flex-col gap-4">
                <h2 className="font-bold text-3xl tracking-tight">Welcome to Iki</h2>
                <p className="text-muted-foreground max-w-lg">
                    A beautiful, AI-powered note-taking application that helps you capture, organize, and enhance your thoughts effortlessly.
                </p>
            </header>

            <div className="flex flex-wrap gap-4 w-full max-w-sm justify-center items-center">
                <SignUpButton mode="modal">
                    <Button size="lg" className="w-fit font-medium">Get Started For Free</Button>
                </SignUpButton>
                <SignInButton mode="modal">
                    <Button size="lg" variant="outline" className="w-fit font-medium">Sign In</Button>
                </SignInButton>
            </div>
        </section>
    );
}
