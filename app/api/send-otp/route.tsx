import { supabase } from '@/lib/supabaseClient';

function generateOTP(length = 6) {
  let otp = '';
  const chars = '0123456789';
  for (let i = 0; i < length; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }
  return otp;
}

// Function to send OTP via Supabase email
async function sendOTPEmail(email: string, otp: string) {
  // Supabase has a built-in function to send custom emails through SMTP
  const { error } = await supabase.functions.invoke('send-otp-email', {
    body: { email, otp }
  });
  return error;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('AppUsers')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Email not found' }), { status: 404 });
    }

    // Generate OTP
    const otp = generateOTP(6);

    // Upsert OTP
    const { error: otpError } = await supabase
      .from('teacher_resetpass_otps')
      .upsert({ email, otp }, { onConflict: ['email'] });

    if (otpError) {
      return new Response(JSON.stringify({ error: 'Failed to store OTP' }), { status: 500 });
    }

    // Send OTP email
    const emailError = await sendOTPEmail(email, otp);
    if (emailError) {
      return new Response(JSON.stringify({ error: 'Failed to send OTP email' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'OTP sent to email' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
