import { Resend } from "resend";
import { getCoopConnectOtpTemplate } from "./email-template";

export async function sendOtpEmail(toEmail: string, otp: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "CoopConnect <verify@dhruv.store>";

  // Console log for local dev testing
  console.log(`\n========================================`);
  console.log(`[RESEND EMAIL OTP] Sent to: ${toEmail}`);
  console.log(`[RESEND EMAIL OTP] CoopConnect Code: ${otp}`);
  console.log(`[RESEND SENDER] From: ${fromEmail}`);
  console.log(`========================================\n`);

  if (!apiKey) {
    console.warn(
      "[Resend Warning] RESEND_API_KEY is not set in .env.local. CoopConnect verification code logged above for local testing."
    );
    return {
      sent: false,
      reason: "Missing RESEND_API_KEY environment variable",
    };
  }

  const resend = new Resend(apiKey);

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `CoopConnect Verification Code: ${otp}`,
      html: getCoopConnectOtpTemplate(otp),
    });

    if (data.error) {
      console.error("[Resend API Error]:", data.error);
      return { sent: false, error: data.error.message };
    }

    console.log("[Resend Email Success] Email ID:", data.data?.id);
    return { sent: true, id: data.data?.id };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("[Resend Dispatch Error]:", errMessage);
    return { sent: false, error: errMessage };
  }
}
