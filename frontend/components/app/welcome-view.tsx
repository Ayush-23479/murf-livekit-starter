import { Button } from '@/components/ui/button';

function WelcomeImage() {
  // Shield-with-checkmark: signals trust and security, fitting a financial support agent.
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-4 size-16 text-[var(--ava-accent)]"
    >
      <path
        d="M32 4L10 13V29C10 43.36 19.44 56.68 32 60C44.56 56.68 54 43.36 54 29V13L32 4Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M22 32L29 39L43 24"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} style={{ '--ava-accent': '#0F766E' } as React.CSSProperties}>
      <section className="bg-background flex flex-col items-center justify-center px-6 text-center">
        <WelcomeImage />

        <h1 className="text-foreground text-xl font-semibold">Meet Ava</h1>

        <p className="text-muted-foreground mt-2 max-w-prose pt-1 leading-6 font-medium">
          Your AI financial support assistant. Ask about your account, billing, or subscriptions —
          Ava never asks for passwords, OTPs, or card details.
        </p>

        <Button
          size="lg"
          onClick={onStartCall}
          className="mt-6 w-64 rounded-full bg-[var(--ava-accent)] font-mono text-xs font-bold tracking-wider text-white uppercase hover:opacity-90"
        >
          {startButtonText}
        </Button>
      </section>

      <div className="fixed bottom-5 left-0 flex w-full items-center justify-center">
        <p className="text-muted-foreground max-w-prose pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
          Need help getting set up? Check out the{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.livekit.io/agents/start/voice-ai/"
              className="underline"
            >
              Voice AI quickstart
            </a>
            .
          </p>
        </div>
    </div>
  );
};