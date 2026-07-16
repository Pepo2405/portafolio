import { Howl } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";
import songList from "src/lists/music.json";

export interface Track {
  title: string;
  artist?: string;
  album?: string;
  url: string;
  cover?: string;
}

export interface AudioPlayer {
  tracks: Track[];
  currentIndex: number;
  track: Track;
  playing: boolean;
  position: number;
  duration: number;
  volume: number;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
  playIndex: (i: number) => void;
}

const TRACKS = songList.songs as Track[];
const INITIAL_VOLUME = 0.5;

export default function useAudioPlayer(): AudioPlayer {
  const howlsRef = useRef<Howl[]>([]);
  const rafRef = useRef<number | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(INITIAL_VOLUME);

  // Refs mirror state so Howl callbacks wired once at construction read live
  // values instead of capturing stale ones.
  const indexRef = useRef(currentIndex);
  indexRef.current = currentIndex;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const playIndexRef = useRef<(i: number) => void>(() => {});

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startRaf = useCallback((howl: Howl) => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    const tick = () => {
      setPosition(howl.seek() as number);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Build one Howl per track (Web Audio mode, needed for the analyser tap).
  // onload backfills duration (Howler loads async); onend autoplays the next
  // track. Both read live state through refs.
  const getHowl = useCallback((i: number): Howl => {
    let howl = howlsRef.current[i];
    if (!howl) {
      howl = new Howl({
        src: [TRACKS[i].url],
        html5: false,
        volume: volumeRef.current,
        onload: () => {
          if (i === indexRef.current) setDuration(howl.duration());
        },
        onend: () => {
          setPlaying(false);
          setPosition(0);
          playIndexRef.current(i + 1);
        },
      });
      howlsRef.current[i] = howl;
    }
    return howl;
  }, []);

  const playIndex = useCallback(
    (i: number) => {
      const clamped = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
      howlsRef.current.forEach((h, idx) => {
        if (h && idx !== clamped) h.stop();
      });
      const howl = getHowl(clamped);
      howl.volume(volumeRef.current);
      howl.seek(0);
      howl.play();
      setCurrentIndex(clamped);
      setDuration(howl.state() === "loaded" ? howl.duration() : 0);
      setPlaying(true);
      startRaf(howl);
    },
    [getHowl, startRaf]
  );
  playIndexRef.current = playIndex;

  const togglePlay = useCallback(() => {
    const howl = getHowl(indexRef.current);
    if (howl.playing()) {
      howl.pause();
      setPlaying(false);
      stopRaf();
    } else {
      // Resumes from the paused position, or plays from 0 after a stop.
      howl.volume(volumeRef.current);
      howl.play();
      if (howl.state() === "loaded") setDuration(howl.duration());
      setPlaying(true);
      startRaf(howl);
    }
  }, [getHowl, startRaf, stopRaf]);

  const next = useCallback(() => playIndex(indexRef.current + 1), [playIndex]);
  const prev = useCallback(() => playIndex(indexRef.current - 1), [playIndex]);

  const stop = useCallback(() => {
    getHowl(indexRef.current).stop();
    setPlaying(false);
    setPosition(0);
    stopRaf();
  }, [getHowl, stopRaf]);

  const seek = useCallback(
    (sec: number) => {
      getHowl(indexRef.current).seek(sec);
      setPosition(sec);
    },
    [getHowl]
  );

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    const howl = howlsRef.current[indexRef.current];
    if (howl) howl.volume(v);
  }, []);

  // Cleanup on unmount: stop the rAF and unload all Howls.
  useEffect(() => {
    const howls = howlsRef.current;
    return () => {
      stopRaf();
      howls.forEach((h) => h && h.unload());
    };
  }, [stopRaf]);

  return {
    tracks: TRACKS,
    currentIndex,
    track: TRACKS[currentIndex],
    playing,
    position,
    duration,
    volume,
    togglePlay,
    next,
    prev,
    stop,
    seek,
    setVolume,
    playIndex,
  };
}
