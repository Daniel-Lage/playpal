import "spotify-web-playback-sdk";

declare global {
  interface Window {
    onSpotifyPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}
