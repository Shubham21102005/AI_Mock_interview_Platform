"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Edit2, Save, X, Upload, LogOut } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
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
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-white flex items-center justify-center">
        <div className="bg-white border-2 border-[#e9ecef] rounded-2xl p-12 shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#e9ecef] border-t-[#f9b17a] mx-auto mb-6 rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-[#676f9d]">
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-white">
      {/* Header */}
      <header className="border-b border-[#e9ecef] sticky top-0 z-10 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#2d3250]">Profile</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2 border-2 border-[#676f9d] hover:bg-[#676f9d] text-[#676f9d] hover:text-white transition-all font-medium rounded-lg text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2 border-2 border-[#ef4444] bg-[#ef4444]/5 text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-all font-medium rounded-lg text-sm flex items-center gap-2"
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

        {/* Profile Card */}
        <div className="bg-white border-2 border-[#e9ecef] rounded-3xl overflow-hidden shadow-lg">
          {/* Profile Picture Section */}
          <div className="border-b-2 border-[#e9ecef] p-8 bg-gradient-to-br from-[#f8f9fa] to-white">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-[#f9b17a] rounded-full p-1 bg-gradient-to-br from-[#f9b17a]/10 to-[#676f9d]/10 shadow-lg">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <User className="w-16 h-16 text-[#adb5bd]" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-[#f9b17a] hover:bg-[#e89b5f] p-2.5 cursor-pointer transition-all rounded-full shadow-md"
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
                <p className="mt-3 text-xs text-[#676f9d]">
                  {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-8 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#424769] mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border-2 border-[#e9ecef] focus:border-[#f9b17a] text-[#2d3250] placeholder-[#adb5bd] rounded-xl focus:outline-none transition-all focus:ring-4 focus:ring-[#f9b17a]/10"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-lg text-[#2d3250] font-medium">{user.name}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[#424769] mb-2">
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border-2 border-[#e9ecef] focus:border-[#f9b17a] text-[#2d3250] placeholder-[#adb5bd] rounded-xl focus:outline-none transition-all focus:ring-4 focus:ring-[#f9b17a]/10"
                  placeholder="Enter your username"
                />
              ) : (
                <p className="text-lg text-[#2d3250] font-medium">@{user.username}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-[#424769] mb-2">
                Email Address
              </label>
              <p className="text-lg text-[#2d3250] font-medium">{user.email}</p>
              <p className="text-xs text-[#adb5bd] mt-2">
                Email cannot be changed
              </p>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-[#424769] mb-2">
                Member Since
              </label>
              <p className="text-lg text-[#2d3250] font-medium">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t-2 border-[#e9ecef] p-8 bg-[#f8f9fa]">
            {isEditing ? (
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-8 py-4 bg-[#f9b17a] text-white hover:bg-[#e89b5f] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl flex items-center justify-center gap-3 font-semibold shadow-md hover:shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 px-8 py-4 border-2 border-[#676f9d] hover:bg-[#676f9d] text-[#676f9d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl flex items-center justify-center gap-3 font-semibold"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-8 py-4 bg-[#424769] text-white hover:bg-[#2d3250] transition-all rounded-xl flex items-center justify-center gap-3 font-semibold shadow-md hover:shadow-lg"
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
