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
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
        script.onerror = () =>
          reject(new Error("Failed to load PDF.js library"));
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
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            fullText += pageText + "\n";
          }

          resolve(fullText.trim());
        } catch (err) {
          reject(
            new Error(
              "Failed to parse PDF. Please ensure the file is a valid PDF."
            )
          );
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
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    const isTxt =
      file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
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
            reader.onerror = () =>
              reject(new Error("Failed to read text file."));
            reader.readAsText(file);
          });
      setSessionData((prev) => ({
        ...prev,
        resume: extractedText,
      }));
      setSuccess("Resume parsed successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
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
            <div>
              <Link
                href="/dashboard"
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
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12 bg-white border-2 border-[#e9ecef] rounded-3xl p-8 shadow-lg">
          <h2 className="text-4xl font-bold text-[#2d3250] mb-3">
            Create New Interview Session
          </h2>
          <p className="text-[#676f9d] leading-relaxed">
            Upload your resume and provide job details to start an AI-powered
            interview.
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 border-2 border-[#10b981] bg-[#10b981]/5 p-4 rounded-xl">
            <div className="flex items-center gap-3">
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
              <span className="text-[#10b981] text-sm font-medium">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 border-2 border-[#ef4444] bg-[#ef4444]/5 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-[#ef4444] rounded-full flex items-center justify-center">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <span className="text-[#ef4444] text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-[#e9ecef] rounded-3xl overflow-hidden shadow-lg">
          {/* Resume Section */}
          <div className="border-b-2 border-[#e9ecef] p-8">
            <h3 className="text-2xl font-bold text-[#2d3250] mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#424769] rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
              <span>Resume</span>
            </h3>

            {/* PDF Upload Option */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-[#424769] mb-3">
                Upload Resume (PDF or TXT)
              </label>
              <div className="flex items-center gap-4">
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
                  className="px-6 py-3 border-2 border-[#f9b17a] hover:bg-[#f9b17a] text-[#f9b17a] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg text-sm"
                >
                  {isParsingPdf ? "Parsing..." : "Choose File"}
                </button>
                {uploadedFile && (
                  <div className="flex items-center gap-2">
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
                    <span className="text-[#10b981] text-sm font-medium">
                      {uploadedFile.name}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[#adb5bd] text-xs mt-3">
                Max 10MB • PDF or TXT format
              </p>
            </div>

            {/* Manual Text Input */}
            <div>
              <label className="block text-sm font-medium text-[#424769] mb-3">
                Or Paste Resume Text
              </label>
              <textarea
                value={sessionData.resume}
                onChange={(e) => handleResumeTextChange(e.target.value)}
                className="w-full bg-white border-2 border-[#e9ecef] focus:border-[#f9b17a] p-4 text-[#2d3250] placeholder-[#adb5bd] focus:outline-none transition-all focus:ring-4 focus:ring-[#f9b17a]/10 rounded-xl min-h-[200px]"
                placeholder="Paste your resume content here..."
                rows={8}
              />
              <p className="text-[#adb5bd] text-xs mt-2">
                Characters: {sessionData.resume.length}
              </p>
            </div>
          </div>

          {/* Job Details Section */}
          <div className="border-b-2 border-[#e9ecef] p-8 bg-[#f8f9fa]">
            <h3 className="text-2xl font-bold text-[#2d3250] mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#f9b17a] rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
              <span>Job Details</span>
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#424769] mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={sessionData.jobDetails.title}
                  onChange={(e) =>
                    handleJobDetailsChange("title", e.target.value)
                  }
                  className="w-full bg-white border-2 border-[#e9ecef] focus:border-[#f9b17a] p-4 text-[#2d3250] placeholder-[#adb5bd] focus:outline-none transition-all focus:ring-4 focus:ring-[#f9b17a]/10 rounded-xl"
                  placeholder="Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#424769] mb-2">
                  Job Description *
                </label>
                <textarea
                  value={sessionData.jobDetails.description}
                  onChange={(e) =>
                    handleJobDetailsChange("description", e.target.value)
                  }
                  className="w-full bg-white border-2 border-[#e9ecef] focus:border-[#f9b17a] p-4 text-[#2d3250] placeholder-[#adb5bd] focus:outline-none transition-all focus:ring-4 focus:ring-[#f9b17a]/10 rounded-xl"
                  rows={4}
                  placeholder="Paste the job description here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#424769] mb-2">
                  Years of Experience
                </label>
                <input
                  type="text"
                  value={sessionData.jobDetails.yoeRequired}
                  onChange={(e) =>
                    handleJobDetailsChange("yoeRequired", e.target.value)
                  }
                  className="w-full bg-white border-2 border-[#e9ecef] focus:border-[#f9b17a] p-4 text-[#2d3250] placeholder-[#adb5bd] focus:outline-none transition-all focus:ring-4 focus:ring-[#f9b17a]/10 rounded-xl"
                  placeholder="2+ years"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center p-8">
            <button
              onClick={clearForm}
              className="px-6 py-3 border-2 border-[#676f9d] hover:bg-[#676f9d] text-[#676f9d] hover:text-white transition-all font-semibold rounded-lg text-sm"
            >
              Clear Form
            </button>

            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 border-2 border-[#e9ecef] hover:border-[#676f9d] hover:bg-[#676f9d] text-[#676f9d] hover:text-white transition-all font-semibold rounded-lg text-sm"
              >
                Cancel
              </Link>
              <button
                onClick={createSession}
                disabled={loading || isParsingPdf}
                className="px-8 py-3 bg-[#f9b17a] text-white hover:bg-[#e89b5f] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg text-sm shadow-md hover:shadow-lg"
              >
                {loading ? "Creating..." : "Create Session"}
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white border-2 border-[#e9ecef] rounded-3xl overflow-hidden shadow-lg">
          <div className="border-b-2 border-[#e9ecef] p-6 bg-[#f8f9fa]">
            <h4 className="text-2xl font-bold text-[#2d3250]">
              How it works
            </h4>
          </div>
          <div className="grid md:grid-cols-3 divide-x-2 divide-[#e9ecef]">
            <div className="p-6 hover:bg-[#f8f9fa] transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-[#424769] to-[#676f9d] rounded-xl flex items-center justify-center mb-4 shadow-md">
                <span className="font-bold text-lg text-white">1</span>
              </div>
              <h5 className="text-lg font-bold text-[#2d3250] mb-2">
                Upload Resume
              </h5>
              <p className="text-[#676f9d] text-sm leading-relaxed">
                Upload your PDF resume or paste the text directly.
              </p>
            </div>

            <div className="p-6 hover:bg-[#f8f9fa] transition-colors">
              <div className="w-12 h-12 bg-[#f9b17a] rounded-xl flex items-center justify-center mb-4 shadow-md">
                <span className="font-bold text-lg text-white">2</span>
              </div>
              <h5 className="text-lg font-bold text-[#2d3250] mb-2">
                Provide Job Details
              </h5>
              <p className="text-[#676f9d] text-sm leading-relaxed">
                Enter the job title, description, and experience requirements.
              </p>
            </div>

            <div className="p-6 hover:bg-[#f8f9fa] transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center mb-4 shadow-md">
                <span className="font-bold text-lg text-white">3</span>
              </div>
              <h5 className="text-lg font-bold text-[#2d3250] mb-2">
                Start Interview
              </h5>
              <p className="text-[#676f9d] text-sm leading-relaxed">
                AI will conduct a personalized interview based on your resume
                and job requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
