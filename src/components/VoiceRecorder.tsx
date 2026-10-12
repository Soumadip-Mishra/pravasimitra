import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Upload, Sparkles, FileAudio } from 'lucide-react';
import { formatTime, drawWaveform } from '../utils/audioHelper';

interface VoiceRecorderProps {
  onAudioRecorded: (blob: Blob, durationSeconds: number) => void;
  onTranscriptChanged: (transcript: string) => void;
  currentTranscript: string;
  isTranscribing: boolean;
  onTriggerTranscription: () => void;
  languageName: string;
  onLoadPresetAudio?: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioRecorded,
  onTranscriptChanged,
  currentTranscript,
  isTranscribing,
  onTriggerTranscription,
  languageName,
  onLoadPresetAudio,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Clean up canvas and audio context on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Waveform visualization loop
  const updateWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    drawWaveform(canvas, dataArray, isRecording);

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    }
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onAudioRecorded(blob, recordingTime);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      // Start duration counter
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start animation
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    } catch (err) {
      console.error('Microphone access denied or unavailable:', err);
      alert('Microphone access could not be started. You can also upload an audio file or click "Load Sample Voice Audio" to test instantly.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      // Final canvas draw
      if (canvasRef.current) {
        const dummy = new Uint8Array(128);
        drawWaveform(canvasRef.current, dummy, false);
      }
    }
  };

  const resetRecording = () => {
    if (isRecording) stopRecording();
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (canvasRef.current) {
      const dummy = new Uint8Array(128);
      drawWaveform(canvasRef.current, dummy, false);
    }
  };

  const togglePlayback = () => {
    if (!audioElementRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }

    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setRecordingTime(45);
      onAudioRecorded(file, 45);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mic className="h-5 w-5 text-amber-400" />
            <span>Voice Testimony Capture (Sarvam Saaras STT)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Record the migrant worker's raw colloquial testimony in {languageName}
          </p>
        </div>

        {onLoadPresetAudio && (
          <button
            onClick={onLoadPresetAudio}
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Load Sample Voice</span>
          </button>
        )}
      </div>

      {/* Waveform Canvas & Timer */}
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isRecording ? 'bg-rose-500 animate-ping' : audioUrl ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-medium text-slate-300">
              {isRecording ? 'Recording Live Audio...' : audioUrl ? 'Audio Captured' : 'Ready to Record'}
            </span>
          </div>
          <span className="font-mono text-sm font-bold text-amber-400">
            {formatTime(recordingTime)}
          </span>
        </div>

        {/* Real-time HTML5 Canvas Waveform */}
        <div className="relative h-20 w-full overflow-hidden rounded-xl bg-slate-900/80">
          <canvas
            ref={canvasRef}
            width={700}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Mic className="h-4 w-4" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500 animate-pulse transition-all"
              >
                <Square className="h-4 w-4" />
                <span>Stop Recording</span>
              </button>
            )}

            {audioUrl && !isRecording && (
              <>
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetRecording}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  title="Clear recording"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          {/* File Upload Option */}
          <label className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors">
            <Upload className="h-3.5 w-3.5 text-slate-400" />
            <span>Upload Audio File</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Transcript Area */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileAudio className="h-4 w-4 text-amber-400" />
            <span>Vernacular Speech Transcript ({languageName})</span>
          </label>
          {audioBlob && !isTranscribing && (
            <button
              onClick={onTriggerTranscription}
              type="button"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Re-transcribe with Saaras
            </button>
          )}
        </div>

        <div className="relative">
          <textarea
            value={currentTranscript}
            onChange={(e) => onTranscriptChanged(e.target.value)}
            rows={4}
            placeholder={`The transcribed testimony in ${languageName} will appear here. The worker can speak naturally about contractor name, site location, agreed daily wage, and unpaid days...`}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
          />
          {isTranscribing && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/80 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>Transcribing via Sarvam Saaras (saaras:v4)...</span>
              </div>
            </div>
          )}
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Tip: Colloquial dialects (Bhojpuri, Maithili, rural Bengali, Odia) and code-mixed words (thekedar, hajiri, bhatta) are recognized natively.
        </p>
      </div>
    </div>
  );
};
