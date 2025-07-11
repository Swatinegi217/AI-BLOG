// component/SubscriptionModal.jsx
import React from 'react';
import { useNavigate } from "react-router-dom";

const SubscriptionModal = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-8 w-full max-w-md text-center shadow-xl">
        <h2 className="text-2xl font-bold text-black mb-4">🚫 Free Limit Reached</h2>
        <p className="text-gray-700 mb-6">
          You’ve reached your 2 free blog generations. Please subscribe to unlock unlimited access!
        </p>

        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full shadow-md mb-4"
          onClick={() => navigate("/pricing")} // 👈 your internal pricing page
        >
          🚀 Subscribe Now
        </button>

        <button
          className="bg-black text-white px-4 py-2 rounded-md"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SubscriptionModal;

