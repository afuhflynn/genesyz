declare namespace YT {
  class Player {
    constructor(element: HTMLElement, options: PlayerOptions);
    getDuration(): number;
    getCurrentTime(): number;
    playVideo(): void;
    destroy(): void;
  }

  interface PlayerOptions {
    videoId: string;
    height?: string | number;
    width?: string | number;
    playerVars?: Record<string, string | number | undefined>;
    events?: {
      onReady?: (event: PlayerEvent) => void;
      onStateChange?: (event: OnStateChangeEvent) => void;
      onError?: (event: { data: number }) => void;
    };
  }

  interface PlayerEvent {
    target: Player;
  }

  interface OnStateChangeEvent {
    data: number;
    target: Player;
  }

  const PlayerState: {
    PLAYING: number;
    ENDED: number;
  };
}

interface Window {
  onYouTubeIframeAPIReady: () => void;
}
