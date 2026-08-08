import { Button } from '@/components/ui/button';

function CallEndedImage() {
  // Checkmark-in-circle: signals the conversation completed successfully.
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-4 size-16 text-[var(--ava-accent)]"
    >
      <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="3" fill="none" />
      <path
        d="M22 33L28 39L42 25"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

interface CallEndedViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const CallEndedView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & CallEndedViewProps) => {
  return (
    <div ref={ref} style={{ '--ava-accent': '#0F766E' } as React.CSSProperties}>
      <section className="bg-background flex flex-col items-center justify-center px-6 text-center">
        <CallEndedImage />

        <h1 className="text-foreground text-xl font-semibold">Call ended</h1>

        <p className="text-muted-foreground mt-2 max-w-prose pt-1 leading-6 font-medium">
          Your conversation with Ava has ended. Start a new call anytime you need help with your
          account, billing, or subscriptions.
        </p>

        <Button
          size="lg"
          onClick={onStartCall}
          className="mt-6 w-64 rounded-full bg-[var(--ava-accent)] font-mono text-xs font-bold tracking-wider text-white uppercase hover:opacity-90"
        >
          {startButtonText}
        </Button>
      </section>
    </div>
  );
};