import smtplib
import os
import httpx
import email.utils
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any
from app.core.config import settings

class EmailService:
    @staticmethod
    def send_otp_email(recipient_email: str, otp_code: str, purpose: str = "registration") -> Dict[str, Any]:
        """
        Send a real 6-digit verification OTP email strictly to the user's inbox.
        Supports HTTPS REST APIs (Brevo, Resend, Webhook) + Dual-port SMTP fallback.
        Auto-detects verified sender email from Brevo account to avoid sender email mismatch.
        """
        clean_recipient = recipient_email.strip()
        clean_user = (os.getenv("SMTP_USER", settings.SMTP_USER) or "helloguys6167@gmail.com").strip()
        clean_password = (os.getenv("SMTP_PASSWORD", settings.SMTP_PASSWORD) or "yzlwhxnlpoofpxao").replace(" ", "").strip()
        smtp_host = (os.getenv("SMTP_HOST", settings.SMTP_HOST) or "smtp.gmail.com").strip()
        from_name = os.getenv("EMAILS_FROM_NAME", settings.EMAILS_FROM_NAME) or "B.Tech Learning Platform"
        clean_from_email = clean_user

        resend_key = os.getenv("RESEND_API_KEY", settings.RESEND_API_KEY).strip()
        brevo_key = os.getenv("BREVO_API_KEY", settings.BREVO_API_KEY).strip()
        webhook_url = os.getenv("EMAIL_WEBHOOK_URL", settings.EMAIL_WEBHOOK_URL).strip()

        subject_map = {
            "registration": f"Your B.Tech Verification Code: {otp_code}",
            "login": f"Your B.Tech Login Code: {otp_code}",
            "reset_password": f"Password Reset Code: {otp_code}"
        }
        subject = subject_map.get(purpose, f"Your Verification Code: {otp_code}")

        # Plain Text Alternative
        text_content = f"""Hello Engineer,

Your B.Tech Learning Platform verification code is: {otp_code}

This code is valid for 10 minutes. Please enter this code on the registration page to complete email verification.

Do not share this code with anyone.

Happy Coding,
B.Tech Learning Platform Team
"""

        # Rich HTML Branded Template
        html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090D16; color: #F3F4F6; margin: 0; padding: 20px; }}
    .container {{ max-width: 500px; margin: 0 auto; background: #0F172A; border-radius: 16px; border: 1px solid #1E293B; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
    .header {{ text-align: center; margin-bottom: 24px; }}
    .brand {{ font-size: 20px; font-weight: 800; color: #818CF8; letter-spacing: -0.5px; }}
    .title {{ font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 12px 0 6px; }}
    .desc {{ font-size: 13px; color: #94A3B8; line-height: 1.5; }}
    .otp-box {{ background: #1E293B; border: 2px dashed #6366F1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }}
    .otp-code {{ font-size: 36px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #38BDF8; margin: 0; }}
    .timer {{ font-size: 11px; color: #94A3B8; margin-top: 8px; }}
    .footer {{ text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 11px; color: #64748B; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">⚡ B.Tech Learning Platform</div>
      <div class="title">Email Verification Code</div>
      <div class="desc">Please use the 6-digit OTP code below to verify your student email address.</div>
    </div>
    
    <div class="otp-box">
      <div class="otp-code">{otp_code}</div>
      <div class="timer">Valid for 10 minutes • Single Use Only</div>
    </div>
    
    <p class="desc" style="font-size: 12px;">If you did not request this verification code, please ignore this email.</p>
    
    <div class="footer">
      © 2026 B.Tech Learning Platform • Advanced Engineering & Coding Arena
    </div>
  </div>
</body>
</html>"""

        brevo_sender = os.getenv("BREVO_SENDER_EMAIL", "").strip()
        brevo_err = None

        # ================= 1. HTTPS REST API: BREVO (Top Priority - Sends to ALL recipients) =================
        if brevo_key:
            try:
                # If sender not explicitly specified, auto-discover the verified sender email from Brevo account
                if not brevo_sender:
                    try:
                        senders_res = httpx.get(
                            "https://api.brevo.com/v3/senders",
                            headers={"api-key": brevo_key, "accept": "application/json"},
                            timeout=5.0
                        )
                        if senders_res.status_code == 200:
                            senders_list = senders_res.json().get("senders", [])
                            if senders_list:
                                brevo_sender = senders_list[0].get("email")
                                print(f"[BREVO AUTO-SENDER] Found verified sender in Brevo: {brevo_sender}")
                    except Exception as e_snd:
                        print(f"[BREVO SENDER DISCOVERY NOTICE] {e_snd}")

                if not brevo_sender:
                    brevo_sender = clean_from_email

                res = httpx.post(
                    "https://api.brevo.com/v3/smtp/email",
                    headers={"api-key": brevo_key, "Content-Type": "application/json"},
                    json={
                        "sender": {"name": from_name, "email": brevo_sender},
                        "to": [{"email": clean_recipient}],
                        "subject": subject,
                        "htmlContent": html_content,
                        "textContent": text_content
                    },
                    timeout=10.0
                )
                if res.status_code in [200, 201]:
                    print(f"[BREVO SUCCESS] Email delivered via Brevo HTTPS API from {brevo_sender} to {clean_recipient}")
                    return {"sent": True, "provider": "brevo_https", "message": f"Delivered to {clean_recipient}"}
                else:
                    try:
                        brevo_err = res.json().get("message", res.text)
                    except Exception:
                        brevo_err = res.text
                    print(f"[BREVO NOTICE] Brevo returned {res.status_code}: {brevo_err}")
            except Exception as e:
                brevo_err = str(e)
                print(f"[BREVO ERROR] {e}")

        # ================= 2. HTTPS REST API: RESEND =================
        resend_err = None
        if resend_key:
            try:
                res = httpx.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {resend_key}", "Content-Type": "application/json"},
                    json={
                        "from": f"{from_name} <onboarding@resend.dev>",
                        "to": [clean_recipient],
                        "subject": subject,
                        "html": html_content,
                        "text": text_content
                    },
                    timeout=10.0
                )
                if res.status_code in [200, 201]:
                    print(f"[RESEND SUCCESS] Email delivered via Resend HTTPS API to {clean_recipient}")
                    return {"sent": True, "provider": "resend_https", "message": f"Delivered to {clean_recipient}"}
                else:
                    try:
                        resend_err = res.json().get("message", res.text)
                    except Exception:
                        resend_err = res.text
                    print(f"[RESEND NOTICE] Resend returned {res.status_code}: {resend_err}")
            except Exception as e:
                resend_err = str(e)
                print(f"[RESEND ERROR] {e}")

        # ================= 3. HTTPS REST API: WEBHOOK / GOOGLE SCRIPT =================
        if webhook_url:
            try:
                res = httpx.post(
                    webhook_url,
                    json={
                        "to": clean_recipient,
                        "subject": subject,
                        "text": text_content,
                        "html": html_content,
                        "otp_code": otp_code,
                        "from_name": from_name
                    },
                    timeout=10.0
                )
                if res.status_code in [200, 201]:
                    print(f"[WEBHOOK SUCCESS] Email delivered via Webhook to {clean_recipient}")
                    return {"sent": True, "provider": "webhook_https", "message": f"Delivered to {clean_recipient}"}
            except Exception as e:
                print(f"[WEBHOOK ERROR] {e}")

        # ================= 4. DIRECT SMTP SOCKETS (Port 587 & 465) =================
        # Skip raw SMTP on Render since Render Free Tier blocks outbound ports 25, 465, 587
        if not os.getenv("RENDER"):
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{from_name} <{clean_from_email}>"
            msg["To"] = clean_recipient
            msg["Reply-To"] = clean_from_email
            msg["Date"] = email.utils.formatdate(localtime=True)
            msg["Message-ID"] = email.utils.make_msgid(domain="gmail.com")
            msg.attach(MIMEText(text_content, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            # Try Port 587 TLS
            try:
                server = smtplib.SMTP(smtp_host, 587, timeout=3.0)
                server.starttls()
                server.login(clean_user, clean_password)
                server.sendmail(clean_from_email, [clean_recipient], msg.as_string())
                server.quit()
                print(f"[EMAIL SUCCESS] Real SMTP email delivered to {clean_recipient} via Port 587")
                return {"sent": True, "provider": "smtp_tls_587", "message": f"Real OTP email delivered to {clean_recipient}"}
            except Exception as e587:
                print(f"[SMTP 587 NOTICE] Port 587 socket failed ({e587}), trying Port 465 SSL...")

            # Try Port 465 SSL
            try:
                server_ssl = smtplib.SMTP_SSL(smtp_host, 465, timeout=3.0)
                server_ssl.login(clean_user, clean_password)
                server_ssl.sendmail(clean_from_email, [clean_recipient], msg.as_string())
                server_ssl.quit()
                print(f"[EMAIL SUCCESS] Real SMTP email delivered to {clean_recipient} via Port 465")
                return {"sent": True, "provider": "smtp_ssl_465", "message": f"Real OTP email delivered to {clean_recipient}"}
            except Exception as e465:
                print(f"[SMTP ERROR] Both ports 587 & 465 socket failed: {e465}")

        # If outbound SMTP sockets are blocked by cloud provider (Render Free Tier blocks raw port 587/465)
        err_detail = brevo_err or resend_err or "Please add BREVO_API_KEY (from brevo.com) into Render Environment Variables to enable email delivery to all student addresses."
        return {
            "sent": False,
            "provider": "cloud_blocked",
            "error": err_detail
        }
