import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { ChatMessage, InterviewConfig } from '../types';
import {
  Clock,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Building2,
  RefreshCcw,
  Camera,
  HelpCircle,
  Send,
  AlertCircle,
  Volume2,
  VolumeX,
  FileText,
  MessageSquare,
  ShieldAlert,
  SlidersHorizontal,
  UserCheck,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import maleInterviewerImg from '../assets/images/interviewer_male_1794822328504.jpg';
import femaleInterviewerImg from '../assets/images/interviewer_female_1794822328889.jpg';

interface LiveInterviewViewProps {
  config: InterviewConfig;
  onComplete: (history: ChatMessage[]) => void;
  onCancel: () => void;
}

export function LiveInterviewView({
  config,
  onComplete,
  onCancel,
}: LiveInterviewViewProps) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [timeLeft, setTimeLeft] = useState(() => {
    switch (config.difficulty) {
      case 'Easy':
        return 15 * 60;
      case 'Hard':
        return 45 * 60;
      case 'Medium':
      default:
        return 30 * 60;
    }
  });
  const [answerText, setAnswerText] = useState('');
  const [isThinking, setIsThinking] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [turnCount, setTurnCount] = useState(1);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [errorToast, setErrorToast] = useState('');
  const [webcamError, setWebcamError] = useState(false);
  const [webcamErrorMessage, setWebcamErrorMessage] = useState('');

  // Ultra-Pro Studio Multi-Toggles
  const [isMicOn, setIsMicOn] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [showTranscript, setShowTranscript] = useState(true);
  const [showResumeDrawer, setShowResumeDrawer] = useState(false);
  const [strictMode, setStrictMode] = useState(Boolean(config.strictMode));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const isMicOnRef = useRef(true);
  const voiceEnabledRef = useRef(true);
  const isThinkingRef = useRef(true);
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const answerTextRef = useRef('');
  const persistedTranscriptRef = useRef('');
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const liveTranscriptEndRef = useRef<HTMLDivElement>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakingSessionRef = useRef(0);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
    if (!voiceEnabled) {
      stopSpeech();
    }
  }, [voiceEnabled]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
          return;
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = mediaDevices.filter(
          (device) => device.kind === 'videoinput' && Boolean(device.deviceId)
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0 && videoDevices[0].deviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.warn('Error enumerating devices:', err);
      }
    };
    getDevices();
  }, []);

  const handleWebcamError = (err: any) => {
    console.warn('Webcam Error: ', err);
    setWebcamError(true);
    const msg =
      typeof err === 'string'
        ? err
        : err?.message || err?.name || 'Could not start video source';
    setWebcamErrorMessage(msg);
  };

  const handleWebcamSuccess = () => {
    setWebcamError(false);
    setWebcamErrorMessage('');
  };

  const retryWebcam = () => {
    setWebcamError(false);
    setWebcamErrorMessage('');
    setSelectedDeviceId('');
    setCameraEnabled(true);
  };

  const getSelectedVoice = (gender: 'male' | 'female') => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const findVoice = (keywords: string[]) =>
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          keywords.some((k) => v.name.toLowerCase().includes(k.toLowerCase()))
      );

    if (gender === 'male') {
      return (
        findVoice(['Guy', 'David', 'Mark', 'Daniel', 'Alex', 'Google UK English Male']) ||
        voices.find((v) => v.lang.startsWith('en-US')) ||
        voices[0]
      );
    }

    return (
      findVoice(['Aria', 'Jenny', 'Samantha', 'Google US English', 'Google UK English Female', 'Zira']) ||
      voices.find((v) => v.lang.startsWith('en-US')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0]
    );
  };

  const stopSpeech = () => {
    speakingSessionRef.current++;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  };

  const speakText = (text: string) => {
    stopSpeech();
    if (!voiceEnabledRef.current || !('speechSynthesis' in window)) {
      return;
    }
    const currentSession = speakingSessionRef.current;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        isRecognizingRef.current = false;
      } catch {
        // ignore
      }
    }
    setIsSpeaking(true);
    isSpeakingRef.current = true;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    setTimeout(() => {
      if (!text || !voiceEnabledRef.current) {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        return;
      }

      const sentences =
        text.match(/[^.!?]+[.!?]+|[^.!?]+/g)?.filter((s) => s.trim().length > 0) ||
        [text];
      let currentIndex = 0;

      const speakNext = () => {
        if (
          speakingSessionRef.current !== currentSession ||
          !voiceEnabledRef.current
        ) {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          return;
        }

        if (currentIndex >= sentences.length) {
          setIsSpeaking(false);
          isSpeakingRef.current = false;

          if (
            recognitionRef.current &&
            isMicOnRef.current &&
            !isThinkingRef.current &&
            !isRecognizingRef.current
          ) {
            try {
              recognitionRef.current.start();
              isRecognizingRef.current = true;
            } catch {
              // ignore
            }
          }
          return;
        }

        const sentence = sentences[currentIndex];
        const utterance = new SpeechSynthesisUtterance(sentence.trim());
        utteranceRef.current = utterance;
        const voice = getSelectedVoice(voiceGender);
        if (voice) utterance.voice = voice;

        utterance.volume = 1.0;
        utterance.rate = 1.02;
        utterance.pitch = 1.0;

        let fallbackTimeout: ReturnType<typeof setTimeout>;

        utterance.onend = () => {
          clearTimeout(fallbackTimeout);
          currentIndex++;
          speakNext();
        };

        utterance.onerror = (e: any) => {
          clearTimeout(fallbackTimeout);
          if (e.error === 'canceled' || e.error === 'interrupted') return;
          if (e.error === 'not-allowed') {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            return;
          }
          currentIndex++;
          speakNext();
        };

        window.speechSynthesis.speak(utterance);

        const estimatedDuration = Math.max(
          5000,
          sentence.split(/\s+/).length * 800 + 5000
        );
        fallbackTimeout = setTimeout(() => {
          window.speechSynthesis.cancel();
          currentIndex++;
          speakNext();
        }, estimatedDuration);
      };

      speakNext();
    }, 50);
  };

  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
    };
    loadVoices();
    if ('speechSynthesis' in window && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Audio Visualizer
  useEffect(() => {
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let animationFrameId: number;
    let isActive = true;

    const initAudio = async () => {
      if (!isMicOn || isThinking || isSpeaking) {
        if (visualizerCanvasRef.current) {
          const ctx = visualizerCanvasRef.current.getContext('2d');
          if (ctx)
            ctx.clearRect(
              0,
              0,
              visualizerCanvasRef.current.width,
              visualizerCanvasRef.current.height
            );
        }
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;

        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          if (!isActive) return;
          animationFrameId = requestAnimationFrame(draw);

          const canvas = visualizerCanvasRef.current;
          if (!canvas || !analyser) return;

          const canvasCtx = canvas.getContext('2d');
          if (!canvasCtx) return;

          const WIDTH = canvas.width;
          const HEIGHT = canvas.height;

          analyser.getByteTimeDomainData(dataArray);

          canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
          canvasCtx.lineWidth = 2;
          canvasCtx.strokeStyle = '#38bdf8';
          canvasCtx.beginPath();

          const sliceWidth = (WIDTH * 1.0) / bufferLength;
          let x = 0;

          let maxVal = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = Math.abs(dataArray[i] / 128.0 - 1);
            if (v > maxVal) maxVal = v;
          }

          const scale = maxVal > 0.8 ? 0.8 / maxVal : 1;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = HEIGHT / 2 + (v - 1) * scale * HEIGHT;

            if (i === 0) canvasCtx.moveTo(x, y);
            else canvasCtx.lineTo(x, y);

            x += sliceWidth;
          }

          canvasCtx.lineTo(WIDTH, HEIGHT / 2);
          canvasCtx.stroke();
        };

        draw();
      } catch {
        // mic unavailable
      }
    };

    initAudio();

    return () => {
      isActive = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (source) source.disconnect();
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [isMicOn, isThinking, isSpeaking]);

  const buildInteractPayload = (currentHistory: ChatMessage[]) => ({
    company: config.company,
    role: config.role,
    type: config.type,
    difficulty: config.difficulty,
    experience: config.experience,
    resumeProfile: config.resumeProfile || null,
    startWithResume: config.startWithResume !== false,
    strictMode,
    focusTopics: config.focusTopics || '',
    history: currentHistory,
  });

  const postInteractWithRetry = async (
    currentHistory: ChatMessage[],
    maxAttempts = 2
  ) => {
    let lastErr: any = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);
      try {
        const res = await fetch('/api/interact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildInteractPayload(currentHistory)),
          signal: controller.signal,
        });
        clearTimeout(timer);
        const textResponse = await res.text();
        try {
          return JSON.parse(textResponse);
        } catch {
          return {
            error: true,
            text: "I'm having trouble connecting to the server. Please try again.",
          };
        }
      } catch (err) {
        clearTimeout(timer);
        lastErr = err;
        if (attempt < maxAttempts - 1) {
          await new Promise((r) => setTimeout(r, 700));
        }
      }
    }
    throw lastErr || new Error('Connection timed out');
  };

  // Initial greeting and resume-grounded opening question
  const hasFetchedInitialRef = useRef(false);
  useEffect(() => {
    let mounted = true;
    const fetchNextResponse = async (currentHistory: ChatMessage[]) => {
      try {
        const data = await postInteractWithRetry(currentHistory);
        if (!mounted) return;

        if (
          data.error ||
          data.text?.includes('having a technical issue') ||
          data.text?.includes('high load') ||
          data.text?.includes('API key is missing')
        ) {
          setErrorToast(data.text || 'API connection failed. Retrying...');
          setTimeout(() => setErrorToast(''), 5000);
        } else {
          const aiMessage = {
            role: 'interviewer' as const,
            text: data.text || 'Let us begin. Could you walk me through your background?',
          };
          setHistory((prev) => [...prev, aiMessage]);
        }
        setIsThinking(false);
        if (data.text) speakText(data.text);
      } catch (err: any) {
        if (!mounted) return;
        console.warn('Initial prompt fetch retry exhausted:', err?.message || err);
        setIsThinking(false);
        setErrorToast('Connection interrupted. Click "Request Hint" or type a response to continue.');
        setTimeout(() => setErrorToast(''), 6000);
      }
    };

    if (history.length === 0 && !hasFetchedInitialRef.current) {
      hasFetchedInitialRef.current = true;
      fetchNextResponse([]);
    }
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        window.speechSynthesis &&
        window.speechSynthesis.speaking &&
        !window.speechSynthesis.paused
      ) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (transcriptTextareaRef.current) {
      transcriptTextareaRef.current.scrollTop =
        transcriptTextareaRef.current.scrollHeight;
    }
    if (liveTranscriptEndRef.current) {
      liveTranscriptEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [answerText, history]);

  useEffect(() => {
    isMicOnRef.current = isMicOn;
    isThinkingRef.current = isThinking;
    isSpeakingRef.current = isSpeaking;

    if (recognitionRef.current) {
      if (isMicOn && !isThinking && !isSpeaking) {
        if (!isRecognizingRef.current) {
          try {
            recognitionRef.current.start();
            isRecognizingRef.current = true;
          } catch {
            // ignore
          }
        }
      } else {
        if (isRecognizingRef.current) {
          try {
            recognitionRef.current.abort();
            isRecognizingRef.current = false;
          } catch {
            // ignore
          }
        }
      }
    }
  }, [isMicOn, isThinking, isSpeaking]);

  useEffect(() => {
    answerTextRef.current = answerText;
  }, [answerText]);

  // Silence detection for auto-submit (respects autoSubmitEnabled toggle)
  useEffect(() => {
    if (autoSubmitEnabled && isMicOn && answerText.trim() && !isThinking) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (!isThinkingRef.current && answerTextRef.current.trim().length > 5) {
          handleSubmit();
        }
      }, 5000);
    }
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [answerText, isMicOn, isThinking, autoSubmitEnabled]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        if (isSpeakingRef.current) return;

        let finalStr = '';
        let interimStr = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            interimStr += event.results[i][0].transcript;
          }
        }

        if (finalStr) {
          persistedTranscriptRef.current += finalStr + ' ';
        }

        setAnswerText(persistedTranscriptRef.current + interimStr);
      };

      recognitionRef.current.onend = () => {
        isRecognizingRef.current = false;
        if (
          isMicOnRef.current &&
          !isThinkingRef.current &&
          !isSpeakingRef.current
        ) {
          try {
            recognitionRef.current.start();
            isRecognizingRef.current = true;
          } catch {
            // ignore
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        isRecognizingRef.current = false;
        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
          setIsMicOn(false);
        }
        if (event.error === 'network') {
          setIsMicOn(false);
        }
      };

      if (
        isMicOnRef.current &&
        !isThinkingRef.current &&
        !isSpeakingRef.current
      ) {
        try {
          recognitionRef.current.start();
          isRecognizingRef.current = true;
        } catch {
          // ignore
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onend = null;
      }
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && !isThinking) {
      onComplete(history);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isThinking, history, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const submitCandidateInteraction = async (textOverride?: string) => {
    const finalAnswer = textOverride || answerText;
    if (!finalAnswer.trim()) return;

    if (isMicOnRef.current && isRecognizingRef.current) {
      recognitionRef.current?.stop();
      isRecognizingRef.current = false;
    }

    const currentMessage: ChatMessage = { role: 'candidate', text: finalAnswer };
    const newHistory = [...history, currentMessage];

    setHistory(newHistory);
    setAnswerText('');
    persistedTranscriptRef.current = '';
    setIsThinking(true);
    setTurnCount((prev) => prev + 1);

    try {
      const data = await postInteractWithRetry(newHistory);

      if (
        data.error ||
        data.text?.includes('having a technical issue') ||
        data.text?.includes('high load') ||
        data.text?.includes('API Key')
      ) {
        setHistory((prev) => prev.slice(0, -1));
        setAnswerText(finalAnswer);
        persistedTranscriptRef.current = finalAnswer;
        setErrorToast(
          data.text || 'API connection failed. Please try submitting again.'
        );
        setTimeout(() => setErrorToast(''), 5000);
      } else {
        const aiMessage = {
          role: 'interviewer' as const,
          text: data.text || 'Could you elaborate a bit further on that?',
        };
        setHistory((prev) => [...prev, aiMessage]);
      }

      setIsThinking(false);
      if (data.text) speakText(data.text);
    } catch (e: any) {
      console.warn('Interaction request failed:', e?.message || e);
      setHistory((prev) => prev.slice(0, -1));
      setAnswerText(finalAnswer);
      persistedTranscriptRef.current = finalAnswer;
      setIsThinking(false);
      setErrorToast('Temporary network interruption. Your answer is preserved—please click Send Response.');
      setTimeout(() => setErrorToast(''), 6000);
    }
  };

  const handleSubmit = () => submitCandidateInteraction();

  const handleStuck = () => {
    submitCandidateInteraction(
      "I'm unsure about that specific detail. Could you give me a quick hint or reframe the question?"
    );
  };

  const repeatLastAudio = () => {
    const lastMsg = [...history]
      .reverse()
      .find((msg) => msg.role === 'interviewer');
    if (lastMsg) {
      speakText(lastMsg.text);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const interviewerAvatar =
    voiceGender === 'male' ? maleInterviewerImg : femaleInterviewerImg;
  const resume = config.resumeProfile;

  return (
    <div className="w-full max-w-7xl mx-auto min-h-[calc(100vh-2rem)] flex flex-col gap-5 pb-6">
      {/* Top Studio Header Bar */}
      <div className="amoled-surface rounded-2xl p-4 sm:px-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Building2 className="text-blue-400" size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {config.company} · {config.role}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{config.type}</span>
              <span aria-hidden="true">·</span>
              <span>{config.difficulty}</span>
              {resume && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-cyan-400 font-medium">
                    Resume Active ({resume.fileName})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2 bg-black px-3.5 py-2 rounded-xl border border-[#16223b]">
            <Clock size={15} className="text-blue-400" />
            <span
              className={`font-mono text-sm font-semibold tabular-nums ${
                timeLeft < 300 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onCancel();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-[#16223b] bg-black transition-colors cursor-pointer whitespace-nowrap"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onComplete(history);
              }}
              className="amoled-btn-primary text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              End &amp; Evaluate
            </button>
          </div>
        </div>
      </div>

      {/* Ultra-Pro Multi-Toggle Session Control Dock */}
      <div className="amoled-surface rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <SlidersHorizontal size={14} className="text-blue-400" />
          <span>Session Controls</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleButton
            active={voiceEnabled}
            onClick={() => setVoiceEnabled((v) => !v)}
            icon={voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            label={voiceEnabled ? 'AI Voice: On' : 'AI Voice: Muted'}
          />

          <ToggleButton
            active={voiceGender === 'male'}
            onClick={() =>
              setVoiceGender((g) => (g === 'female' ? 'male' : 'female'))
            }
            icon={<UserCheck size={14} />}
            label={voiceGender === 'female' ? 'Voice: Female' : 'Voice: Male'}
          />

          <ToggleButton
            active={autoSubmitEnabled}
            onClick={() => setAutoSubmitEnabled((v) => !v)}
            icon={<RefreshCcw size={14} />}
            label={autoSubmitEnabled ? 'Auto-Send: 5s' : 'Auto-Send: Off'}
          />

          <ToggleButton
            active={cameraEnabled}
            onClick={() => setCameraEnabled((v) => !v)}
            icon={cameraEnabled ? <Video size={14} /> : <VideoOff size={14} />}
            label={cameraEnabled ? 'Camera: On' : 'Focus Audio'}
          />

          <ToggleButton
            active={showTranscript}
            onClick={() => setShowTranscript((v) => !v)}
            icon={<MessageSquare size={14} />}
            label="Transcript"
          />

          <ToggleButton
            active={strictMode}
            onClick={() => setStrictMode((v) => !v)}
            icon={<ShieldAlert size={14} />}
            label={strictMode ? 'Bar-Raiser: On' : 'Standard Rigor'}
          />

          {resume && (
            <ToggleButton
              active={showResumeDrawer}
              onClick={() => setShowResumeDrawer((v) => !v)}
              icon={<FileText size={14} />}
              label="Resume Context"
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-center text-xs font-medium"
          >
            {errorToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume Context Drawer */}
      <AnimatePresence>
        {showResumeDrawer && resume && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="amoled-surface rounded-2xl p-5 border-blue-500/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <FileText size={16} className="text-blue-400" />
                <span>
                  Active Resume Reference · {resume.candidateName} (
                  {resume.fileName})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowResumeDrawer(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-black border border-[#16223b] rounded-xl p-3.5 space-y-1.5">
                <div className="font-semibold text-blue-400">Core Skills</div>
                <p className="text-slate-300 leading-relaxed">
                  {resume.skills.slice(0, 12).join(' · ') || 'None parsed'}
                </p>
              </div>
              <div className="bg-black border border-[#16223b] rounded-xl p-3.5 space-y-1.5">
                <div className="font-semibold text-cyan-400">
                  Highlighted Projects
                </div>
                <ul className="space-y-1 text-slate-300">
                  {resume.projects.slice(0, 3).map((p, idx) => (
                    <li key={idx} className="truncate">
                      · {p.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-black border border-[#16223b] rounded-xl p-3.5 space-y-1.5">
                <div className="font-semibold text-blue-300">
                  Targeted Probe Angles
                </div>
                <ul className="space-y-1 text-slate-300">
                  {resume.tailoredAngles.slice(0, 2).map((angle, idx) => (
                    <li key={idx} className="line-clamp-2">
                      · {angle}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Studio Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Panel: Interviewer + Transcript (5 cols) */}
        <div className="lg:col-span-5 amoled-surface rounded-2xl p-6 flex flex-col justify-between gap-5">
          <div className="flex flex-col items-center text-center pt-2">
            <div className="relative mb-5">
              <div className="w-36 h-36 rounded-2xl bg-black border border-blue-500/30 flex items-center justify-center overflow-hidden shadow-2xl shadow-blue-950/40 relative">
                {!avatarLoadError ? (
                  <img
                    src={interviewerAvatar}
                    alt="AI Interviewer"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarLoadError(true)}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isThinking
                        ? 'opacity-45 grayscale'
                        : isSpeaking
                          ? 'scale-105 opacity-95'
                          : 'opacity-90'
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-950 to-black text-blue-400 font-bold text-2xl">
                    AI
                  </div>
                )}

                {isThinking && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}

                {isSpeaking && !isThinking && (
                  <div className="absolute bottom-2.5 flex gap-1.5 items-center justify-center bg-black/85 px-3 py-1.5 rounded-xl border border-blue-500/30">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 rounded-full bg-blue-400"
                        animate={{ height: ['5px', '16px', '7px', '18px', '6px'] }}
                        transition={{
                          duration: 1.0,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: i * 0.12,
                          repeatType: 'mirror',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white">
              {isThinking
                ? 'Formulating Follow-Up'
                : isSpeaking
                  ? 'Interviewer Speaking'
                  : 'Your Turn to Respond'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {isThinking
                ? 'Reviewing your response and resume alignment...'
                : isSpeaking
                  ? 'Listen to the prompt or read along below.'
                  : isMicOn
                    ? 'Microphone active. Speak naturally or edit text.'
                    : 'Microphone muted. Type your response below.'}
            </p>
          </div>

          {/* Toggleable Live Transcript */}
          {showTranscript && (
            <div className="flex-1 bg-black border border-[#16223b] rounded-xl p-4 overflow-y-auto min-h-[190px] max-h-[260px] flex flex-col gap-3 custom-scrollbar">
              <div className="text-[11px] font-semibold text-blue-400 sticky top-0 bg-black/95 pb-2 border-b border-[#16223b] flex items-center justify-between">
                <span>Live Conversation</span>
                <span className="font-mono text-slate-500 tabular-nums">
                  Turn {turnCount}
                </span>
              </div>

              {history.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col gap-1 ${
                    msg.role === 'interviewer' ? 'items-start' : 'items-end'
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold ${
                      msg.role === 'interviewer'
                        ? 'text-blue-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {msg.role === 'interviewer' ? 'Interviewer' : 'You'}
                  </span>
                  <div
                    className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed max-w-[92%] ${
                      msg.role === 'interviewer'
                        ? 'bg-[#0a1120] border border-[#16223b] text-slate-200'
                        : 'bg-blue-600/15 border border-blue-500/30 text-blue-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {!isThinking && answerText.trim() && (
                <div className="flex flex-col gap-1 items-end opacity-75">
                  <span className="text-[11px] font-semibold text-slate-400">
                    You (Draft)
                  </span>
                  <div className="p-3 rounded-xl text-xs sm:text-sm leading-relaxed max-w-[92%] bg-blue-600/10 border border-blue-500/20 text-blue-100">
                    {answerText}
                  </div>
                </div>
              )}
              <div ref={liveTranscriptEndRef} className="h-1 w-full shrink-0" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={repeatLastAudio}
              disabled={isThinking || !voiceEnabled}
              className="px-3.5 py-2.5 bg-black hover:bg-[#0a1120] disabled:opacity-40 border border-[#16223b] rounded-xl text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCcw size={14} />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={handleStuck}
              disabled={isThinking}
              className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle size={14} />
              <span>Request Hint</span>
            </button>

            <button
              type="button"
              onClick={() => submitCandidateInteraction()}
              disabled={isThinking || !answerText.trim() || isSpeaking}
              className="px-5 py-2.5 amoled-btn-primary text-white disabled:opacity-40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={14} />
              <span>Send Response</span>
            </button>
          </div>
        </div>

        {/* Right Panel: Video / Focus Stage & Input Dock (7 cols) */}
        <div className="lg:col-span-7 amoled-surface rounded-2xl p-6 flex flex-col gap-5 group/right">
          <div className="flex-1 bg-black rounded-2xl overflow-hidden relative border border-[#16223b] min-h-[280px] flex items-center justify-center">
            {!cameraEnabled ? (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#0a1120] border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Mic size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Audio Focus Mode Active
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Camera feed is paused to minimize distraction. Toggle Camera
                    above anytime.
                  </p>
                </div>
              </div>
            ) : !webcamError ? (
              <>
                {/* @ts-ignore */}
                <Webcam
                  key={selectedDeviceId || facingMode}
                  audio={false}
                  videoConstraints={
                    selectedDeviceId
                      ? { deviceId: selectedDeviceId }
                      : { facingMode }
                  }
                  className="w-full h-full object-cover opacity-90"
                  mirrored={facingMode === 'user'}
                  onUserMedia={handleWebcamSuccess}
                  onUserMediaError={handleWebcamError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center z-10 space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-[#0a1120] border border-[#16223b] rounded-2xl flex items-center justify-center text-amber-400 relative">
                  <VideoOff size={30} />
                  <AlertCircle
                    size={14}
                    className="absolute bottom-2 right-2 text-amber-400"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Camera Stream Unavailable
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-1">
                    {webcamErrorMessage || 'Could not start video source.'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Your voice and text interview continues seamlessly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={retryWebcam}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCcw size={13} />
                  <span>Retry Camera</span>
                </button>
              </div>
            )}

            {/* Camera Device Controls */}
            {cameraEnabled && (
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover/right:opacity-100 transition-opacity duration-200 z-30">
                {devices.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => {
                      setSelectedDeviceId(e.target.value);
                      setWebcamError(false);
                    }}
                    className="bg-black/90 text-white text-xs font-medium border border-[#16223b] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {devices.map((device, idx) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => {
                    toggleCameraFacing();
                    setWebcamError(false);
                  }}
                  className="p-2 bg-black/90 hover:bg-blue-600 rounded-xl border border-[#16223b] text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  title="Flip Camera"
                >
                  <Camera size={14} />
                  <span>Flip</span>
                </button>
              </div>
            )}

            {/* Active Audio Waveform */}
            {isMicOn && !isThinking && !isSpeaking && (
              <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-black/85 px-3.5 py-2 rounded-xl border border-[#16223b] z-20">
                <canvas
                  ref={visualizerCanvasRef}
                  width={60}
                  height={20}
                  className="opacity-90"
                />
                <span className="text-[11px] font-mono font-semibold text-cyan-400">
                  MIC LIVE
                </span>
              </div>
            )}
          </div>

          {/* Response Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Mic size={14} className="text-blue-400" />
                <span>Your Response Transcript</span>
              </label>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                {autoSubmitEnabled
                  ? 'Auto-send after 5s silence'
                  : 'Manual send mode'}
              </span>
            </div>

            <textarea
              ref={transcriptTextareaRef}
              value={answerText}
              onChange={(e) => {
                setAnswerText(e.target.value);
                persistedTranscriptRef.current = e.target.value;
              }}
              disabled={isThinking}
              placeholder={
                isThinking
                  ? 'Awaiting interviewer question...'
                  : isSpeaking
                    ? 'Interviewer is speaking...'
                    : isMicOn
                      ? 'Speak into your microphone or type your response here...'
                      : 'Microphone muted. Type your response here...'
              }
              className="w-full h-28 bg-black border border-[#16223b] rounded-xl p-4 text-slate-100 text-sm leading-relaxed focus:border-blue-500 focus:outline-none resize-none disabled:opacity-50"
            />
          </div>

          {/* Bottom Microphone & Status Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-black rounded-xl px-4 py-3 border border-[#16223b]">
            <div className="text-xs font-medium">
              {isThinking ? (
                <span className="text-blue-400">Analyzing response...</span>
              ) : isSpeaking ? (
                <span className="text-cyan-400">Interviewer speaking...</span>
              ) : isMicOn ? (
                <span className="text-emerald-400">
                  Listening via microphone
                </span>
              ) : (
                <span className="text-slate-400">
                  Microphone muted (text input active)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              disabled={isThinking || isSpeaking}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isMicOn
                  ? 'bg-blue-600/15 text-blue-300 border-blue-500/40 hover:bg-blue-600/25'
                  : 'bg-[#0a1120] text-slate-300 border-[#16223b] hover:text-white'
              }`}
            >
              {isMicOn ? <Mic size={13} /> : <MicOff size={13} />}
              <span>{isMicOn ? 'Mute Mic' : 'Enable Mic'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
        active
          ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
          : 'bg-black border-[#16223b] text-slate-400 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
