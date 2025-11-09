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
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-white flex items-center justify-center">
        <div className="bg-white border-2 border-[#e9ecef] rounded-2xl p-12 shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#e9ecef] border-t-[#f9b17a] mx-auto mb-6 rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-[#676f9d]">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-white flex items-center justify-center p-6">
        <div className="bg-white border-2 border-[#ef4444] max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b-2 border-[#ef4444] p-6 flex items-center gap-4 bg-[#ef4444]/5">
            <div className="w-12 h-12 bg-[#ef4444] rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
            <h2 className="text-2xl font-bold text-[#2d3250]">Error</h2>
          </div>
          <div className="p-8">
            <p className="text-[#676f9d] mb-8 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-[#f9b17a] hover:bg-[#e89b5f] text-white transition-all font-semibold rounded-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-white">
      {/* Navigation */}
      <nav className="border-b border-[#e9ecef] sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
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
                InterviewAI
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 border-2 border-[#e9ecef] hover:border-[#f9b17a] hover:bg-[#f9b17a]/5 transition-all rounded-lg"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-[#f9b17a]"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[#f9b17a] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-[#676f9d] font-medium text-sm">
                    {user.name}
                  </span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-5 py-2 border-2 border-[#676f9d] hover:bg-[#676f9d] text-[#676f9d] hover:text-white transition-all font-medium rounded-lg text-sm"
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
        <div className="mb-12 bg-white border-2 border-[#e9ecef] rounded-3xl p-12 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 border-l-4 border-b-4 border-[#f9b17a]/20 rounded-bl-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-r-4 border-t-4 border-[#676f9d]/10 rounded-tr-3xl"></div>
          <div className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#2d3250]">
              Welcome back, {user?.name || "User"}
            </h2>
            <p className="text-[#676f9d] text-lg leading-relaxed max-w-2xl mx-auto">
              Ready to continue your journey toward better hiring decisions?
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              label: "Total Sessions",
              value: sessions.length,
              color: "from-[#424769] to-[#676f9d]",
              borderColor: "border-[#676f9d]/30",
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
              color: "from-[#10b981] to-[#059669]",
              borderColor: "border-[#10b981]/30",
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
              color: "from-[#f59e0b] to-[#d97706]",
              borderColor: "border-[#f59e0b]/30",
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
            <div key={index} className={`bg-white border-2 ${stat.borderColor} rounded-2xl p-6 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-[#676f9d]">
                  {stat.label}
                </p>
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-4xl font-bold text-[#2d3250]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Create Session Button */}
        <div className="mb-12">
          <button
            onClick={navigateToCreateSession}
            className="w-full py-5 bg-[#f9b17a] border-2 border-[#f9b17a] text-white hover:bg-[#e89b5f] hover:border-[#e89b5f] transition-all font-semibold rounded-xl text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.01] duration-200"
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
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-[#2d3250] mb-2">
              Your Interview Sessions
            </h3>
            <p className="text-[#676f9d]">
              Manage and track all your interview sessions
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white border-2 border-[#e9ecef] rounded-3xl p-16 text-center shadow-md">
              <div className="w-24 h-24 bg-[#f8f9fa] rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-12 h-12 text-[#adb5bd]"
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
              <h4 className="text-2xl font-bold text-[#2d3250] mb-3">
                No sessions yet
              </h4>
              <p className="text-[#676f9d] mb-8 max-w-sm mx-auto leading-relaxed">
                Create your first interview session to get started with
                AI-powered interviews.
              </p>
              <button
                onClick={navigateToCreateSession}
                className="px-8 py-4 bg-[#f9b17a] text-white hover:bg-[#e89b5f] transition-all font-semibold rounded-xl shadow-md hover:shadow-lg"
              >
                Create First Session
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-white border-2 border-[#e9ecef] rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-[#2d3250] mb-3">
                        {session.jobDetails.title || "Interview Session"}
                      </h4>
                      <div className="flex items-center gap-6 text-sm text-[#676f9d]">
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
                          <span>
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
                          <span>
                            {session.currentQuestionCount || 0} Questions
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1.5 border-2 text-xs font-medium rounded-lg ${
                          session.status === "completed"
                            ? "border-[#10b981] text-[#10b981] bg-[#10b981]/5"
                            : session.status === "in-progress"
                            ? "border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/5"
                            : "border-[#676f9d] text-[#676f9d] bg-[#676f9d]/5"
                        }`}
                      >
                        {session.status === "in-progress"
                          ? "In Progress"
                          : session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6 space-y-3">
                    {session.jobDetails.description && (
                      <p className="text-[#676f9d] text-sm leading-relaxed">
                        <span className="text-[#424769] font-medium">
                          Description:
                        </span>{" "}
                        {session.jobDetails.description}
                      </p>
                    )}
                    {session.jobDetails.yoeRequired && (
                      <p className="text-[#676f9d] text-sm">
                        <span className="text-[#424769] font-medium">
                          Experience:
                        </span>{" "}
                        {session.jobDetails.yoeRequired}
                      </p>
                    )}
                  </div>

                  {session.status === "completed" && session.feedback && (
                    <div className="mb-6 border-2 border-[#10b981] bg-[#10b981]/5 rounded-xl p-6">
                      <h5 className="text-sm font-medium text-[#10b981] mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
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
                          <p className="text-[#676f9d]">
                            <span className="text-[#424769] font-medium">
                              Overall:
                            </span>{" "}
                            {session.feedback.overall}
                          </p>
                          <p className="text-[#676f9d]">
                            <span className="text-[#424769] font-medium">
                              Rating:
                            </span>{" "}
                            {session.feedback.rating}/10
                          </p>
                        </div>
                        {session.feedback.strengths.length > 0 && (
                          <div>
                            <p className="text-[#676f9d]">
                              <span className="text-[#424769] font-medium">
                                Strengths:
                              </span>{" "}
                              {session.feedback.strengths.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t-2 border-[#e9ecef] pt-6">
                    <div className="text-sm text-[#adb5bd]">
                      Updated: {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-3">
                      {session.status === "pending" && (
                        <button
                          onClick={() => startInterview(session._id)}
                          className="px-6 py-2.5 bg-[#f9b17a] text-white hover:bg-[#e89b5f] transition-all font-semibold rounded-lg text-sm shadow-md hover:shadow-lg"
                        >
                          Start Interview
                        </button>
                      )}
                      {session.status === "in-progress" && (
                        <Link
                          href={`/interview/${session._id}`}
                          className="px-6 py-2.5 bg-[#f9b17a] text-white hover:bg-[#e89b5f] transition-all font-semibold rounded-lg text-sm shadow-md hover:shadow-lg"
                        >
                          Continue
                        </Link>
                      )}
                      {session.status === "completed" && (
                        <Link
                          href={`/feedback/${session._id}`}
                          className="px-6 py-2.5 bg-[#f9b17a] text-white hover:bg-[#e89b5f] transition-all font-semibold rounded-lg text-sm shadow-md hover:shadow-lg"
                        >
                          View Feedback
                        </Link>
                      )}
                      <button
                        onClick={() => deleteSession(session._id)}
                        className="px-6 py-2.5 border-2 border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-all font-semibold rounded-lg text-sm"
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
