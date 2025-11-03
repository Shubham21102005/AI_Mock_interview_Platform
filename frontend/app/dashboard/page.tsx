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
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-lg font-light">
            Loading your dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black/90 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  InterviewAI
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <Link href="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-gray-700"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-300 font-light">{user.name}</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 border border-transparent hover:border-gray-600 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Welcome back, {user?.name || "User"}
          </h2>
          <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Ready to continue your journey toward better hiring decisions?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              label: "Total Sessions",
              value: sessions.length,
              icon: (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              ),
              bg: "bg-gray-900/50",
            },
            {
              label: "Completed",
              value: sessions.filter((s) => s.status === "completed").length,
              icon: (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              bg: "bg-gray-900/50",
            },
            {
              label: "In Progress",
              value: sessions.filter((s) => s.status === "in-progress").length,
              icon: (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              bg: "bg-gray-900/50",
            },
          ].map((stat, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl transform group-hover:scale-105 transition-all duration-500"></div>
              <div className="relative bg-black border border-gray-800 p-8 rounded-2xl backdrop-blur-sm h-full transform group-hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-light mb-2">
                      {stat.label}
                    </p>
                    <p className="text-4xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Session Button */}
        <div className="mb-12 text-center">
          <button
            onClick={navigateToCreateSession}
            className="group relative bg-white text-black hover:bg-gray-100 px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-2 border-white"
          >
            <div className="flex items-center space-x-3">
              <span>Create New Session</span>
              <svg
                className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
        </div>


        {/* Sessions List */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Your Interview Sessions
            </h3>
            <p className="text-gray-400 font-light">
              Manage and track all your interview sessions
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-800">
                <svg
                  className="w-10 h-10 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                No sessions yet
              </h4>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto font-light">
                Create your first interview session to get started with
                AI-powered interviews.
              </p>
              <button
                onClick={navigateToCreateSession}
                className="px-8 py-4 bg-white text-black rounded-2xl font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 border-2 border-white"
              >
                Create First Session
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {sessions.map((session) => (
                <div key={session._id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl transform group-hover:scale-105 transition-all duration-500"></div>
                  <div className="relative bg-black border border-gray-800 p-8 rounded-2xl backdrop-blur-sm transform group-hover:-translate-y-1 transition-all duration-500">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">
                          {session.jobDetails.title || "Interview Session"}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              Created{" "}
                              {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                          </span>
                          <span className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            <span>
                              {session.currentQuestionCount || 0} questions
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
                            session.status === "completed"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : session.status === "in-progress"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                          }`}
                        >
                          {session.status.charAt(0).toUpperCase() +
                            session.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6 space-y-3">
                      {session.jobDetails.description && (
                        <p className="text-gray-300 text-sm line-clamp-2 font-light">
                          <span className="text-gray-400 font-medium">
                            Description:
                          </span>{" "}
                          {session.jobDetails.description}
                        </p>
                      )}
                      {session.jobDetails.yoeRequired && (
                        <p className="text-gray-300 text-sm font-light">
                          <span className="text-gray-400 font-medium">
                            Experience:
                          </span>{" "}
                          {session.jobDetails.yoeRequired}
                        </p>
                      )}
                    </div>

                    {session.status === "completed" && session.feedback && (
                      <div className="mb-6 p-6 bg-gray-900/50 rounded-2xl border border-gray-700 backdrop-blur-sm">
                        <h5 className="text-white font-semibold mb-3 flex items-center space-x-2">
                          <svg
                            className="w-5 h-5 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Interview Feedback</span>
                        </h5>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-300 mb-2 font-light">
                              <span className="text-gray-400 font-medium">
                                Overall:
                              </span>{" "}
                              {session.feedback.overall}
                            </p>
                            <p className="text-gray-300 font-light">
                              <span className="text-gray-400 font-medium">
                                Rating:
                              </span>{" "}
                              {session.feedback.rating}/10
                            </p>
                          </div>
                          {session.feedback.strengths.length > 0 && (
                            <div>
                              <p className="text-gray-300 font-light">
                                <span className="text-gray-400 font-medium">
                                  Strengths:
                                </span>{" "}
                                {session.feedback.strengths.join(", ")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400 font-light">
                        Last updated:{" "}
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-3">
                        {session.status === "pending" && (
                          <button
                            onClick={() => startInterview(session._id)}
                            className="px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 border-2 border-white"
                          >
                            Start Interview
                          </button>
                        )}
                        {session.status === "in-progress" && (
                          <Link
                            href={`/interview/${session._id}`}
                            className="px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 border-2 border-white"
                          >
                            Continue
                          </Link>
                        )}
                        {session.status === "completed" && (
                          <Link
                            href={`/feedback/${session._id}`}
                            className="px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 border-2 border-white"
                          >
                            View Feedback
                          </Link>
                        )}
                        <button
                          onClick={() => deleteSession(session._id)}
                          className="px-6 py-3 border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400 hover:text-red-300 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                        >
                          Delete
                        </button>
                      </div>
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

