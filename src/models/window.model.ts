declare global {
  interface Window {
    onSpotifyPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}
