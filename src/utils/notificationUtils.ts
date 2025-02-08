import nodemailer from "nodemailer";
import twilio from "twilio";

// 🔹 Configurare transport email (folosește serviciul preferat)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 🔹 Configurare Twilio pentru SMS
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";

/**
 * ✅ Trimite o invitație prin email
 */
export const sendInvitationEmail = async (email: string, inviteToken: string) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "You have been invited!",
        text: `Click the link to accept your invitation: ${process.env.FRONTEND_URL}/accept-invite/${inviteToken}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Invitation email sent to ${email}`);
    } catch (error) {
        console.error(`🚨 Error sending invitation email:`, error);
    }
};

/**
 * ✅ Trimite o invitație prin SMS
 */
export const sendInvitationSMS = async (phoneNumber: string, inviteToken: string) => {
    try {
        await twilioClient.messages.create({
            body: `You have been invited! Click the link to accept: ${process.env.FRONTEND_URL}/accept-invite/${inviteToken}`,
            from: TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });
        console.log(`📲 Invitation SMS sent to ${phoneNumber}`);
    } catch (error) {
        console.error(`🚨 Error sending SMS invitation:`, error);
    }
};
