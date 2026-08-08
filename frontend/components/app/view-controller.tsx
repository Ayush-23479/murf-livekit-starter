'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AgentSessionView_01 } from '@/components/agents-ui/blocks/agent-session-view-01';
import { CallEndedView } from '@/components/app/call-ended-view';
import { WelcomeView } from '@/components/app/welcome-view';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionCallEndedView = motion.create(CallEndedView);
const MotionSessionView = motion.create(AgentSessionView_01);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
} as const;

interface ViewControllerProps {
  appConfig: AppConfig;
}

export function ViewController({ appConfig }: ViewControllerProps) {
  const { isConnected, start } = useSessionContext();
  const { resolvedTheme } = useTheme();

  // Distinguish "Ready" (never connected yet) from "Call ended" (was
  // connected, then disconnected) so the user sees a clear end-of-call state.
  const wasConnectedRef = useRef(false);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    if (isConnected) {
      wasConnectedRef.current = true;
      setHasEnded(false);
    } else if (wasConnectedRef.current) {
      setHasEnded(true);
    }
  }, [isConnected]);

  const handleRestart = () => {
    setHasEnded(false);
    wasConnectedRef.current = false;
    start();
  };

  return (
    <AnimatePresence mode="wait">
      {/* Ready view (never connected yet) */}
      {!isConnected && !hasEnded && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          startButtonText={appConfig.startButtonText}
          onStartCall={start}
        />
      )}
      {/* Call ended view */}
      {!isConnected && hasEnded && (
        <MotionCallEndedView
          key="call-ended"
          {...VIEW_MOTION_PROPS}
          startButtonText="Start a new call"
          onStartCall={handleRestart}
        />
      )}
      {/* Session view */}
      {isConnected && (
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          supportsChatInput={appConfig.supportsChatInput}
          supportsVideoInput={appConfig.supportsVideoInput}
          supportsScreenShare={appConfig.supportsScreenShare}
          isPreConnectBufferEnabled={appConfig.isPreConnectBufferEnabled}
          audioVisualizerType={appConfig.audioVisualizerType}
          audioVisualizerColor={
            resolvedTheme === 'dark'
              ? appConfig.audioVisualizerColorDark
              : appConfig.audioVisualizerColor
          }
          audioVisualizerColorShift={appConfig.audioVisualizerColorShift}
          audioVisualizerBarCount={appConfig.audioVisualizerBarCount}
          audioVisualizerGridRowCount={appConfig.audioVisualizerGridRowCount}
          audioVisualizerGridColumnCount={appConfig.audioVisualizerGridColumnCount}
          audioVisualizerRadialBarCount={appConfig.audioVisualizerRadialBarCount}
          audioVisualizerRadialRadius={appConfig.audioVisualizerRadialRadius}
          audioVisualizerWaveLineWidth={appConfig.audioVisualizerWaveLineWidth}
          className="fixed inset-0"
        />
      )}
    </AnimatePresence>
  );
}