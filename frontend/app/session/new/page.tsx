"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Types
interface JobDetails {
  title: string;
  description: string;
  yoeRequired: string;
}

interface CreateSessionData {
  resume: string;
  jobDetails: JobDetails;
}

export default function NewSession() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [sessionData, setSessionData] = useState<CreateSessionData>({
    resume: "",
    jobDetails: {
      title: "",
      description: "",
      yoeRequired: "",
    },
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);

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
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
        return null;
      }
      throw new Error(`API call failed: ${response.statusText}`);
    }

    // Handle empty response body
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return null;
    }

    try {
      return await response.json();
    } catch (err) {
      // If JSON parsing fails, return null instead of crashing
      return null;
    }
  };

  // Parse PDF to text using pdfjs-dist
  // Parse PDF to text using pdf.js from a CDN (no local worker file required)
  const parsePdfToText = async (file: File): Promise<string> => {
    // Load pdf.js from CDN once
    const loadPdfJs = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const w = window as any;
        if (w.pdfjsLib) {
          return resolve(w.pdfjsLib);
        }
        const script = document.createElement("script");
        // Keep versions in sync for core and worker
        const version = "3.11.174";
        script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.min.js`;
        script.async = true;
        script.onload = () => {
          try {
            const lib = (window as any).pdfjsLib;
            if (!lib || !lib.GlobalWorkerOptions) {
              reject(new Error("PDF.js failed to load"));
              return;
            }
            lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
            resolve(lib);
          } catch (e) {
            reject(new Error("PDF.js initialization error"));
          }
        };
        script.onerror = () => reject(new Error("Failed to load PDF.js library"));
        document.head.appendChild(script);
      });
    };

    const pdfjsLib = await loadPdfJs();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

          let fullText = "";
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n";
          }

          resolve(fullText.trim());
        } catch (err) {
          reject(new Error("Failed to parse PDF. Please ensure the file is a valid PDF."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate and branch by file type
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isTxt = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
    if (!isPdf && !isTxt) {
      setError("Please upload a PDF or TXT file only.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return;
    }

    setUploadedFile(file);
    setError(null);
    setIsParsingPdf(true);

    try {
      const extractedText = isPdf
        ? await parsePdfToText(file)
        : await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Failed to read text file."));
            reader.readAsText(file);
          });
      setSessionData((prev) => ({
        ...prev,
        resume: extractedText,
      }));
      setSuccess("PDF parsed successfully! Resume text extracted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse PDF");
      setUploadedFile(null);
    } finally {
      setIsParsingPdf(false);
    }
  };

  // Handle manual text input
  const handleResumeTextChange = (text: string) => {
    setSessionData((prev) => ({
      ...prev,
      resume: text,
    }));
    setUploadedFile(null);
  };

  // Handle job details change
  const handleJobDetailsChange = (field: keyof JobDetails, value: string) => {
    setSessionData((prev) => ({
      ...prev,
      jobDetails: {
        ...prev.jobDetails,
        [field]: value,
      },
    }));
  };

  // Create session
  const createSession = async () => {
    if (!sessionData.resume.trim()) {
      setError("Please provide resume text or upload a PDF file.");
      return;
    }

    if (!sessionData.jobDetails.title.trim()) {
      setError("Please provide a job title.");
      return;
    }

    if (!sessionData.jobDetails.description.trim()) {
      setError("Please provide a job description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall("/sessions", {
        method: "POST",
        body: JSON.stringify(sessionData),
      });

      if (result) {
        setSuccess("Session created successfully!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  // Clear form
  const clearForm = () => {
    setSessionData({
      resume: "",
      jobDetails: {
        title: "",
        description: "",
        yoeRequired: "",
      },
    });
    setUploadedFile(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 border border-transparent hover:border-gray-600 rounded-lg"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Create New Interview Session
          </h2>
          <p className="text-gray-400">
            Upload your resume and provide job details to start an AI-powered
            interview.
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-400 mr-3"
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
              <span className="text-green-400">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-3"
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
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          {/* Resume Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Resume</h3>

            {/* PDF Upload Option */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Upload PDF Resume
              </label>
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsingPdf}
                  className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isParsingPdf ? "Parsing PDF..." : "Choose PDF File"}
                </button>
                {uploadedFile && (
                  <div className="flex items-center space-x-2">
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
                    <span className="text-green-400 text-sm">
                      {uploadedFile.name}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Upload a PDF file (max 10MB) or paste your resume text below.
              </p>
            </div>

            {/* Manual Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Or Paste Resume Text
              </label>
              <textarea
                value={sessionData.resume}
                onChange={(e) => handleResumeTextChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white min-h-[200px]"
                placeholder="Paste your resume content here or upload a PDF above..."
                rows={8}
              />
              <p className="text-gray-500 text-sm mt-2">
                Character count: {sessionData.resume.length}
              </p>
            </div>
          </div>

          {/* Job Details Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Job Details
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={sessionData.jobDetails.title}
                  onChange={(e) =>
                    handleJobDetailsChange("title", e.target.value)
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="e.g., Frontend Developer, Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={sessionData.jobDetails.description}
                  onChange={(e) =>
                    handleJobDetailsChange("description", e.target.value)
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  rows={4}
                  placeholder="Paste the job description here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Years of Experience Required
                </label>
                <input
                  type="text"
                  value={sessionData.jobDetails.yoeRequired}
                  onChange={(e) =>
                    handleJobDetailsChange("yoeRequired", e.target.value)
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="e.g., 2+ years, 3-5 years, Senior level"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-800">
            <button
              onClick={clearForm}
              className="px-6 py-3 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg transition-all duration-300"
            >
              Clear Form
            </button>

            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg transition-all duration-300"
              >
                Cancel
              </Link>
              <button
                onClick={createSession}
                disabled={loading || isParsingPdf}
                className="px-8 py-3 bg-white text-black hover:bg-gray-100 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Session..." : "Create Session"}
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            How it works
          </h4>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-bold text-sm">1</span>
              </div>
              <div>
                <h5 className="text-white font-medium mb-1">Upload Resume</h5>
                <p className="text-gray-400 text-sm">
                  Upload your PDF resume or paste the text directly.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-bold text-sm">2</span>
              </div>
              <div>
                <h5 className="text-white font-medium mb-1">
                  Provide Job Details
                </h5>
                <p className="text-gray-400 text-sm">
                  Enter the job title, description, and experience requirements.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-bold text-sm">3</span>
              </div>
              <div>
                <h5 className="text-white font-medium mb-1">Start Interview</h5>
                <p className="text-gray-400 text-sm">
                  AI will conduct a personalized interview based on your resume
                  and job requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
