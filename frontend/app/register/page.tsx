"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3)
      newErrors.username = "Username must be at least 3 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login?message=Registration successful! Please log in.");
      } else {
        setErrors({ general: data.message || "Registration failed" });
      }
    } catch (error) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 group flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300"
      >
        <svg
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span className="text-sm font-medium">Back to home</span>
      </Link>

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative flex items-center space-x-3 bg-black border border-gray-800 px-6 py-4 rounded-2xl backdrop-blur-sm">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-black"
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
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  InterviewAI
                </h1>
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Join the future
          </h2>
          <p className="text-gray-400 text-lg font-light max-w-sm mx-auto leading-relaxed">
            Create your account and start building better teams
          </p>
        </div>

        <form className="mt-12 space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Name Field */}
            <div className="group">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-400 mb-3 group-focus-within:text-white transition-colors duration-300"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 bg-gray-900/50 border ${
                    errors.name ? "border-red-500/50" : "border-gray-700"
                  } rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-500 backdrop-blur-sm font-light`}
                  placeholder="Enter your full name"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-2">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Username Field */}
            <div className="group">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-400 mb-3 group-focus-within:text-white transition-colors duration-300"
              >
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 bg-gray-900/50 border ${
                    errors.username ? "border-red-500/50" : "border-gray-700"
                  } rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-500 backdrop-blur-sm font-light`}
                  placeholder="Choose a username"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-2">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{errors.username}</span>
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="group">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400 mb-3 group-focus-within:text-white transition-colors duration-300"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 bg-gray-900/50 border ${
                    errors.email ? "border-red-500/50" : "border-gray-700"
                  } rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-500 backdrop-blur-sm font-light`}
                  placeholder="Enter your email"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-2">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400 mb-3 group-focus-within:text-white transition-colors duration-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 bg-gray-900/50 border ${
                    errors.password ? "border-red-500/50" : "border-gray-700"
                  } rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-500 backdrop-blur-sm font-light`}
                  placeholder="Create a password"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-2">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-400 mb-3 group-focus-within:text-white transition-colors duration-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 bg-gray-900/50 border ${
                    errors.confirmPassword
                      ? "border-red-500/50"
                      : "border-gray-700"
                  } rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-500 backdrop-blur-sm font-light`}
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-2">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-gray-900/50 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p className="text-white font-medium">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Password Requirements */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-medium">Password Requirements</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm font-light">
                  At least 6 characters
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    formData.password.length >= 6
                      ? "bg-green-500/20"
                      : "bg-gray-800"
                  }`}
                >
                  <svg
                    className={`w-3 h-3 ${
                      formData.password.length >= 6
                        ? "text-green-400"
                        : "text-gray-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm font-light">
                  Passwords match
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    formData.password === formData.confirmPassword &&
                    formData.confirmPassword
                      ? "bg-green-500/20"
                      : "bg-gray-800"
                  }`}
                >
                  <svg
                    className={`w-3 h-3 ${
                      formData.password === formData.confirmPassword &&
                      formData.confirmPassword
                        ? "text-green-400"
                        : "text-gray-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full py-4 px-6 bg-white text-black rounded-2xl text-lg font-medium transition-all duration-500 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-white"
          >
            <div className="relative z-10 flex items-center justify-center space-x-3">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-gray-500 font-light">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            href="/login"
            className="block w-full py-4 px-6 bg-transparent border-2 border-gray-700 text-white rounded-2xl text-lg font-medium text-center transition-all duration-500 transform hover:scale-105 hover:border-gray-500 hover:bg-gray-900/30 backdrop-blur-sm"
          >
            Sign in instead
          </Link>
        </form>
      </div>
    </div>
  );
}
