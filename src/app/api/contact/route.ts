import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Admin email to receive contact form submissions
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "delivered@resend.dev"; // Change to your actual email

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Map subject to readable text
    const subjectMap: Record<string, string> = {
      partnership: "Partnership Inquiry",
      driver: "Driver Application",
      general: "General Question",
      support: "Support Request",
    };

    const subjectText = subjectMap[subject] || subject;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "SMP Green Rides <onboarding@resend.dev>", // Use your verified domain in production
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `[Contact Form] ${subjectText} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #16a34a; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SMP Green Rides Africa</h1>
            <p style="color: #bbf7d0; margin: 5px 0 0 0;">New Contact Form Submission</p>
          </div>

          <div style="padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827; margin-top: 0;">${subjectText}</h2>

            <div style="margin-bottom: 20px;">
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">From:</p>
              <p style="margin: 5px 0; color: #111827; font-size: 16px;"><strong>${name}</strong></p>
              <p style="margin: 5px 0; color: #111827; font-size: 14px;">${email}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Message:</p>
              <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              You can reply directly to this email to respond to ${name}.
            </p>
          </div>

          <div style="padding: 20px; text-align: center; background-color: #111827;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} SMP Green Rides Africa. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    console.log("Email sent successfully:", data);

    return NextResponse.json(
      { message: "Message sent successfully", id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
