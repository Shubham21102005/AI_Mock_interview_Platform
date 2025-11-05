"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types
interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePicture: string;
  sessions: string[];
}

interface Session {
  _id: string;
  resume: string;
  jobDetails: {
    title: string;
    description: string;
    yoeRequired: string;
  };
  status: "pending" | "in-progress" | "completed";
  conversation: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
  }>;
  feedback?: {
    overall: string;
    strengths: string[];
    weaknesses: string[];
    rating: number;
    suggestions: string;
  };
  currentQuestionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateSessionData {
  resume: string;
  jobDetails: {
    title: string;
    description: string;
    yoeRequired: string;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API Base URL
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return null;
      }
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  };

  // Load user profile
  const loadUserProfile = async () => {
    try {
      const userData = await apiCall("/auth/me");
      if (userData) {
        setUser(userData);
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setError("Failed to load user profile");
    }
  };

  // Load user sessions
  const loadSessions = async () => {
    try {
      const sessionsData = await apiCall("/sessions");
      if (sessionsData) {
        setSessions(sessionsData);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError("Failed to load sessions");
    }
  };

  // Navigate to create session page
  const navigateToCreateSession = () => {
    router.push("/session/new");
  };

  // Start interview
  const startInterview = async (sessionId: string) => {
    try {
      const result = await apiCall(`/sessions/${sessionId}/start`, {
        method: "POST",
      });

      if (result) {
        // Reload sessions to get updated status
        loadSessions();
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
      setError("Failed to start interview");
    }
  };

  // Delete session
  const deleteSession = async (sessionId: string) => {
    try {
      const result = await apiCall(`/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (result) {
        setSessions(sessions.filter((s) => s._id !== sessionId));
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
      setError("Failed to delete session");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await apiCall("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadUserProfile(), loadSessions()]);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="border-2 border-white/10 p-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white mx-auto mb-6 animate-spin"></div>
            <p className="text-xl font-mono uppercase tracking-wider text-white/60">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="border-2 border-red-500/50 max-w-md w-full">
          <div className="border-b-2 border-red-500/50 p-6 flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-red-500/50 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Error</h2>
          </div>
          <div className="p-8">
            <p className="text-white/70 mb-8 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full p-4 border-2 border-white hover:bg-white hover:text-black transition-all font-bold uppercase tracking-wider"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="border-b-2 border-white/10 sticky top-0 z-50 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 bg-white flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-black"
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
              <h1 className="text-xl font-bold tracking-tight uppercase">
                InterviewAI
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-3 border-2 border-white/20 hover:border-white hover:bg-white/5 transition-all"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-8 h-8 border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-white flex items-center justify-center">
                      <span className="text-black text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-white/70 font-mono text-sm uppercase tracking-wider">
                    {user.name}
                  </span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-6 py-3 border-2 border-white/20 hover:border-white hover:bg-white hover:text-black transition-all font-bold uppercase tracking-wider text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 border-2 border-white/10 p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 border-l-2 border-b-2 border-white/5"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-r-2 border-t-2 border-white/5"></div>
          <div className="relative text-center">
            <h2 className="text-5xl font-bold mb-4 tracking-tighter uppercase">
              Welcome back, {user?.name || "User"}
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
              Ready to continue your journey toward better hiring decisions?
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              label: "Total Sessions",
              value: sessions.length,
              icon: (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              ),
            },
            {
              label: "Completed",
              value: sessions.filter((s) => s.status === "completed").length,
              icon: (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
            },
            {
              label: "In Progress",
              value: sessions.filter((s) => s.status === "in-progress").length,
              icon: (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
            },
          ].map((stat, index) => (
            <div key={index} className="border-2 border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                  {stat.label}
                </p>
                <div className="w-10 h-10 border-2 border-white/30 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <p className="text-5xl font-bold tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Create Session Button */}
        <div className="mb-12">
          <button
            onClick={navigateToCreateSession}
            className="w-full py-6 bg-white text-black hover:bg-white/90 transition-all font-bold uppercase tracking-wider text-lg flex items-center justify-center gap-4 group"
          >
            <span>Create New Session</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>

        {/* Sessions List */}
        <div>
          <div className="border-b-2 border-white/10 pb-6 mb-8">
            <h3 className="text-3xl font-bold tracking-tight uppercase mb-2">
              Your Interview Sessions
            </h3>
            <p className="text-white/60">
              Manage and track all your interview sessions
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="border-2 border-white/10 p-16 text-center">
              <div className="w-24 h-24 border-2 border-white/20 flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-12 h-12 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-bold uppercase tracking-tight mb-3">
                No sessions yet
              </h4>
              <p className="text-white/60 mb-8 max-w-sm mx-auto leading-relaxed">
                Create your first interview session to get started with
                AI-powered interviews.
              </p>
              <button
                onClick={navigateToCreateSession}
                className="px-8 py-4 bg-white text-black hover:bg-white/90 transition-all font-bold uppercase tracking-wider"
              >
                Create First Session
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="border-2 border-white/10 p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold tracking-tight uppercase mb-3">
                        {session.jobDetails.title || "Interview Session"}
                      </h4>
                      <div className="flex items-center gap-6 text-xs font-mono text-white/40">
                        <span className="flex items-center gap-2">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="uppercase tracking-wider">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
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
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span className="uppercase tracking-wider">
                            {session.currentQuestionCount || 0} Questions
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 border-2 text-xs font-mono uppercase ${
                          session.status === "completed"
                            ? "border-green-500/50 text-green-500"
                            : session.status === "in-progress"
                            ? "border-yellow-500/50 text-yellow-500"
                            : "border-white/30 text-white/60"
                        }`}
                      >
                        {session.status === "in-progress"
                          ? "In Progress"
                          : session.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6 space-y-3">
                    {session.jobDetails.description && (
                      <p className="text-white/70 text-sm leading-relaxed">
                        <span className="text-white/40 font-mono uppercase tracking-wider text-xs">
                          Description:
                        </span>{" "}
                        {session.jobDetails.description}
                      </p>
                    )}
                    {session.jobDetails.yoeRequired && (
                      <p className="text-white/70 text-sm">
                        <span className="text-white/40 font-mono uppercase tracking-wider text-xs">
                          Experience:
                        </span>{" "}
                        {session.jobDetails.yoeRequired}
                      </p>
                    )}
                  </div>

                  {session.status === "completed" && session.feedback && (
                    <div className="mb-6 border-2 border-green-500/30 p-6">
                      <h5 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-green-500 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span>Interview Feedback</span>
                      </h5>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p className="text-white/70">
                            <span className="text-white/40 font-mono">
                              Overall:
                            </span>{" "}
                            {session.feedback.overall}
                          </p>
                          <p className="text-white/70">
                            <span className="text-white/40 font-mono">
                              Rating:
                            </span>{" "}
                            {session.feedback.rating}/10
                          </p>
                        </div>
                        {session.feedback.strengths.length > 0 && (
                          <div>
                            <p className="text-white/70">
                              <span className="text-white/40 font-mono">
                                Strengths:
                              </span>{" "}
                              {session.feedback.strengths.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t-2 border-white/10 pt-6">
                    <div className="text-xs font-mono text-white/40 uppercase tracking-wider">
                      Updated: {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-3">
                      {session.status === "pending" && (
                        <button
                          onClick={() => startInterview(session._id)}
                          className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-all font-bold uppercase tracking-wider text-sm"
                        >
                          Start Interview
                        </button>
                      )}
                      {session.status === "in-progress" && (
                        <Link
                          href={`/interview/${session._id}`}
                          className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-all font-bold uppercase tracking-wider text-sm"
                        >
                          Continue
                        </Link>
                      )}
                      {session.status === "completed" && (
                        <Link
                          href={`/feedback/${session._id}`}
                          className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-all font-bold uppercase tracking-wider text-sm"
                        >
                          View Feedback
                        </Link>
                      )}
                      <button
                        onClick={() => deleteSession(session._id)}
                        className="px-6 py-3 border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-400 transition-all font-bold uppercase tracking-wider text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
