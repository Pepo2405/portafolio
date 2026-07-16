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

  // Lazily build one Howl per track in Web Audio mode (needed for the analyser).
  const getHowl = useCallback((i: number): Howl => {
    let howl = howlsRef.current[i];
    if (!howl) {
      howl = new Howl({
        src: [TRACKS[i].url],
        html5: false,
        volume: INITIAL_VOLUME,
      });
      howlsRef.current[i] = howl;
    }
    return howl;
  }, []);

  const startRaf = useCallback((howl: Howl) => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    const tick = () => {
      setPosition(howl.seek() as number);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const playIndex = useCallback(
    (i: number) => {
      const clamped = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
      // Stop everything currently sounding.
      howlsRef.current.forEach((h) => h && h.stop());
      const howl = getHowl(clamped);
      howl.volume(volume);
      howl.off("end");
      howl.once("end", () => {
        setPlaying(false);
        setPosition(0);
        playIndex(clamped + 1); // autoplay next
      });
      howl.play();
      setCurrentIndex(clamped);
      setDuration(howl.duration());
      setPlaying(true);
      startRaf(howl);
    },
    [getHowl, startRaf, volume]
  );

  const togglePlay = useCallback(() => {
    const howl = getHowl(currentIndex);
    if (playing) {
      howl.pause();
      setPlaying(false);
      stopRaf();
    } else {
      howl.volume(volume);
      if (!howl.playing()) {
        // fresh play wires the end handler + duration
        playIndex(currentIndex);
        return;
      }
      howl.play();
      setPlaying(true);
      startRaf(howl);
    }
  }, [currentIndex, getHowl, playIndex, playing, startRaf, stopRaf, volume]);

  const next = useCallback(() => playIndex(currentIndex + 1), [currentIndex, playIndex]);
  const prev = useCallback(() => playIndex(currentIndex - 1), [currentIndex, playIndex]);

  const stop = useCallback(() => {
    getHowl(currentIndex).stop();
    setPlaying(false);
    setPosition(0);
    stopRaf();
  }, [currentIndex, getHowl, stopRaf]);

  const seek = useCallback(
    (sec: number) => {
      getHowl(currentIndex).seek(sec);
      setPosition(sec);
    },
    [currentIndex, getHowl]
  );

  const setVolume = useCallback(
    (v: number) => {
      setVolumeState(v);
      const howl = howlsRef.current[currentIndex];
      if (howl) howl.volume(v);
    },
    [currentIndex]
  );

  // Cleanup on unmount: stop raf and unload all howls.
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
