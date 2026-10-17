"use server";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactFormAction(data: ContactFormData) {
  try {
    const { name, email, subject, message } = data;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return { success: false, error: "All fields are required." };
    }

    if (!email.includes("@") || !email.includes(".")) {
      return { success: false, error: "Please provide a valid email address." };
    }

    // In production, send via SendGrid, Resend, or store in database
    console.log(`[Contact Form Dispatch Received] From: ${name} <${email}>, Subject: ${subject}`);

    return {
      success: true,
      message: "Your message has been successfully transmitted to the editorial desk.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "An unexpected error occurred while transmitting your message.",
    };
  }
}
