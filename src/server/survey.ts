"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const surveySchema = z.object({
  challenge: z.string().min(1, "Please select a challenge"),
  otherChallenge: z.string().optional(),
  currentSolution: z.string().min(1, "Please describe your current solution"),
  userEmail: z.email().optional(),
  userName: z.string().optional(),
});

export type SurveyData = z.infer<typeof surveySchema>;

export async function submitSurvey(data: SurveyData) {
  const result = surveySchema.safeParse(data);
  
  if (!result.success) {
    return { error: "Invalid survey data" };
  }

  const { challenge, otherChallenge, currentSolution, userEmail, userName } = result.data;
  const finalChallenge = challenge === "Other" ? otherChallenge : challenge;
  const notifyEmail = process.env.NOTIFICATION_EMAIL;

  if (!notifyEmail) {
    console.error("NOTIFICATION_EMAIL is not set");
    return { error: "Notification configuration missing" };
  }

  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "test") {
      console.log("--- SURVEY SUBMISSION (SIMULATED) ---");
      console.log("To:", notifyEmail);
      console.log("From:", userName || "Anonymous", `<${userEmail || "no-reply@email.com"}>`);
      console.log("Challenge:", finalChallenge);
      console.log("Current Solution:", currentSolution);
      console.log("------------------------------------");
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true, message: "Survey submitted successfully (Simulated)" };
    }

    await resend.emails.send({
      from: "Survey <onboarding@resend.dev>",
      to: notifyEmail,
      subject: `New API Survey Response: ${finalChallenge}`,
      html: `
        <h2>New API Survey Response</h2>
        <p><strong>User:</strong> ${userName || "Anonymous"} (${userEmail || "Not provided"})</p>
        <p><strong>Biggest Challenge:</strong> ${finalChallenge}</p>
        <p><strong>Current Solution for [${finalChallenge}]:</strong></p>
        <p>${currentSolution}</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send survey email:", error);
    return { error: "Failed to submit survey. Please try again later." };
  }
}
