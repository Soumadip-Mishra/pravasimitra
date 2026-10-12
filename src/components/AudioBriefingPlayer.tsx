import React, { useState, useRef, useEffect } from 'react';
import type { AudioAdvisory } from '../types';
import { Volume2, Play, Pause, Download, ShieldAlert, CheckCircle, Sparkles } from 'lucide-react';
import { formatTime } from '../utils/audioHelper';

interface AudioBriefingPlayerProps {
  advisory: AudioAdvisory;
  isSynthesizing: boolean;
  onReSynthesize: () => void;
}

export const AudioBriefingPlayer: React.FC<AudioBriefingPlayerProps> = ({
  advisory,
  isSynthesizing,
  onReSynthesize,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current && advisory.audioBase64) {
      const audio = audioRef.current;
      audio.src = `data:audio/wav;base64,${advisory.audioBase64}`;
      audio.playbackRate = playbackRate;
      setIsPlaying(false);
      setCurrentTime(0);

      const handleLoadedMetadata = () => {
        setDuration(audio.duration || 15);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [advisory.audioBase64, playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const downloadAudio = () => {
    if (!advisory.audioBase64) return;
    const link = document.createElement('a');
    link.href = `data:audio/wav;base64,${advisory.audioBase64}`;
    link.download = `pravasimitra_advisory_${advisory.languageCode}.wav`;
    link.click();
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      <audio ref={audioRef} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-amber-400" />
            <span>Worker Spoken Audio Briefing (Sarvam Bulbul TTS)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Voice guidance in worker's native tongue ({advisory.languageName}) explaining exact dues and legal rights
          </p>
        </div>

        <button
          onClick={onReSynthesize}
          disabled={isSynthesizing}
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{isSynthesizing ? 'Synthesizing...' : 'Re-Generate Audio'}</span>
        </button>
      </div>

      {/* Audio Player Card */}
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Play / Pause & Timers */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all shrink-0"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </button>

            <div className="flex-1 sm:w-48">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || 12)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration || 12}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 rounded-lg bg-slate-800 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Speed & Download Controls */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Speed Selector */}
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-0.5 text-xs">
              {[0.8, 1.0, 1.2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => changePlaybackRate(rate)}
                  className={`rounded-lg px-2 py-1 font-mono transition-colors ${
                    playbackRate === rate
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={downloadAudio}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Audio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vernacular Speech Content */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vernacular Script */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-2">
            Spoken Advisory in {advisory.languageName}
          </span>
          <p className="text-sm text-slate-100 leading-relaxed font-sans">
            "{advisory.transcriptVernacular}"
          </p>
        </div>

        {/* English Translation */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            English Translation of Spoken Guidance
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            "{advisory.transcriptEnglish}"
          </p>
        </div>
      </div>

      {/* Practical Action Checklist for Worker */}
      <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-3">
          <ShieldAlert className="h-4 w-4" />
          <span>Worker Rights & Safety Protocol</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
          {advisory.keyInstructions.map((instruction, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{instruction}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
