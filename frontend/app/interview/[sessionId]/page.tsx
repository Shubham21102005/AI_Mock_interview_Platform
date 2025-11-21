"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Phone, Video } from "lucide-react";

type Role = "user" | "assistant" | "system";
type Message = { role: Role; content: string; timestamp?: string };

// Transcript panel
function TranscriptPanel({
  conversation,
  interim,
  processing,
}: {
  conversation: Message[];
  interim: string;
  processing: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [conversation, interim, processing]);

  return (
    <div className="w-full h-full flex flex-col bg-white border-2 border-[#e9ecef] rounded-2xl overflow-hidden shadow-lg">
      <div className="border-b-2 border-[#e9ecef] p-4 bg-gradient-to-r from-[#f8f9fa] to-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#424769] rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <span className="font-bold text-[#2d3250] text-sm">
            Live Transcript
          </span>
        </div>
      </div>

      <div
        ref={ref}
        className="flex-1 overflow-y-auto bg-gradient-to-br from-[#f8f9fa] to-white p-4 space-y-3"
      >
        {conversation.map((m, idx) => (
          <div
            key={idx}
            className={`border-2 p-4 rounded-xl text-sm shadow-sm ${
              m.role === "assistant"
                ? "border-[#f9b17a] bg-[#f9b17a]/5"
                : "border-[#e9ecef] bg-white"
            }`}
          >
            <div className="text-xs font-semibold text-[#676f9d] mb-2 flex items-center gap-2">
              {m.role === "assistant" ? (
                <>
                  <div className="w-2 h-2 bg-[#f9b17a] rounded-full"></div>
                  AI Interviewer
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-[#424769] rounded-full"></div>
                  You
                </>
              )}
            </div>
            <div className="whitespace-pre-wrap text-[#2d3250] leading-relaxed">{m.content}</div>
          </div>
        ))}

        {interim && (
          <div className="border-2 border-[#10b981] p-4 rounded-xl text-sm shadow-md bg-[#10b981]/5">
            <div className="text-xs font-semibold text-[#10b981] mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
              You (speaking...)
            </div>
            <div className="whitespace-pre-wrap text-[#10b981]">{interim}</div>
          </div>
        )}

        {processing && (
          <div className="border-2 border-[#f9b17a] p-4 rounded-xl text-sm flex items-center gap-3 shadow-md bg-[#f9b17a]/5">
            <div className="w-3 h-3 bg-[#f9b17a] rounded-full animate-pulse" />
            <span className="font-medium text-[#f9b17a]">
              AI is thinking...
            </span>
          </div>
        )}

        {!processing && conversation.length === 0 && !interim && (
          <div className="text-[#adb5bd] text-sm text-center py-12 font-medium">
            Join the interview to start the conversation
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const router = useRouter();
  const { sessionId } = React.use(params);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getAuthToken = () => {
    if (typeof window !== "undefined")
      return localStorage.getItem("accessToken");
    return null;
  };

  const getSession = async () => {
    try {
      const data = await apiCall(`/sessions/${sessionId}`);
      return data;
    } catch {
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
  const [micPermissionGranted, setMicPermissionGranted] =
    useState<boolean>(false);
  const speakingRef = useRef<boolean>(false);
  const autoSubmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const finalAnswerRef = useRef<string>("");
  const joinedRef = useRef<boolean>(false);

  // STT
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
      if (finalText && !isProcessingRef.current) {
        autoSubmitTimerRef.current = setTimeout(() => {
          if (
            !speakingRef.current &&
            joinedRef.current &&
            !isProcessingRef.current
          ) {
            submitAnswer();
          }
        }, 1500);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recog.onerror = (event: any) => {
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setError(
          "Microphone access denied. Please allow microphone permissions and refresh the page."
        );
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
      setError(
        "Speech Recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }
    listeningRef.current = true;
    setInterim("");
    try {
      recog.start();
    } catch (err) {
      if (err instanceof Error && err.name !== "InvalidStateError") {
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
      const result = await apiCall(`/sessions/${sessionId}/start`, {
        method: "POST",
      });
      if (result && result.question) {
        const q = String(result.question);
        setConversation((c) => [...c, { role: "assistant", content: q }]);
        speak(q);
      }
    } catch (e) {
      const session = await getSession();
      if (session && session.status === "in-progress") {
        await loadConversation();
        const msgs: Message[] = (session.conversation || []) as Message[];
        const lastAssistant = [...msgs]
          .reverse()
          .find((m) => m.role === "assistant");
        if (lastAssistant?.content) {
          speak(String(lastAssistant.content));
        }
      } else if (session && session.status === "completed") {
        await loadConversation();
        setError("Interview already completed.");
      } else {
        setError(e instanceof Error ? e.message : "Failed to start interview");
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
          {
            role: "assistant",
            content: "Interview completed. Thank you for your time!",
          },
          {
            role: "system",
            content: `Overall Feedback: ${result.feedback.overall || ""}`,
          },
        ]);
        speak(
          "The interview is completed. Thank you for your time. Redirecting to feedback page...",
          () => {
            setTimeout(() => {
              router.push(`/feedback/${sessionId}`);
            }, 1000);
          }
        );
        setJoined(false);
        return;
      }

      if (result.question) {
        const nextQ = String(result.question);
        setConversation((c) => [...c, { role: "assistant", content: nextQ }]);
        speak(nextQ);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit answer");
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

    if (!recognitionRef.current) {
      const recog = initRecognition();
      if (!recog) {
        setError(
          "Speech Recognition is not supported in this browser. Please use Chrome or Edge."
        );
        return;
      }
    }

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
      const msgs: Message[] = (session.conversation || []) as Message[];
      const lastAssistant = [...msgs]
        .reverse()
        .find((m) => m.role === "assistant");
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
    (async () => {
      await loadConversation();
    })();

    return () => {
      stopListening();
      if (synth) synth.cancel();
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    finalAnswerRef.current = finalAnswer;
  }, [finalAnswer]);

  const processing = loading;
  const botSpeaking = speakingRef.current || processing;
  const userSpeaking =
    listeningRef.current && (interim.length > 0 || finalAnswer.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-white">
      <nav className="border-b border-[#e9ecef] sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#2d3250] rounded-xl flex items-center justify-center shadow-md">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[#2d3250]">
                AI Mock Interview
              </h1>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2 border-2 border-[#676f9d] hover:bg-[#676f9d] text-[#676f9d] hover:text-white transition-all font-medium rounded-lg text-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Main Stage */}
          <div className="space-y-6">
            <div className="relative bg-white border-2 border-[#e9ecef] rounded-3xl aspect-video shadow-lg overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fa] via-white to-[#f8f9fa]"></div>

              {/* Center Icon with Ripples */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Main Icon */}
                  <div
                    className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
                      botSpeaking
                        ? "bg-gradient-to-br from-[#f9b17a] to-[#e89b5f] shadow-2xl shadow-[#f9b17a]/50"
                        : userSpeaking
                        ? "bg-gradient-to-br from-[#10b981] to-[#059669] shadow-2xl shadow-[#10b981]/50"
                        : "bg-gradient-to-br from-[#424769] to-[#676f9d] shadow-xl"
                    }`}
                  >
                    {botSpeaking ? (
                      <Mic className="w-16 h-16 md:w-20 md:h-20 text-white" />
                    ) : userSpeaking ? (
                      <Mic className="w-16 h-16 md:w-20 md:h-20 text-white animate-pulse" />
                    ) : (
                      <MicOff className="w-16 h-16 md:w-20 md:h-20 text-white opacity-60" />
                    )}
                  </div>

                  {/* Ripple Effects when AI is speaking */}
                  {botSpeaking && (
                    <>
                      <span className="absolute inset-0 rounded-full border-4 border-[#f9b17a] animate-ping opacity-75" />
                      <span className="absolute inset-0 rounded-full border-4 border-[#f9b17a]/60 animate-ping opacity-50" style={{ animationDelay: "300ms" }} />
                      <span className="absolute inset-0 rounded-full border-4 border-[#f9b17a]/40 animate-ping opacity-25" style={{ animationDelay: "600ms" }} />
                      <span className="absolute inset-[-20px] rounded-full bg-[#f9b17a]/10 animate-pulse" />
                      <span className="absolute inset-[-40px] rounded-full bg-[#f9b17a]/5 animate-pulse" style={{ animationDelay: "500ms" }} />
                    </>
                  )}

                  {/* Ripple Effects when User is speaking */}
                  {userSpeaking && !botSpeaking && (
                    <>
                      <span className="absolute inset-0 rounded-full border-4 border-[#10b981] animate-ping opacity-75" />
                      <span className="absolute inset-0 rounded-full border-4 border-[#10b981]/60 animate-ping opacity-50" style={{ animationDelay: "300ms" }} />
                      <span className="absolute inset-[-20px] rounded-full bg-[#10b981]/10 animate-pulse" />
                    </>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className="absolute top-6 left-6 px-4 py-2.5 bg-white/95 backdrop-blur-sm border-2 border-[#e9ecef] rounded-full flex items-center gap-3 shadow-md z-10">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    joined ? "bg-[#10b981] animate-pulse shadow-lg shadow-[#10b981]/50" : "bg-[#adb5bd]"
                  }`}
                />
                <span className="text-xs font-semibold text-[#2d3250]">
                  {joined
                    ? botSpeaking
                      ? "AI Speaking"
                      : userSpeaking
                      ? "Listening"
                      : "Ready"
                    : "Not Connected"}
                </span>
              </div>

              {/* Controls - Repositioned to bottom right, no blur */}
              <div className="absolute bottom-6 right-6 z-10">
                {!joined ? (
                  <button
                    onClick={handleJoin}
                    className="px-8 py-4 bg-[#10b981] text-white hover:bg-[#059669] transition-all font-semibold rounded-xl text-sm shadow-xl hover:shadow-2xl transform hover:scale-105 duration-200 flex items-center gap-3"
                  >
                    <Video className="w-5 h-5" />
                    <span>Join Interview</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLeave}
                    className="px-8 py-4 bg-[#ef4444] text-white hover:bg-[#dc2626] transition-all font-semibold rounded-xl text-sm shadow-xl hover:shadow-2xl transform hover:scale-105 duration-200 flex items-center gap-3"
                  >
                    <Phone className="w-5 h-5" />
                    <span>End Interview</span>
                  </button>
                )}
              </div>

              {/* Processing overlay */}
              {processing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center pointer-events-none z-20">
                  <div className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-[#f9b17a] rounded-xl shadow-lg">
                    <div className="w-4 h-4 bg-[#f9b17a] rounded-full animate-pulse" />
                    <div className="text-sm font-semibold text-[#f9b17a]">
                      Processing...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pre-join instructions */}
            {!joined && (
              <div className="bg-white border-2 border-[#e9ecef] rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#3b82f6] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-[#2d3250] block mb-1">
                      Before you join:
                    </span>
                    <span className="text-[#676f9d]">
                      You&apos;ll need to allow microphone access. Use Chrome or Edge
                      browser for best experience.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Microphone permission prompt */}
            {joined && !micPermissionGranted && !error && (
              <div className="bg-[#f59e0b]/5 border-2 border-[#f59e0b] rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#f59e0b] rounded-full flex items-center justify-center flex-shrink-0 shadow-md animate-pulse">
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <span className="text-[#f59e0b] font-bold block mb-1">
                      Waiting for microphone access
                    </span>
                    <span className="text-[#f59e0b]">
                      Please click &quot;Allow&quot; when your browser asks for permission
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Live status message */}
            {joined && micPermissionGranted && !error && (
              <div className="bg-[#10b981]/5 border-2 border-[#10b981] rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#10b981]/50 animate-pulse">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <div className="text-sm">
                    <span className="text-[#10b981] font-bold block mb-1">
                      Live conversation active
                    </span>
                    <span className="text-[#10b981]">
                      Speak naturally, AI will respond when you finish
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-[#ef4444]/5 border-2 border-[#ef4444] rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#ef4444] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <span className="text-[#ef4444] text-sm font-medium">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Transcript Sidebar */}
          <div className="h-[600px] lg:h-[calc(100vh-8rem)]">
            <TranscriptPanel
              conversation={conversation}
              interim={interim}
              processing={processing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
