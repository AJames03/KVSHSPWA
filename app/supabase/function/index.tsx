import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!,
  Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")!
);

serve(async (req) => {
  const { email, otp } = await req.json();

  const { error } = await supabase.auth.admin.sendUserEmail({
    email,
    emailRedirectTo: `https://yourapp.com/verify-otp?otp=${otp}`
  });

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  return new Response(JSON.stringify({ message: "OTP email sent" }), { status: 200 });
});
