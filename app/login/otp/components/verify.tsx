"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleVerify = async () => {
    if (!email || !otp) return setMessage("Email and OTP required");

    const res = await fetch("/api/otp-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("OTP Verified! Redirecting to reset password...");
      router.push(`/otp/reset?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Verify OTP</h2>
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, width: 300 }}
      />
      <br /><br />
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOTP(e.target.value)}
        style={{ padding: 8, width: 300 }}
      />
      <br /><br />
      <button
        onClick={handleVerify}
        style={{ padding: 10, background: "green", color: "white" }}
      >
        Verify OTP
      </button>
      <p>{message}</p>
    </div>
  );
}
