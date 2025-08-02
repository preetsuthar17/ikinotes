// UI Components
import { Loader } from '@/components/ui/loader';

export function AuthLoadingSection() {
  return (
    <section className="flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader />
      </div>
    </section>
  );
}
