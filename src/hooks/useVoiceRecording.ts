import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceRecordingOptions {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  autoSend?: boolean;
  silenceThreshold?: number;
  silenceDuration?: number;
}

export function useVoiceRecording(options: UseVoiceRecordingOptions = {}) {
  const {
    onRecordingComplete,
    autoSend = true,
    silenceThreshold = -50,
    silenceDuration = 2000,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number>(0);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('UNSUPPORTED');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      setPermission('granted');
      setError(null);
      return stream;
    } catch (err: any) {
      console.error('Microphone access error:', err);
      
      let errorMessage = 'Could not access microphone';
      
      if (err.name === 'NotFoundError' || err.message === 'Requested device not found') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
        setPermission('denied');
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone access denied. Please enable microphone permissions in your browser settings.';
        setPermission('denied');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Microphone is already in use by another application. Please close other apps using the microphone.';
        setPermission('denied');
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'No microphone meets the required settings. Try using a different microphone.';
        setPermission('denied');
      } else if (err.message === 'UNSUPPORTED') {
        errorMessage = 'Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.';
        setPermission('denied');
      } else {
        setPermission('denied');
      }
      
      setError(errorMessage);
      return null;
    }
  }, []);

  const stopRecording = useCallback((auto = false) => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, [isRecording]);

  const checkSilence = useCallback(() => {
    if (!analyserRef.current || !autoSend) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const decibels = 20 * Math.log10(average / 255);

    if (decibels < silenceThreshold) {
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          stopRecording(true);
        }, silenceDuration);
      }
    } else {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
  }, [autoSend, silenceThreshold, silenceDuration, stopRecording]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    const stream = await requestMicrophonePermission();
    if (!stream) return false;

    try {
      setAudioStream(stream);
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
          ? 'audio/ogg;codecs=opus'
          : 'audio/webm',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        setHasRecording(true);
        setIsRecording(false);

        stream.getTracks().forEach(track => track.stop());
        setAudioStream(null);

        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        const duration = Date.now() - startTimeRef.current;
        
        if (autoSend && onRecordingComplete) {
          onRecordingComplete(blob, duration);
        }
      };

      mediaRecorderRef.current = mediaRecorder;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 1024;
      analyserRef.current.smoothingTimeConstant = 0.85;

      mediaRecorder.start(250);
      setIsRecording(true);
      setHasRecording(false);
      startTimeRef.current = Date.now();
      setElapsedTime(0);

      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        checkSilence();
      }, 1000);

      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      stream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
      setError('Failed to start recording. Please try again.');
      return false;
    }
  }, [requestMicrophonePermission, autoSend, onRecordingComplete, checkSilence]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        checkSilence();
      }, 1000);
    }
  }, [isPaused, checkSilence]);

  const reset = useCallback(() => {
    setElapsedTime(0);
    setHasRecording(false);
    setAudioBlob(null);
    audioChunksRef.current = [];
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream]);

  return {
    isRecording,
    isPaused,
    hasRecording,
    elapsedTime: formatTime(elapsedTime),
    audioBlob,
    audioStream,
    permission,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  };
}

