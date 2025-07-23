// src/components/Signup.jsx
import React, { useState, useRef } from "react";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const codeRef = useRef("");

  const [isVerified, setIsVerified] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendVerificationCode = async () => {
    if (!form.email) return alert("Please enter an email first");

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();
      if (res.ok) {
        codeRef.current = data.code;
        alert("📩 Code sent! Check console for preview.");
        if (data.previewURL) window.open(data.previewURL, "_blank");
        console.log("📨 Email Preview URL:", data.previewURL);
      } else {
        alert(data.message || "Failed to send code");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send code");
    }
  };

  const verifyCode = () => {
    if (verificationCode === codeRef.current) {
      setIsVerified(true);
      alert("✅ Email verified successfully!");
    } else {
      alert("❌ Incorrect verification code.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isVerified) return alert("Please verify your email first!");

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Signup successful! You can now log in.");
        window.location.href = "/login";
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-pink-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Create Your Account</h2>

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-100">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-100">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
            />
            <button
              type="button"
              onClick={sendVerificationCode}
              className="text-sm mt-1 text-pink-200 underline hover:text-white"
            >
              Send Verification Code
            </button>
          </div>

          {/* Verification Code */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-100">Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="6-digit code"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
            />
            <button
              type="button"
              onClick={verifyCode}
              className="text-sm mt-1 text-green-200 underline hover:text-white"
            >
              Verify Code
            </button>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block mb-1 text-sm font-medium text-gray-100">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 pr-10 rounded-lg bg-white/20 border border-white/30 text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-white"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 font-semibold shadow-md"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-200">
          Already have an account?{" "}
          <a href="/login" className="underline text-white hover:text-pink-300">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
