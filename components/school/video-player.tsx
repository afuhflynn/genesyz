"use client";

import { Loader2, Play, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  videoId: string;
  onProgress?: (percent: number) => void;
  onComplete?: () => void;
  onReady?: () => void;
}

const YOUTUBE_THROTTLE_MS = 5000;
let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined")
    return Promise.reject(new Error("Video is only available in the browser"));
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    const previousReady = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(
      () => reject(new Error("YouTube took too long to load")),
      15000,
    );

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      window.clearTimeout(timeout);
      resolve();
    };

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("YouTube could not be loaded"));
      };
      document.head.appendChild(script);
    }
  }).catch((error) => {
    youtubeApiPromise = null;
    throw error;
  });

  return youtubeApiPromise;
}

export function VideoPlayer({
  videoId,
  onProgress,
  onComplete,
  onReady,
}: VideoPlayerProps) {
  // YouTube replaces the element passed to YT.Player with its iframe. Keep
  // that element outside React's rendered tree so React never reconciles a
  // node that the iframe API has removed or moved.
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbacksRef = useRef({ onProgress, onComplete, onReady });
  const maxPercentRef = useRef(0);
  const lastReportRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    callbacksRef.current = { onProgress, onComplete, onReady };
  }, [onProgress, onComplete, onReady]);

  useEffect(() => {
    let disposed = false;
    let player: YT.Player | null = null;
    maxPercentRef.current = 0;
    lastReportRef.current = 0;
    setIsLoading(true);
    setIsPlaying(false);
    setError(null);

    const reportProgress = (percent: number) => {
      const now = Date.now();
      if (
        percent >= maxPercentRef.current &&
        (percent === 100 || now - lastReportRef.current >= YOUTUBE_THROTTLE_MS)
      ) {
        maxPercentRef.current = percent;
        lastReportRef.current = now;
        callbacksRef.current.onProgress?.(percent);
      }
    };

    const stopTracking = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    const startTracking = () => {
      stopTracking();
      intervalRef.current = setInterval(() => {
        const activePlayer = playerRef.current;
        if (!activePlayer || disposed) return;
        const duration = activePlayer.getDuration();
        if (duration > 0)
          reportProgress(
            Math.min(
              100,
              Math.round((activePlayer.getCurrentTime() / duration) * 100),
            ),
          );
      }, YOUTUBE_THROTTLE_MS);
    };

    loadYouTubeApi()
      .then(() => {
        if (disposed || !hostRef.current || !window.YT?.Player) return;
        const mountNode = document.createElement("div");
        mountNode.className = "h-full w-full";
        hostRef.current.appendChild(mountNode);
        player = new window.YT.Player(mountNode, {
          videoId,
          height: "100%",
          width: "100%",
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
            origin: window.location.origin,
            playsinline: 1,
          },
          events: {
            onReady: () => {
              if (disposed) return;
              setIsLoading(false);
              setIsPlaying(false);
              callbacksRef.current.onReady?.();
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (disposed) return;
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                startTracking();
              }
              if (event.data !== window.YT.PlayerState.PLAYING) {
                setIsPlaying(false);
                stopTracking();
              }
              if (event.data === window.YT.PlayerState.ENDED) {
                reportProgress(100);
                callbacksRef.current.onComplete?.();
              }
            },
            onError: () => {
              if (disposed) return;
              setError(
                "This video could not be loaded. Try refreshing the lesson.",
              );
              setIsLoading(false);
            },
          },
        });
        playerRef.current = player;
      })
      .catch((loadError) => {
        if (!disposed) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "This video could not be loaded.",
          );
          setIsLoading(false);
        }
      });

    return () => {
      disposed = true;
      stopTracking();
      const currentPlayer = player;
      player = null;
      playerRef.current = null;
      try {
        currentPlayer?.destroy();
      } catch {
        // The iframe API can finish removing its iframe asynchronously.
      }
      hostRef.current?.replaceChildren();
    };
  }, [videoId]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-sm ring-1 ring-border">
      {isLoading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/95 text-foreground backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Loading lesson video…
          </span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
          <PlayCircle className="h-8 w-8 text-primary" />
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
        </div>
      )}
      {!isLoading && !error && !isPlaying && (
        <button
          type="button"
          aria-label="Play lesson video"
          onClick={() => playerRef.current?.playVideo()}
          className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-background/70 transition hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
        >
          <Play className="ml-1 h-7 w-7 fill-current" />
        </button>
      )}
      <div ref={hostRef} className="h-full w-full" />
    </div>
  );
}
