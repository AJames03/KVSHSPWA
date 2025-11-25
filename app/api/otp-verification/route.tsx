import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });

    // Get OTP record
    const { data, error } = await supabase
      .from("password_reset_otps")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .eq("used", false)
      .single();

    if (error || !data) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

    // Check expiration
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from("password_reset_otps")
      .update({ used: true })
      .eq("email", email);

    if (updateError) console.error("Error marking OTP as used:", updateError);

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (err: any) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Server error while verifying OTP" }, { status: 500 });
  }
}
