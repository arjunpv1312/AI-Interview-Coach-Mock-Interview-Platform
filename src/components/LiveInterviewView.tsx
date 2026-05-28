import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { ChatMessage } from '../types';
import { Clock, Video, Mic, CheckCircle2, Building2, BrainCircuit, RefreshCcw, Camera, HelpCircle, Send } from 'lucide-react';

interface LiveInterviewViewProps {
  config: any;
  onComplete: (history: ChatMessage[]) => void;
  onCancel: () => void;
}

export function LiveInterviewView({ config, onComplete, onCancel }: LiveInterviewViewProps) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins total time
  const [isRecording, setIsRecording] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [isThinking, setIsThinking] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [turnCount, setTurnCount] = useState(1);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);

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
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.name.includes('Google US English')) 
        || voices.find(v => v.lang.startsWith('en') && (v.name.includes('Premium') || v.name.includes('Samantha')))
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0];
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getSelectedVoice();
        if (voice) utterance.voice = voice;
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
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
    if (history.length === 0) {
       fetchNextResponse([]);
    }
  }, []); // Run once on mount

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setAnswerText(currentTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const submitCandidateInteraction = async (textOveride?: string) => {
    const finalAnswer = textOveride || answerText;
    if (!finalAnswer.trim()) return;

    if (isRecording) {
       recognitionRef.current?.stop();
       setIsRecording(false);
    }

    const currentMessage: ChatMessage = { role: 'candidate', text: finalAnswer };
    const newHistory = [...history, currentMessage];
    
    setHistory(newHistory);
    setAnswerText('');
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
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] min-h-[650px] flex flex-col animate-in fade-in duration-500">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
            <Building2 className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{config.company} Interview</h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">{config.type}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">{config.role}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 font-medium">
                <Clock size={18} />
                <span className={timeLeft < 300 ? 'text-rose-400 animate-pulse' : ''}>{formatTime(timeLeft)} remaining</span>
            </div>
            <div className="h-6 w-px bg-slate-700 mx-2"></div>
            <button onClick={onCancel} className="text-slate-400 hover:text-white px-4 font-medium transition-colors">Discard</button>
            <button 
                onClick={() => {
                    window.speechSynthesis.cancel();
                    onComplete(history);
                }} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold transition-colors"
                title="End the interview early and view results"
            >
                End & Evaluate
            </button>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full pb-4">
        
        {/* Left Side: Interviewer Animation (40%) */}
        <div className="lg:w-[40%] flex flex-col gap-6 h-full">
          
          <div className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col shadow-lg items-center justify-center relative overflow-hidden">
             
             {/* Abstract wave background effect */}
             <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                 <div className={`w-64 h-64 rounded-full ${isThinking ? 'bg-purple-500' : 'bg-blue-500'} blur-3xl animate-pulse`}></div>
             </div>

             <div className="z-10 flex flex-col items-center text-center w-full">
                <div className="w-32 h-32 mb-6 rounded-3xl bg-slate-800 border border-slate-700/50 p-2 shadow-2xl relative">
                   <img src="/src/assets/images/tutor_logo_1779982364511.png" alt="Tutor Mascot" className="w-full h-full object-cover rounded-xl" />
                   
                   {!isThinking && !isRecording && (
                       <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-500 border-4 border-slate-900 flex items-center justify-center animate-pulse">
                          <Mic size={14} className="text-white" />
                       </div>
                   )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                    {isThinking ? 'Interviewer is thinking...' : 'Interviewer is listening'}
                </h3>
                <p className="text-slate-400 mb-8 max-w-[280px] text-sm">
                    {isThinking ? 'Please wait a moment.' : 'Listen carefully to the question. Do not read.'}
                </p>
                
                <div className="flex gap-3">
                    <button 
                      onClick={repeatLastAudio}
                      disabled={isThinking}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-xl text-white font-medium transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <RefreshCcw size={18} />
                      Repeat Voice
                    </button>
                    
                    <button 
                      onClick={handleStuck}
                      disabled={isThinking || isRecording}
                      className="px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 text-amber-400 border border-amber-500/20 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <HelpCircle size={18} />
                      I'm Stuck
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Recording Area (60%) */}
        <div className="lg:w-[60%] bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col shadow-lg overflow-hidden relative">
          
          <div className="flex-1 bg-black rounded-xl overflow-hidden relative border border-slate-800 shadow-inner group min-h-[300px]">
             <Webcam 
                audio={false}
                videoConstraints={selectedDeviceId ? { deviceId: selectedDeviceId, facingMode } : { facingMode }}
                className="w-full h-full object-cover"
                mirrored={facingMode === "user"}
                onUserMediaError={(err) => console.error("Webcam Error: ", err)}
             />
             <div className="absolute top-4 right-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {devices.length > 1 && (
                    <select 
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="bg-slate-900/80 backdrop-blur text-white text-sm font-medium border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="p-3 bg-slate-900/60 hover:bg-blue-600 backdrop-blur rounded-lg shadow-lg text-white transition-colors flex items-center gap-2"
                    title="Switch Camera (Front/Rear)"
                >
                    <Camera size={18} />
                    <span className="text-sm font-medium">Flip Input</span>
                </button>
             </div>
          </div>

          {/* Transcript input */}
          <div className="mt-4">
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block flex items-center justify-between">
                <span>Your Response (Speech Transcript)</span>
                <span className="text-blue-400 normal-case">Turn {turnCount}</span>
              </label>
              <textarea 
                className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 resize-none font-medium text-lg leading-relaxed shadow-inner"
                placeholder={isRecording ? "Listening to you speak..." : "Click 'Start Recording', speak your answer, then send..."}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button 
              onClick={() => {
                if (!isRecording) {
                  window.speechSynthesis.cancel(); // Stop AI speaking if user interrupts
                  try {
                    recognitionRef.current?.start();
                  } catch (e) {
                    // ignore
                  }
                  setIsRecording(true);
                  setAnswerText('');
                } else {
                  recognitionRef.current?.stop();
                  setIsRecording(false);
                  
                  // Auto submit slightly after giving the recognition time to append final text
                  setTimeout(() => {
                    setAnswerText(currentText => {
                       if (currentText.trim()) {
                         submitCandidateInteraction(currentText);
                         return '';
                       }
                       return currentText;
                    });
                  }, 500);
                }
              }}
              disabled={isThinking}
              className={`px-6 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all shadow-lg ${
                isRecording 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/50 hover:bg-rose-500/20' 
                  : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 disabled:opacity-50'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-400 animate-pulse' : 'bg-slate-400'}`} />
              {isRecording ? 'Stop & Reply' : 'Click to Speak'}
            </button>

            <button 
              onClick={handleSubmit}
              disabled={!answerText.trim() && !isRecording} // require some input
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-3 transition-colors shadow-lg shadow-blue-600/20"
            >
              Send Draft
              <Send size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
