import { Suspense } from 'react';
import { Loader } from '@/components/ui/loader';

export default function NewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Loader />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
