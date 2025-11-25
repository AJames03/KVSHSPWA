"use client";

import { useState } from "react";

export default function RequestOTP() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleRequestOTP = async () => {
    if (!email) return setMessage("Email is required");

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Request OTP</h2>
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, width: 300 }}
      />
      <br /><br />
      <button
        onClick={handleRequestOTP}
        style={{ padding: 10, background: "blue", color: "white" }}
      >
        Send OTP
      </button>
      <p>{message}</p>
    </div>
  );
}
