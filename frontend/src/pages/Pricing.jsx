import React from "react";
import { useNavigate } from "react-router-dom";


const Pricing = () => {
  const navigate = useNavigate();

const handleSubscribe = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const order = await res.json();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "AI Blog Generator",
      description: "Subscription for unlimited blog generation",
      order_id: order.id,
      handler: async function (response) {
        const verifyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(response),
        });

        const result = await verifyRes.json();
        if (result.success) {
          alert("✅ Payment successful!");
        } else {
          alert("❌ Payment verification failed.");
        }
      },
      prefill: {
        name: "User Name",
        email: "user@example.com",
      },
      theme: {
        color: "#22c55e",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Razorpay Error:", err);
    alert("Something went wrong");
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4 py-12">
      <div className="max-w-3xl bg-white rounded-xl shadow-2xl p-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Unlock Unlimited AI Blogs ✨</h1>
        <p className="text-gray-600 mb-8">Subscribe to generate unlimited AI blogs and access premium features.</p>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl text-xl font-semibold mb-6">
          ₹199/month – Unlimited Blogs 🚀
        </div>

        <ul className="text-left mb-6 space-y-2 text-gray-700">
          <li>✅ Unlimited AI blog generations</li>
          <li>✅ WordPress and Dev.to publishing</li>
          <li>✅ Download in PDF/Word</li>
          <li>✅ Schedule your blogs</li>
        </ul>

        <button
          onClick={handleSubscribe}
          className="bg-green-600 hover:bg-green-700 text-white text-lg px-6 py-3 rounded-lg font-medium shadow-lg transition"
        >
          Subscribe with Razorpay
        </button>

        <button
          onClick={() => navigate("/generate")}
          className="mt-4 block text-gray-600 hover:underline"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
};

export default Pricing;
