// UI Components
import { Loader } from '@/components/ui/loader';

export function AuthLoadingSection() {
  return (
    <section className="flex justify-center items-center">
      <div className="flex flex-col items-center gap-4">
        <Loader />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </section>
  );
}
