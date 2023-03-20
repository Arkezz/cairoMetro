import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { query } from "../db.js";
import logger from "../modules/logger.js";
import { sendPasswordResetEmail } from "../modules/util.js";

const JWT_SECRET = process.env.JWT_SECRET || "HangMeOhHangMe";
const PASSWORD_LENGTH = 8; // Use environment variables for sensitive data

// Register a new user
export const createUser = async (ctx) => {
  const { email, password } = ctx.request.body;

  if (!email || !password) {
    ctx.throw(400, "Missing email or password");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    ctx.throw(400, "Invalid email address");
  }
  if (password.length < PASSWORD_LENGTH) {
    ctx.throw(
      400,
      `Password must be at least ${PASSWORD_LENGTH} characters long`
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  logger.info("Registering user: " + email);

  try {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length !== 0) {
      ctx.throw(409, "An account with that email already exists");
    }

    const insertResult = await query(
      "INSERT INTO users (email, password, role, status) VALUES ($1, $2, 'user', 'active') RETURNING user_id",
      [email, hashedPassword]
    );
    const user = insertResult.rows[0];
    const token = jwt.sign({ userId: user.user_id }, JWT_SECRET);

    ctx.body = { token };
  } catch (error) {
    logger.error(error);
    ctx.throw(400, "Failed to create user");
  }
};

// Login a user
export const authenticateUser = async (ctx) => {
  const { email, password } = ctx.request.body;

  // Input validation
  if (!email || !password) {
    ctx.throw(400, "Missing email or password");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    ctx.throw(400, "Invalid email address");
  }

  try {
    const result = await query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];

    // Check if user exists
    if (!user) {
      ctx.throw(401, "Invalid login credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Check if password is valid
    if (!isPasswordValid) {
      ctx.throw(401, "Invalid login credentials");
    }

    const token = jwt.sign({ userId: user.user_id }, JWT_SECRET);

    ctx.body = { token };
  } catch (error) {
    logger.error(error);
    ctx.throw(401, "Invalid login credentials");
  }
};

//Send password reset email
export const requestPasswordReset = async (ctx) => {
  const { email } = ctx.request.body;

  if (!email) {
    ctx.throw(400, "Missing email");
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!EMAIL_REGEX.test(email)) {
    ctx.throw(400, "Invalid email address");
  }

  try {
    const user = await query("SELECT * FROM users WHERE email=$1", [email]);

    if (user.rows.length === 0) {
      ctx.throw(404, "No account associated with that email");
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + 3600000); // One hour from now
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    await query(
      "UPDATE users SET reset_password_token=$1, reset_password_expiry=$2 WHERE email=$3",
      [token, expiry, email]
    );

    await sendPasswordResetEmail(email, token);

    ctx.body = { message: "Password reset link sent to your email" };
  } catch (error) {
    logger.error(error);
    ctx.throw(400, "Could not request password reset");
  }
};

// Reset password
export const resetPassword = async (ctx) => {
  const { token, password } = ctx.request.body;

  try {
    // Verify token and check expiry time
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await query("SELECT * FROM users WHERE email=$1", [
      decoded.email,
    ]).then((res) => res.rows[0]);
    if (
      !user ||
      user.reset_password_token !== token ||
      user.reset_password_expiry < new Date().getTime()
    ) {
      throw new Error("Invalid or expired reset token");
    }

    // Update user's password and clear reset token and expiry time
    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      "UPDATE users SET password=$1, reset_password_token=NULL, reset_password_expiry=NULL WHERE email=$2",
      [hashedPassword, decoded.email]
    );

    ctx.body = { message: "Password reset successful" };
  } catch (error) {
    logger.error(error);
    ctx.throw(400, "Could not reset password");
  }
};
