import { NextRequest, NextResponse } from "next/server";

// Contact form submission handler
// TODO: Configure email service (Resend, Nodemailer, etc.)

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

    // TODO: Implement email sending
    // Option 1: Resend
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@smpgreenrides.africa',
    //   to: 'admin@smpgreenrides.africa',
    //   subject: `Contact Form: ${subject}`,
    //   html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong></p><p>${message}</p>`,
    // });

    // Option 2: Nodemailer
    // import nodemailer from 'nodemailer';
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({...});

    // For now, log the submission
    console.log("Contact form submission:", { name, email, subject, message });

    return NextResponse.json(
      { message: "Message sent successfully" },
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
