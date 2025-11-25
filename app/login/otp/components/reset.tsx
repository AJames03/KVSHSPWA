"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleReset = async () => {
    if (!email || !newPassword) return setMessage("All fields are required");

    const res = await fetch("/api/reset-pass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ padding: 8, width: 300 }}
      />
      <br /><br />
      <button
        onClick={handleReset}
        style={{ padding: 10, background: "green", color: "white" }}
      >
        Reset Password
      </button>
      <p>{message}</p>
    </div>
  );
}
