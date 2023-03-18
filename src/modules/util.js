import nodemailer from "nodemailer";

const EMAIL_FROM = "me";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "myrtle.quigley57@ethereal.email",
    pass: "PwydAKYEheGhkR9gc8",
  },
});

export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `https://example.com/reset-password?token=${token}`;

  const message = {
    from: EMAIL_FROM,
    to: email,
    subject: "Password Reset Request",
    html: `<p>Dear user,</p>
           <p>You have requested to reset your password. Please click the link below to reset your password:</p>
           <p><a href="${resetLink}">${resetLink}</a></p>
           <p>If you did not request a password reset, please ignore this email.</p>`,
  };

  try {
    await transporter.sendMail(message);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send password reset email to ${email}: ${error}`);
  }
};
