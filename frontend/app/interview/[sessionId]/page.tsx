"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "user" | "assistant" | "system";
type Message = { role: Role; content: string; timestamp?: string };

// Simple icons
const PhoneHangIcon = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
  </svg>
);
const JoinIcon = () => (
  <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
  </svg>
);

// AV tile with ripple ring animation
function AVTile({
  name,
  initial,
  speaking = false,
  className = "",
  accent = "from-amber-900 to-amber-700",
}: { name: string; initial: string; speaking?: boolean; className?: string; accent?: string; }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-black/30 bg-gradient-to-br ${accent} ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center bg-black/25 backdrop-blur">
          <span className="text-white/95 text-3xl md:text-4xl font-semibold select-none">{initial}</span>
          <span className={`absolute inset-0 rounded-full border-2 border-white/30 ${speaking ? "animate-ping" : "opacity-0"}`} />
          <span className={`absolute inset-0 rounded-full border-2 border-white/20 ${speaking ? "animate-ping [animation-delay:200ms]" : "opacity-0"}`} />
          <span className={`absolute inset-0 rounded-full border border-white/10 ${speaking ? "animate-ping [animation-delay:400ms]" : "opacity-0"}`} />
        </div>
      </div>
      <div className="absolute bottom-3 left-4 text-white/90 text-sm font-medium drop-shadow">{name}</div>
      <div className={`absolute top-3 right-3 w-7 h-7 rounded-full ${speaking ? "bg-green-500/90" : "bg-gray-600/60"} flex items-center justify-center border border-white/20`}>
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {speaking ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          )}
        </svg>
      </div>
    </div>
  );
}

// Transcript panel
function TranscriptPanel({ conversation, interim, processing }: { conversation: Message[]; interim: string; processing: boolean; }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [conversation, interim, processing]);
  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-white font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
        Live Transcript
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto rounded-xl border border-gray-800 bg-black/40 p-4 space-y-3">
        {conversation.map((m, idx) => (
          <div key={idx} className={`px-3 py-2 rounded-lg text-sm ${m.role === "assistant" ? "bg-blue-500/10 border border-blue-500/20 text-blue-100" : "bg-gray-700/20 border border-gray-600/30 text-gray-100"}`}>
            <div className="text-[11px] opacity-70 mb-1">{m.role === "assistant" ? "AI Interviewer" : "You"}</div>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {interim && (
          <div className="px-3 py-2 rounded-lg text-sm border border-green-400/30 bg-green-500/10 text-green-100">
            <div className="text-[11px] opacity-70 mb-1">You (speaking...)</div>
            <div className="whitespace-pre-wrap">{interim}</div>
          </div>
        )}
        {processing && (
          <div className="px-3 py-2 rounded-lg text-sm border border-blue-400/30 bg-blue-500/10 text-blue-100 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400/70 animate-pulse" />
            AI is thinking...
          </div>
        )}
        {!processing && conversation.length === 0 && !interim && (
          <div className="text-gray-400 text-sm text-center py-8">Join the interview to start the conversation</div>
        )}
      </div>
    </div>
  );
}

// Simplified controls
function ControlsBar({ joined, onJoin, onLeave }: { joined: boolean; onJoin: () => void; onLeave: () => void; }) {
  return (
    <div className="flex items-center gap-3">
      {!joined ? (
        <button onClick={onJoin} className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-100 transition shadow-lg">
          <div className="flex items-center gap-2"><JoinIcon /> Join Interview</div>
        </button>
      ) : (
        <button onClick={onLeave} className="px-5 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-lg">
          <div className="flex items-center gap-2"><PhoneHangIcon /> End Interview</div>
        </button>
      )}
    </div>
  );
}

export default function InterviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  const { sessionId } = React.use(params);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("accessToken");
    return null;
  };

  const getSession = async () => {
    try {
      const data = await apiCall(`/sessions/${sessionId}`);
      return data as any;
    } catch (e) {
      return null;
    }
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
        return null;
      }
      throw new Error(res.statusText);
    }
    const ct = res.headers.get("content-type");
    if (ct && ct.includes("application/json")) return res.json();
    return null;
  };

  const [conversation, setConversation] = useState<Message[]>([]);
  const [interim, setInterim] = useState<string>("");
  const [finalAnswer, setFinalAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<boolean>(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean>(false);
  const speakingRef = useRef<boolean>(false);
  const autoSubmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const finalAnswerRef = useRef<string>("");
  const joinedRef = useRef<boolean>(false);

  // STT
  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef<boolean>(false);

  // TTS
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!synth) return;
    const loadVoices = () => setVoices(synth.getVoices());
    loadVoices();
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [synth]);

  const speak = (text: string, onEnd?: () => void) => {
    if (!synth || !text) return;
    speakingRef.current = true;
    stopListening();
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const enVoice = voices.find((v) => /en/i.test(v.lang)) || voices[0];
    if (enVoice) utter.voice = enVoice;
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.onend = () => {
      speakingRef.current = false;
      // Auto-resume listening after AI finishes speaking
      if (joinedRef.current) {
        setTimeout(() => {
          listeningRef.current = true;
          const recog = recognitionRef.current;
          if (recog) {
            try {
              recog.start();
            } catch {}
          }
        }, 500);
      }
      if (onEnd) onEnd();
    };
    synth.speak(utter);
  };

  const initRecognition = () => {
    if (typeof window === "undefined") return null;
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onresult = (event: any) => {
      let interimText = "";
      let finalText = finalAnswerRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const txt = res[0].transcript;

        if (res.isFinal) {
          finalText = (finalText + " " + txt).trim();
        } else {
          interimText += txt;
        }
      }

      setInterim(interimText);
      setFinalAnswer(finalText);
      finalAnswerRef.current = finalText;

      // Auto-submit after user stops speaking (silence detection)
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
      if (finalText && !isProcessingRef.current) {
        autoSubmitTimerRef.current = setTimeout(() => {
          if (!speakingRef.current && joinedRef.current && !isProcessingRef.current) {
            submitAnswer();
          }
        }, 1500); // Wait 1.5s of silence before auto-submitting
      }
    };

    recog.onend = () => {
      if (listeningRef.current && joinedRef.current && !speakingRef.current) {
        try {
          recog.start();
        } catch {}
      }
    };

    recog.onstart = () => {
      setMicPermissionGranted(true);
    };

    recog.onerror = (event: any) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access denied. Please allow microphone permissions and refresh the page.");
        setMicPermissionGranted(false);
        listeningRef.current = false;
      }
    };

    recognitionRef.current = recog;
    return recog;
  };

  const startListening = () => {
    if (!joined) return;
    setError(null);
    let recog = recognitionRef.current;
    if (!recog) recog = initRecognition();
    if (!recog) {
      setError("Speech Recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    listeningRef.current = true;
    setInterim("");
    try {
      recog.start();
    } catch (err: any) {
      if (err.name !== "InvalidStateError") {
        setError("Could not start microphone. Please check permissions.");
        setMicPermissionGranted(false);
      }
    }
  };

  const stopListening = () => {
    listeningRef.current = false;
    const recog = recognitionRef.current;
    if (recog) {
      try {
        recog.stop();
      } catch {}
    }
  };

  const startInterview = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(`/sessions/${sessionId}/start`, { method: "POST" });
      if (result && result.question) {
        const q = String(result.question);
        setConversation((c) => [...c, { role: "assistant", content: q }]);
        speak(q);
      }
    } catch (e: any) {
      // If already started, gracefully recover by loading current conversation
      const session = await getSession();
      if (session && session.status === "in-progress") {
        await loadConversation();
        const msgs: any[] = (session.conversation || []) as any[];
        const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");
        if (lastAssistant?.content) {
          speak(String(lastAssistant.content));
        }
      } else if (session && session.status === "completed") {
        await loadConversation();
        setError("Interview already completed.");
      } else {
        setError(e?.message || "Failed to start interview");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (isProcessingRef.current) return;

    stopListening();
    const answer = finalAnswerRef.current.trim();
    if (!answer) return;

    setFinalAnswer("");
    setInterim("");
    finalAnswerRef.current = "";
    setConversation((c) => [...c, { role: "user", content: answer }]);

    try {
      isProcessingRef.current = true;
      setLoading(true);
      const result = await apiCall(`/sessions/${sessionId}/respond`, {
        method: "POST",
        body: JSON.stringify({ answer }),
      });
      if (!result) return;

      if (result.feedback) {
        setConversation((c) => [
          ...c,
          { role: "assistant", content: "Interview completed. Thank you for your time!" },
          { role: "system", content: `Overall Feedback: ${result.feedback.overall || ""}` },
        ]);
        speak("The interview is completed. Thank you for your time. Redirecting to feedback page...", () => {
          // Redirect to feedback page after speech ends
          setTimeout(() => {
            router.push(`/feedback/${sessionId}`);
          }, 1000);
        });
        setJoined(false);
        return;
      }

      if (result.question) {
        const nextQ = String(result.question);
        setConversation((c) => [...c, { role: "assistant", content: nextQ }]);
        speak(nextQ);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to submit answer");
      // Resume listening even on error
      if (joined && !speakingRef.current) {
        setTimeout(() => startListening(), 500);
      }
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  const handleJoin = async () => {
    setJoined(true);
    joinedRef.current = true;

    // Initialize speech recognition immediately on user gesture
    if (!recognitionRef.current) {
      const recog = initRecognition();
      if (!recog) {
        setError("Speech Recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
      }
    }

    // Try to start listening immediately to trigger permission prompt
    try {
      const recog = recognitionRef.current;
      if (recog) {
        listeningRef.current = true;
        recog.start();
      }
    } catch {}


    const session = await getSession();
    if (!session || session.status === "pending") {
      await startInterview();
    } else if (session.status === "in-progress") {
      await loadConversation();
      const msgs: any[] = (session.conversation || []) as any[];
      const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");
      if (lastAssistant?.content) {
        speak(String(lastAssistant.content));
      }
    } else if (session.status === "completed") {
      await loadConversation();
      setError("This interview has already been completed.");
    }
  };

  const handleLeave = () => {
    setJoined(false);
    joinedRef.current = false;
    stopListening();
    if (synth) synth.cancel();
    speakingRef.current = false;
    isProcessingRef.current = false;
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
  };

  const loadConversation = async () => {
    try {
      const data = await apiCall(`/sessions/${sessionId}/conversation`);
      if (data && Array.isArray(data.conversation)) {
        setConversation(data.conversation);
      }
    } catch {}
  };

  useEffect(() => {
    // Preload conversation
    (async () => {
      await loadConversation();
    })();

    // Cleanup on unmount
    return () => {
      stopListening();
      if (synth) synth.cancel();
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Sync ref with state
  useEffect(() => {
    finalAnswerRef.current = finalAnswer;
  }, [finalAnswer]);

  // Derive UI states
  const processing = loading;
  const botSpeaking = speakingRef.current || processing;
  const userSpeaking = listeningRef.current && (interim.length > 0 || finalAnswer.length > 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-black/90 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="text-xl font-bold tracking-tight">AI Mock Interview</div>
            <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition border border-transparent hover:border-gray-600 rounded-lg">
              ← Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Main Stage */}
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-gradient-to-br from-gray-900 to-black aspect-video">
              {/* Main AI tile */}
              <AVTile name="AI Interviewer" initial="AI" speaking={botSpeaking} className="absolute inset-0" accent="from-blue-900 to-purple-900" />

              {/* User tile (picture-in-picture style) */}
              <div className="absolute bottom-6 right-6 w-56 sm:w-64">
                <AVTile name="You" initial="U" speaking={userSpeaking} className="h-32 sm:h-36" accent="from-slate-700 to-slate-900" />
              </div>

              {/* Status indicator */}
              <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${joined ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
                <span className="text-xs text-white/90 font-medium">
                  {joined ? (botSpeaking ? "AI Speaking" : userSpeaking ? "Listening" : "Ready") : "Not Connected"}
                </span>
              </div>

              {/* Controls overlay */}
              <div className="absolute left-0 right-0 bottom-0 px-6 py-5 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
                <ControlsBar joined={joined} onJoin={handleJoin} onLeave={handleLeave} />
              </div>

              {/* Processing overlay */}
              {processing && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-blue-400/30 bg-blue-500/10">
                    <div className="w-4 h-4 rounded-full bg-blue-400 animate-pulse" />
                    <div className="text-sm text-white font-medium">Processing...</div>
                  </div>
                </div>
              )}
            </div>

            {/* Pre-join instructions */}
            {!joined && (
              <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-100 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Before you join:</span>
                  <span className="text-blue-200/70">• You'll need to allow microphone access. Use Chrome or Edge browser for best experience.</span>
                </div>
              </div>
            )}

            {/* Microphone permission prompt */}
            {joined && !micPermissionGranted && !error && (
              <div className="px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-100 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="font-medium">Waiting for microphone access...</span>
                  <span className="text-yellow-200/70">• Please click "Allow" when your browser asks for microphone permission</span>
                </div>
              </div>
            )}

            {/* Live status message */}
            {joined && micPermissionGranted && !error && (
              <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-100 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <span className="font-medium">Live conversation active</span>
                  <span className="text-green-200/70">• Speak naturally, AI will respond when you finish</span>
                </div>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Transcript Sidebar */}
          <div className="h-[600px] lg:h-auto">
            <TranscriptPanel conversation={conversation} interim={interim} processing={processing} />
          </div>
        </div>
      </div>
    </div>
  );
}
