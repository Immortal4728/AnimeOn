import React, { useEffect, useState } from "react";

interface CrtGlitchContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function CrtGlitchContainer({ children, className = "" }: CrtGlitchContainerProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    const scheduleNextGlitch = () => {
      // Trigger glitch every 2.0s to 5.5s for unpredictable CRT signal bursts
      const delay = Math.floor(Math.random() * 3500) + 2000;
      timeoutId = setTimeout(() => {
        if (isCancelled) return;
        setIsGlitching(true);

        // Glitch burst duration between 140ms and 260ms
        const burstDuration = Math.floor(Math.random() * 120) + 140;
        setTimeout(() => {
          if (!isCancelled) {
            setIsGlitching(false);
            scheduleNextGlitch();
          }
        }, burstDuration);
      }, delay);
    };

    scheduleNextGlitch();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      className={`crt-screen-overlay crt-scanlines ${
        isGlitching ? "is-crt-glitching" : ""
      } ${className}`}
    >
      <div className="crt-distortion-bar" aria-hidden="true" />
      {children}
    </div>
  );
}
