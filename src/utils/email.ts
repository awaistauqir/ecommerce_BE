import nodemailer, { SendMailOptions } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import { InternalServerError } from "../errors/CustomError";

// Create common transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
} as SMTPTransport.Options);

// Attach hbs template folder to the transporter
transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".hbs",
      defaultLayout: "",
    },
    viewPath: path.resolve(__dirname, "../templates"),
    extName: ".hbs",
  })
);
// ---------------------------------------------------------------

// Email Functions
// Define the context types for both emails
interface VerifyUserContext {
  name: string;
  verificationLink: string;
}

interface ForgotPasswordContext {
  name: string;
  resetLink: string;
}

interface ExtendedMailOptions extends SendMailOptions {
  template?: string;
  context?: VerifyUserContext | ForgotPasswordContext;
}

// Verify User Email
export const sendVerifyUserEmail = async (options: ExtendedMailOptions) => {
  if (!options.context || !("verificationLink" in options.context)) {
    throw new Error(
      "Verification email context is required with properties: name, verificationLink"
    );
  }

  const mailOptions: ExtendedMailOptions = {
    from: "Awais Tauqir <hello@awais.io>",
    to: options.to,
    subject: "Verify your account",
    template: "emailVerification", // Assuming verifyUser.hbs
    context: options.context,
  };

  await transporter.sendMail(mailOptions);
  console.log("Verification email sent successfully");
};

// Forgot Password Email
export const sendForgotPasswordEmail = async (options: ExtendedMailOptions) => {
  if (!options.context || !("resetLink" in options.context)) {
    throw new Error(
      "Forgot password email context is required with properties: name, resetLink"
    );
  }

  try {
    const mailOptions: ExtendedMailOptions = {
      from: "Awais Tauqir <hello@awais.io>",
      to: options.to,
      subject: "Reset your password",
      template: "forgotPassword", // Assuming forgotPassword.hbs
      context: options.context,
    };

    await transporter.sendMail(mailOptions);
    console.log("Forgot password email sent successfully");
  } catch (error) {
    console.error("Error sending forgot password email:", error);
    throw new InternalServerError(
      "Error sending password reset link: " + (error as Error).message
    );
  }
};
