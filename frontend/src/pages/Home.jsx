import React from "react";
import { Link } from "react-router-dom";
import profile from "../assets/profile.png"; // Add your image here

const Home = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] animate-gradient-x">

      {/* Blobs */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-purple-600 opacity-20 rounded-full top-[-200px] left-[-200px] blur-3xl animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-pink-500 opacity-20 rounded-full bottom-[-200px] right-[-150px] blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-10 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl">

        {/* Left Section */}
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
            Welcome to <span className="text-white">AI Blog Generator</span>
          </h1>
          <p className="text-lg text-gray-300">
            Create stunning, AI-powered blogs effortlessly. Generate. Edit. Publish.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/generate" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white px-6 py-2 rounded-full font-medium shadow-md">
              Generate Blog
            </Link>
            <Link to="/login" className="bg-white text-purple-700 hover:text-purple-900 px-6 py-2 rounded-full font-medium shadow-md">
              Login
            </Link>
            <Link to="/signup" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white px-6 py-2 rounded-full font-medium shadow-md">
              Signup
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex justify-center items-center">
          <img
            src={profile}
            alt="AI Illustration"
            className="w-full h-full object-contain max-w-[400px] md:max-w-[500px] rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
