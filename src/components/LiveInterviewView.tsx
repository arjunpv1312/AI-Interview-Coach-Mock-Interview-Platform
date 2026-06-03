import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { ChatMessage } from '../types';
import { Logo } from './Logo';
import { Clock, Video, Mic, CheckCircle2, Building2, BrainCircuit, RefreshCcw, Camera, HelpCircle, Send } from 'lucide-react';
import { motion } from 'motion/react';

interface LiveInterviewViewProps {
  config: any;
  onComplete: (history: ChatMessage[]) => void;
  onCancel: () => void;
}

export function LiveInterviewView({ config, onComplete, onCancel }: LiveInterviewViewProps) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [timeLeft, setTimeLeft] = useState(() => {
    switch (config.difficulty) {
      case 'Easy': return 15 * 60;
      case 'Hard': return 45 * 60;
      case 'Medium':
      default: return 30 * 60;
    }
  });
  const [answerText, setAnswerText] = useState('');
  const [isThinking, setIsThinking] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [turnCount, setTurnCount] = useState(1);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  
  const isMicOnRef = useRef(true);
  const isThinkingRef = useRef(true);
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const answerTextRef = useRef('');
  const persistedTranscriptRef = useRef('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const liveTranscriptEndRef = useRef<HTMLDivElement>(null);
  
  const recognitionRef = useRef<any>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakingSessionRef = useRef(0);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };
    getDevices();
  }, []);

  const getSelectedVoice = () => {
    if (selectedVoiceRef.current) return selectedVoiceRef.current;
    
    const voices = window.speechSynthesis.getVoices();
    const goodVoices = voices.filter(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Microsoft David') ||
       v.name.includes('Microsoft Mark') ||
       v.name.includes('Microsoft Zira') ||
       v.name.includes('Google US English') ||
       v.name.includes('Google UK English') ||
       v.name.includes('Premium') ||
       v.name.includes('Samantha') ||
       v.name.includes('Natural') ||
       v.name.includes('Neural'))
    );
    
    if (goodVoices.length > 0) {
      // Randomly pick one of the high-quality voices
      const randomChoice = goodVoices[Math.floor(Math.random() * goodVoices.length)];
      selectedVoiceRef.current = randomChoice;
      return randomChoice;
    }
    
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  };

  const stopSpeech = () => {
      speakingSessionRef.current++;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
  };

  const speakText = (text: string) => {
    stopSpeech();
    const currentSession = speakingSessionRef.current;
    
    if (recognitionRef.current) {
        try { 
            recognitionRef.current.abort(); 
            isRecognizingRef.current = false;
        } catch(e) {}
    }
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    
    // Some browsers need a resume if it was paused
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
    
    setTimeout(() => {
        if (!text) {
            setIsSpeaking(false);
            return;
        }

        // Split text by sentence boundaries to avoid Chrome 15s SpeechSynthesis bug
        const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+/g)?.filter(s => s.trim().length > 0) || [text];
        let currentIndex = 0;

        const speakNext = () => {
            if (speakingSessionRef.current !== currentSession) return;
            
            if (currentIndex >= sentences.length) {
                setIsSpeaking(false);
                isSpeakingRef.current = false;
                
                // Re-enable mic synchronously if applicable
                if (recognitionRef.current && isMicOnRef.current && !isThinkingRef.current) {
                    if (!isRecognizingRef.current) {
                        try {
                            recognitionRef.current.start();
                            isRecognizingRef.current = true;
                        } catch(e) {}
                    }
                }
                return;
            }

            const sentence = sentences[currentIndex];
            const utterance = new SpeechSynthesisUtterance(sentence.trim());
            utteranceRef.current = utterance; // Prevent GC
            const voice = getSelectedVoice();
            if (voice) utterance.voice = voice;
            
            // Ensure volume is up
            utterance.volume = 1.0;
            utterance.rate = 0.95; // Slightly faster to sound natural
            utterance.pitch = 1.0;
            
            let fallbackTimeout: NodeJS.Timeout;
            
            utterance.onend = () => {
                clearTimeout(fallbackTimeout);
                currentIndex++;
                speakNext();
            };
            
            utterance.onerror = (e: any) => {
                clearTimeout(fallbackTimeout);
                console.warn("SpeechSynthesis error:", e.error || e);
                // If it was deliberately canceled by our stopSpeech, just return.
                if (e.error === 'canceled' || e.error === 'interrupted') return;
                
                // Otherwise, move to the next sentence or abort if it's a persistent error like not-allowed.
                if (e.error === 'not-allowed') {
                    setIsSpeaking(false);
                    return;
                }
                
                currentIndex++;
                speakNext();
            };

            window.speechSynthesis.speak(utterance);
            
            // Fallback timeout in case onend never fires (e.g. browser bug or silent fail)
            // Assumes ~150 words per minute -> ~2.5 words per second -> ~0.4s per word
            const estimatedDuration = Math.max(2500, sentence.split(' ').length * 400 + 1500);
            fallbackTimeout = setTimeout(() => {
                console.warn("SpeechSynthesis onend timeout, moving to next sentence.");
                window.speechSynthesis.cancel();
                currentIndex++;
                speakNext();
            }, estimatedDuration);
        };

        speakNext();
    }, 50);
  };

  useEffect(() => {
    const loadVoices = () => { window.speechSynthesis.getVoices(); };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Initial greeting and first question
  const hasFetchedInitialRef = useRef(false);
  useEffect(() => {
    const fetchNextResponse = async (currentHistory: ChatMessage[]) => {
      try {
        const res = await fetch('/api/interact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: config.company, role: config.role, history: currentHistory })
        });
        
        let data;
        const textResponse = await res.text();
        try {
            data = JSON.parse(textResponse);
        } catch (e) {
            console.error("Failed to parse API response", textResponse);
            data = { text: "I'm having trouble connecting to the server. Let's gracefully move on or try again." };
        }
        
        const aiMessage = { role: 'interviewer' as const, text: data.text || data.error || "Network error" };
        setHistory(prev => [...prev, aiMessage]);
        setIsThinking(false);

        speakText(data.text);
      } catch (err) {
        console.error(err);
        setIsThinking(false);
      }
    };
    
    // Start with empty history to trigger the first greeting
    if (history.length === 0 && !hasFetchedInitialRef.current) {
       hasFetchedInitialRef.current = true;
       fetchNextResponse([]);
    }
  }, []); // Run once on mount

  useEffect(() => {
    // Detect gender once voice is loaded
    const voice = getSelectedVoice();
    if (voice) {
        if (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('david') || voice.name.toLowerCase().includes('mark')) {
            setVoiceGender('male');
        } else {
            setVoiceGender('female');
        }
    }
  }, [getSelectedVoice]);
  
  useEffect(() => {
      // Auto-scroll transcript textarea
      if (transcriptTextareaRef.current) {
          transcriptTextareaRef.current.scrollTop = transcriptTextareaRef.current.scrollHeight;
      }
      // Auto-scroll live transcript pane
      if (liveTranscriptEndRef.current) {
          liveTranscriptEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
                } catch(e) {}
            }
        } else {
            if (isRecognizingRef.current) {
                try { 
                    recognitionRef.current.abort(); 
                    isRecognizingRef.current = false;
                } catch(e) {}
            }
        }
    }
  }, [isMicOn, isThinking, isSpeaking]);

  useEffect(() => {
    answerTextRef.current = answerText;
  }, [answerText]);

  // Silence detection for auto-submit
  useEffect(() => {
    if (isMicOn && answerText.trim() && !isThinking) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
         // Auto submit when user gives > 10 seconds of silence and mic is ON
         if (!isThinkingRef.current && answerTextRef.current.trim().length > 5) { // Ensure they actually said something substantial
             handleSubmit();
         }
      }, 10000);
    }
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }
  }, [answerText, isMicOn, isThinking]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        if (isSpeakingRef.current) {
            return; // Strict turn-taking: ignore transcriptions while interviewer speaks
        }

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
         // Keep it alive if mic is deliberately on and we are not thinking
         if (isMicOnRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
             if (!isRecognizingRef.current) {
                 try {
                    recognitionRef.current.start();
                    isRecognizingRef.current = true;
                 } catch(e) {}
             }
         }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        isRecognizingRef.current = false;
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.error("Speech recognition error", event.error);
        }
        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
            setIsMicOn(false);
        }
      };

      if (isMicOnRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
          if (!isRecognizingRef.current) {
              try {
                  recognitionRef.current.start();
                  isRecognizingRef.current = true;
              } catch(e) {}
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
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
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

  const submitCandidateInteraction = async (textOveride?: string) => {
    const finalAnswer = textOveride || answerText;
    if (!finalAnswer.trim()) return;

    if (isMicOnRef.current) {
       if (isRecognizingRef.current) {
           recognitionRef.current?.stop(); 
           isRecognizingRef.current = false;
       }
    }

    const currentMessage: ChatMessage = { role: 'candidate', text: finalAnswer };
    const newHistory = [...history, currentMessage];
    
    setHistory(newHistory);
    setAnswerText('');
    persistedTranscriptRef.current = '';
    setIsThinking(true);
    setTurnCount(prev => prev + 1);

    try {
        const res = await fetch('/api/interact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: config.company, role: config.role, history: newHistory })
        });
        
        let data;
        const textResponse = await res.text();
        try {
            data = JSON.parse(textResponse);
        } catch (e) {
            console.error("Failed to parse API response", textResponse);
            data = { text: "I'm having trouble connecting right now." };
        }
        
        const aiMessage = { role: 'interviewer' as const, text: data.text || data.error || "Network error" };
        setHistory(prev => [...prev, aiMessage]);
        setIsThinking(false);

        speakText(data.text);
    } catch (e) {
        setIsThinking(false);
        console.error(e);
    }
  };

  const handleSubmit = () => submitCandidateInteraction();
  
  const handleStuck = () => {
    submitCandidateInteraction("I don't know the answer. Can you give me a hint or rephrase the question?");
  };

  const repeatLastAudio = () => {
     const lastMsg = [...history].reverse().find(msg => msg.role === 'interviewer');
     if (lastMsg) {
        speakText(lastMsg.text);
     }
  };
  
  const toggleCamera = () => {
      setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] min-h-[700px] flex flex-col animate-in fade-in duration-700">
      
      {/* Top Banner */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 mb-6 flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-xl flex items-center justify-center shadow-inner border border-slate-600/50">
            <Building2 className="text-blue-400 drop-shadow-md" size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">{config.company} <span className="text-slate-400 font-medium">Interview</span></h2>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold border border-blue-500/20 tracking-wide uppercase">{config.type}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-xs font-semibold border border-slate-700 tracking-wide uppercase">{config.role}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
            <div className="flex items-center gap-2.5 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
                <Clock size={18} className="text-slate-400" />
                <span className={`font-mono font-medium tracking-wider text-base ${timeLeft < 300 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                    {formatTime(timeLeft)}
                </span>
            </div>
            <div className="h-8 w-px bg-slate-700/50 mx-1"></div>
            <button onClick={onCancel} className="text-slate-400 hover:text-white px-3 font-medium transition-colors text-sm uppercase tracking-wider">Discard</button>
            <button 
                onClick={() => {
                    stopSpeech();
                    onComplete(history);
                }} 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 uppercase tracking-widest text-sm border border-blue-500/30"
                title="End the interview early and view results"
            >
                End & Evaluate
            </button>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 h-full pb-6">
        
        {/* Left Side: Interviewer Animation (40%) */}
        <div className="lg:w-[40%] flex flex-col gap-6 h-full">
          
          <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 flex flex-col shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
             
             <div className="z-10 flex flex-col items-center text-center w-full relative pt-4 flex-1">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                    <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center shadow-2xl p-1 z-20 relative overflow-hidden transition-all duration-500 hover:scale-105">
                        {isThinking ? (
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <img src={voiceGender === 'male' ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=512&h=512&q=80' : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=512&h=512&q=80'} alt="Interviewer" className="w-20 h-20 rounded-full opacity-40 object-cover saturate-0 mix-blend-luminosity" />
                                <div className="flex gap-2.5">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        ) : isSpeaking ? (
                            <div className="flex flex-col items-center justify-center w-full h-full relative">
                                <img src={voiceGender === 'male' ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=512&h=512&q=80' : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=512&h=512&q=80'} alt="Interviewer" className="w-full h-full object-cover rounded-[2.3rem] opacity-90 scale-105 transition-transform duration-700" />
                                <div className="absolute bottom-3 flex gap-2 items-center justify-center w-[70%] bg-slate-900/80 backdrop-blur-md py-2.5 px-4 rounded-full border border-slate-700/50">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <motion.div 
                                            key={i}
                                            className="w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                                            animate={{ height: ["6px", "20px", "10px", "24px", "8px"] }}
                                            transition={{
                                                duration: 1.2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: i * 0.15,
                                                repeatType: "mirror"
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full relative">
                                <img src={voiceGender === 'male' ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=512&h=512&q=80' : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=512&h=512&q=80'} alt="Interviewer" className="w-full h-full object-cover rounded-[2.3rem]" />
                                <div className="absolute inset-0 border-[3px] border-transparent rounded-[2.3rem]" />
                            </div>
                        )}
                    </div>
                </div>
                
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2 tracking-wide">
                    {isThinking ? 'Analyzing Response' : isSpeaking ? 'Interviewer Speaking' : 'Listening...'}
                </h3>
                <p className="text-slate-400 mb-6 max-w-[280px] text-sm tracking-wide">
                    {isThinking ? 'Please hold on for a moment.' : isSpeaking ? 'Listen carefully to the next question.' : 'The microphone is active. Speak clearly.'}
                </p>

                {/* Live Transcript Pane */}
                <div className="w-full max-w-md w-full flex-1 mb-auto bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl text-left overflow-y-auto shadow-inner min-h-[160px] max-h-[220px] flex flex-col gap-3 relative">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2 sticky top-0 bg-slate-800/80 p-2 -mx-2 -mt-2 z-10 backdrop-blur rounded-t-xl">
                       <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                       Live Transcript
                    </div>
                    
                    {history.map((msg, i) => (
                        <div key={i} className={`flex flex-col gap-1 ${msg.role === 'interviewer' ? 'items-start' : 'items-end'}`}>
                            <span className={`text-[10px] font-bold tracking-wider uppercase ${msg.role === 'interviewer' ? 'text-blue-400' : 'text-slate-400'}`}>
                                {msg.role === 'interviewer' ? 'Interviewer' : 'You'}
                            </span>
                            <div className={`p-3 rounded-xl text-[14px] leading-relaxed max-w-[90%] font-medium ${msg.role === 'interviewer' ? 'bg-slate-700/50 text-slate-200 rounded-tl-none' : 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {/* Live transcription of what user is currently speaking */}
                    {(!isThinking && answerText.trim()) ? (
                        <div className="flex flex-col gap-1 items-end opacity-70">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                                You
                            </span>
                            <div className="p-3 rounded-xl text-[14px] leading-relaxed max-w-[90%] font-medium bg-blue-600/10 border border-blue-500/20 text-blue-100 rounded-tr-none">
                                {answerText}
                            </div>
                        </div>
                    ) : null}
                    <div ref={liveTranscriptEndRef} className="h-1 w-full shrink-0" />
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    <button 
                      onClick={repeatLastAudio}
                      disabled={isThinking}
                      className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700 backdrop-blur disabled:opacity-50 border border-slate-700/80 rounded-xl text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-lg"
                    >
                      <RefreshCcw size={16} />
                      Replay Voice
                    </button>
                    
                    <button 
                      onClick={handleStuck}
                      disabled={isThinking || isMicOn === false}
                      className="px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-30 text-amber-500 border border-amber-500/30 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg"
                    >
                      <HelpCircle size={16} />
                      Need Hint
                    </button>
                    
                    <button 
                      onClick={() => submitCandidateInteraction()}
                      disabled={isThinking || !answerText.trim() || isSpeaking}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 disabled:border-slate-600 rounded-xl font-bold tracking-wide transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 border border-blue-500/50"
                    >
                      <Send size={16} />
                      Send Reply
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Recording Area (60%) */}
        <div className="lg:w-[60%] bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 flex flex-col shadow-2xl overflow-hidden relative group/right">
          
          <div className="flex-1 bg-black/80 rounded-2xl overflow-hidden relative border border-slate-700/80 shadow-2xl min-h-[300px]">
             {/* @ts-ignore */}
             <Webcam 
                audio={false}
                videoConstraints={selectedDeviceId ? { deviceId: selectedDeviceId } : { facingMode: "user" }}
                className="w-full h-full object-cover opacity-90 transition-opacity duration-1000"
                mirrored={facingMode === "user"}
                onUserMediaError={(err: any) => console.error("Webcam Error: ", err)}
             />
             
             {/* Subtle vignette effect for webcam */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

             <div className="absolute top-5 right-5 flex items-center gap-3 opacity-0 group-hover/right:opacity-100 transition-opacity duration-300 z-50">
                {devices.length > 1 && (
                    <select 
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold tracking-wider uppercase border border-slate-700/80 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-xl"
                    >
                        {devices.map((device, idx) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${idx + 1}`}
                            </option>
                        ))}
                    </select>
                )}
                <button 
                    onClick={toggleCamera}
                    className="p-2.5 bg-slate-900/90 hover:bg-blue-600 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-xl text-white transition-all flex items-center gap-2"
                    title="Switch Camera (Front/Rear)"
                >
                    <Camera size={16} />
                    <span className="text-xs font-bold tracking-wider uppercase">Flip</span>
                </button>
             </div>
             
             {/* Active Mic Indicator overlay on webcam */}
             {isMicOn && !isThinking && !isSpeaking && (
                 <div className="absolute bottom-5 right-5 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50">
                     <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                     <span className="text-xs font-bold text-white tracking-widest uppercase">Rec</span>
                 </div>
             )}
          </div>

          {/* Transcript input display */}
          <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center justify-between px-2">
                  <label className="text-[11px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
                    <Mic size={14} className="text-blue-400" />
                    Speech Transcript
                  </label>
                  <span className="text-[11px] font-bold text-blue-400/80 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    Turn {turnCount}
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
                placeholder={isThinking ? "Awaiting next question..." : isSpeaking ? "Interviewer speaking..." : isMicOn ? "Listening... or type your answer here (auto-submits 10s after silence)" : "Microphone disabled. Type your answer here..."}
                className="w-full h-32 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 text-slate-200 font-medium text-[15px] leading-relaxed shadow-inner overflow-y-auto transition-all focus:border-blue-500/50 focus:bg-slate-800/60 focus:outline-none resize-none disabled:opacity-50"
              />
          </div>

          <div className="mt-5 flex items-center justify-between px-3 bg-slate-800/30 rounded-xl p-3 border border-slate-700/30 shadow-inner">
              {isThinking ? (
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  Analyzing response...
                </div>
              ) : isSpeaking ? (
                <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Broadcasting audio...
                </div>
              ) : isMicOn ? (
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  Listening
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  Microphone off
                </div>
              )}
              
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <span>Auto-submit 5s</span>
                 <RefreshCcw size={14} className={answerText.trim() ? "animate-spin text-blue-400" : "opacity-50"} />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
