"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect to dashboard or home
        router.push("/dashboard");
      } else {
        setErrors({ general: data.message || "Login failed" });
      }
    } catch (error) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-white flex items-center justify-center py-12 px-6 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #2d3250 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 p-3 border-2 border-[#676f9d] bg-white hover:bg-[#f8f9fa] text-[#424769] rounded-lg transition-all group z-10 shadow-sm hover:shadow-md"
      >
        <svg
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
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
      </Link>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white border-2 border-[#e9ecef] rounded-3xl p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-24 h-24 border-l-4 border-t-4 border-[#676f9d]/20 rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 border-r-4 border-b-4 border-[#f9b17a]/30 rounded-br-3xl"></div>

          {/* Header */}
          <div className="mb-8 relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#2d3250] flex items-center justify-center rounded-xl shadow-md">
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
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#2d3250]">
                InterviewAI
              </h1>
            </div>

            <h2 className="text-3xl font-bold text-[#2d3250] mb-2">
              Welcome Back
            </h2>
            <p className="text-[#676f9d]">
              Continue your hiring journey
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Success Message */}
            {successMessage && (
              <div className="border-2 border-[#10b981] bg-[#10b981]/5 p-4 rounded-xl">
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
                  <p className="text-[#10b981] text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#424769] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white border-2 ${
                  errors.email ? "border-[#ef4444] focus:border-[#ef4444]" : "border-[#e9ecef] focus:border-[#f9b17a]"
                } text-[#2d3250] placeholder-[#adb5bd] rounded-xl focus:outline-none transition-all focus:ring-4 focus:ring-[#f9b17a]/10`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-[#ef4444] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#ef4444] rounded-full"></span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#424769] mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white border-2 ${
                  errors.password ? "border-[#ef4444] focus:border-[#ef4444]" : "border-[#e9ecef] focus:border-[#f9b17a]"
                } text-[#2d3250] placeholder-[#adb5bd] rounded-xl focus:outline-none transition-all focus:ring-4 focus:ring-[#f9b17a]/10`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-[#ef4444] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#ef4444] rounded-full"></span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-[#676f9d] hover:text-[#424769] text-sm transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="border-2 border-[#ef4444] bg-[#ef4444]/5 p-4 rounded-xl">
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
                  <p className="text-[#ef4444] text-sm font-medium">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#f9b17a] text-white hover:bg-[#e89b5f] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] duration-200"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[#e9ecef]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#676f9d] font-medium">
                  New to InterviewAI?
                </span>
              </div>
            </div>

            {/* Create Account Link */}
            <Link
              href="/register"
              className="block w-full py-4 border-2 border-[#424769] hover:bg-[#424769] text-[#424769] hover:text-white text-center transition-all font-semibold rounded-xl"
            >
              Create Account
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
