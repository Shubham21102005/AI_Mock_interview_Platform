"use client";

import { useEffect, useMemo, useRef, useState, use as useUnwrap } from "react";
import { useRouter } from "next/navigation";

type Message = { role: "user" | "assistant" | "system"; content: string; timestamp?: string };

export default function InterviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  const { sessionId } = useUnwrap(params);

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
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [interim, setInterim] = useState<string>("");
  const [finalAnswer, setFinalAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState<boolean>(false);

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

  const speak = (text: string) => {
    if (!synth || !text) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const enVoice = voices.find((v) => /en/i.test(v.lang)) || voices[0];
    if (enVoice) utter.voice = enVoice;
    utter.rate = 1.0;
    utter.pitch = 1.0;
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
      let finalText = finalAnswer;
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
    };

    recog.onend = () => {
      if (listeningRef.current) {
        try {
          recog.start();
        } catch {}
      }
    };

    recog.onerror = () => {};

    recognitionRef.current = recog;
    return recog;
  };

  const startListening = () => {
    setError(null);
    let recog = recognitionRef.current;
    if (!recog) recog = initRecognition();
    if (!recog) {
      setError("Speech Recognition is not supported in this browser.");
      return;
    }
    listeningRef.current = true;
    setInterim("");
    try {
      recog.start();
    } catch {}
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
        setInProgress(true);
        setCurrentQuestion(q);
        setConversation((c) => [...c, { role: "assistant", content: q }]);
        speak(q);
      }
    } catch (e: any) {
      // If already started, gracefully recover by loading current conversation
      const session = await getSession();
      if (session && session.status === "in-progress") {
        setInProgress(true);
        await loadConversation();
        // derive last assistant message as current question
        const msgs: any[] = (session.conversation || []) as any[];
        const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");
        if (lastAssistant?.content) {
          setCurrentQuestion(String(lastAssistant.content));
          speak(String(lastAssistant.content));
        }
      } else if (session && session.status === "completed") {
        setInProgress(false);
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
    stopListening();
    const answer = finalAnswer.trim();
    if (!answer) return;
    setFinalAnswer("");
    setInterim("");
    setConversation((c) => [...c, { role: "user", content: answer }]);
    try {
      setLoading(true);
      const result = await apiCall(`/sessions/${sessionId}/respond`, {
        method: "POST",
        body: JSON.stringify({ answer }),
      });
      if (!result) return;

      if (result.feedback) {
        setInProgress(false);
        setConversation((c) => [
          ...c,
          { role: "assistant", content: "Interview completed." },
          { role: "assistant", content: `Overall: ${result.feedback.overall || ""}` },
        ]);
        speak("The interview is completed. Thank you.");
        return;
      }

      if (result.question) {
        const nextQ = String(result.question);
        setCurrentQuestion(nextQ);
        setConversation((c) => [...c, { role: "assistant", content: nextQ }]);
        speak(nextQ);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const replayQuestion = () => {
    if (currentQuestion) speak(currentQuestion);
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
    // Attempt to hydrate state depending on session status
    (async () => {
      const session = await getSession();
      if (!session) return;
      await loadConversation();
      if (session.status === "in-progress") {
        setInProgress(true);
        const msgs: any[] = (session.conversation || []) as any[];
        const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");
        if (lastAssistant?.content) {
          setCurrentQuestion(String(lastAssistant.content));
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-black/90 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-white tracking-tight">Interview</h1>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 border border-transparent hover:border-gray-600 rounded-lg"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={startInterview}
              disabled={loading || inProgress}
              className="px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Starting..." : "Start Interview"}
            </button>
            <button
              onClick={startListening}
              className="px-6 py-3 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 rounded-xl transition-all duration-300"
            >
              Start Listening
            </button>
            <button
              onClick={stopListening}
              className="px-6 py-3 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 rounded-xl transition-all duration-300"
            >
              Stop Listening
            </button>
            <button
              onClick={submitAnswer}
              className="px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-xl font-medium transition-all duration-300"
            >
              Submit Answer
            </button>
            <button
              onClick={replayQuestion}
              className="px-6 py-3 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 rounded-xl transition-all duration-300"
            >
              Replay Question
            </button>
          </div>

          <div className="mt-6">
            <div className="text-gray-400 text-sm mb-1">Current Question</div>
            <div className="text-white bg-black/40 border border-gray-800 rounded-xl p-4 min-h-[64px]">
              {currentQuestion || "—"}
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-gray-400 text-sm mb-1">Interim Transcript</div>
              <div className="text-gray-300 bg-black/40 border border-gray-800 rounded-xl p-4 min-h-[100px]">
                {interim || "—"}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Your Answer</div>
              <textarea
                className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white min-h-[100px]"
                value={finalAnswer}
                onChange={(e) => setFinalAnswer(e.target.value)}
                placeholder="Speak or type your answer..."
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="text-white font-semibold mb-4">Conversation</div>
          <div className="space-y-3">
            {conversation.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-800 bg-black/40">
                <div className="text-xs mb-1 text-gray-400">{m.role}</div>
                <div className="text-gray-200 whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            {conversation.length === 0 && (
              <div className="text-gray-500">No messages yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
