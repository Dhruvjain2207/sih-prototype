export function getCoopConnectOtpTemplate(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CoopConnect Verification Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 40px 20px;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e8e8ed;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">CoopConnect</h1>
            <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Secure Identity & Verification</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 36px 32px;">
            <h2 style="color: #1e293b; margin: 0 0 12px 0; font-size: 20px; font-weight: 700; text-align: center;">CoopConnect Verification Code</h2>
            <p style="color: #64748b; margin: 0 0 28px 0; font-size: 15px; line-height: 1.5; text-align: center;">
              Use the 6-digit verification code below to confirm your account identity on <strong>CoopConnect</strong>.
            </p>

            <!-- OTP Box -->
            <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #4f46e5;">${otp}</span>
            </div>

            <!-- Notice & Expiry -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 6px; margin-bottom: 28px;">
              <p style="color: #1e40af; margin: 0; font-size: 13px; line-height: 1.4;">
                ⏱️ <strong>Note:</strong> This verification code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
              </p>
            </div>

            <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
              If you did not request this verification code on CoopConnect, please ignore this email or contact support.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; margin: 0; font-size: 12px;">
              Sent via <strong style="color: #64748b;">dhruv.store</strong> for CoopConnect Platform
            </p>
            <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 11px;">
              &copy; ${new Date().getFullYear()} CoopConnect. All rights reserved.
            </p>
          </div>

        </div>
      </body>
    </html>
  `;
}
