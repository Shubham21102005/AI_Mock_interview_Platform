"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Edit2, Save, X, Upload, LogOut } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUser(data);
      setFormData({
        name: data.name,
        username: data.username,
      });
      setPreviewUrl(data.profilePicture || "");
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("username", formData.username);
      if (selectedFile) {
        formDataToSend.append("profilePicture", selectedFile);
      }

      const response = await fetch(`${API_BASE}/auth/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser(data.user);
      setPreviewUrl(data.user.profilePicture || "");
      setSelectedFile(null);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username,
      });
      setPreviewUrl(user.profilePicture || "");
      setSelectedFile(null);
    }
    setIsEditing(false);
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="border-2 border-white/10 p-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white mx-auto mb-6 animate-spin"></div>
            <p className="text-xl font-mono uppercase tracking-wider text-white/60">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b-2 border-white/10 sticky top-0 z-10 bg-black">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight uppercase">Profile</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 border-2 border-white/20 hover:border-white hover:bg-white/5 transition-all font-bold uppercase tracking-wider text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 border-2 border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-wider text-sm flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Alerts */}
        {error && (
          <div className="mb-6 border-2 border-red-500/50 p-4 bg-red-500/10">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-red-500 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-red-500"
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
              <span className="text-red-500 text-sm">{error}</span>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 border-2 border-green-500/50 p-4 bg-green-500/10">
            <div className="flex items-center gap-3">
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
              <span className="text-green-500 text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="border-2 border-white/10">
          {/* Profile Picture Section */}
          <div className="border-b-2 border-white/10 p-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-cyan-500/50 p-1 bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <User className="w-16 h-16 text-cyan-500/60" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 cursor-pointer transition-all border-2 border-purple-600"
                  >
                    <Upload className="w-5 h-5 text-white" />
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditing && selectedFile && (
                <p className="mt-3 text-xs font-mono text-white/40 uppercase tracking-wider">
                  {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-8 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-xs font-mono text-white/40 mb-2 uppercase tracking-widest">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-black border-2 border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-lg text-white/90">{user.name}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-mono text-white/40 mb-2 uppercase tracking-widest">
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-black border-2 border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
                  placeholder="Enter your username"
                />
              ) : (
                <p className="text-lg text-white/90 font-mono">@{user.username}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-mono text-white/40 mb-2 uppercase tracking-widest">
                Email Address
              </label>
              <p className="text-lg text-white/90">{user.email}</p>
              <p className="text-xs font-mono text-white/30 mt-2 uppercase tracking-wider">
                Email cannot be changed
              </p>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-xs font-mono text-white/40 mb-2 uppercase tracking-widest">
                Member Since
              </label>
              <p className="text-lg text-white/90">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t-2 border-white/10 p-8">
            {isEditing ? (
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-8 py-4 bg-purple-600 border-2 border-purple-600 text-white hover:bg-purple-700 hover:border-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-wider"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 px-8 py-4 border-2 border-white/20 hover:border-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-wider"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-8 py-4 bg-cyan-600 border-2 border-cyan-600 text-white hover:bg-cyan-700 hover:border-cyan-700 transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-wider"
              >
                <Edit2 className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
