import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { query } from "../db.js";
import logger from "../modules/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "HangMeOhHangMe";
const PASSWORD_LENGTH = 8; // Use environment variables for sensitive data

//function that handles all validations
function validateInput(ctx) {
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
}

// Register a new user
export const createUser = async (ctx) => {
  const { email, password, username } = ctx.request.body;

  validateInput(ctx);

  const hashedPassword = await bcrypt.hash(password, 10);

  logger.info("Registering user: " + email);

  try {
    const result = await query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (result.rows.length !== 0) {
      ctx.throw(409, "An account with that email or username already exists");
    }

    const insertResult = await query(
      "INSERT INTO users (email, password, username, role, status) VALUES ($1, $2, $3, 'user', 'active') RETURNING user_id",
      [email, hashedPassword, username]
    );
    const user = insertResult.rows[0];
    const token = jwt.sign({ userId: user.user_id }, JWT_SECRET);

    ctx.body = { token };
  } catch (error) {
    logger.error(error);
  }
};

// Login a user
export const authenticateUser = async (ctx) => {
  const { email, password } = ctx.request.body;

  validateInput(ctx);

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
  }
};

//Reset password
export const resetPassword = async (ctx) => {
  const { password, newPassword } = ctx.request.body;

  try {
    // Get user ID from token
    const token = ctx.request.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Query user info from database
    const result = await query("SELECT password FROM users WHERE user_id=$1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      ctx.throw(404, "User not found");
    }

    // Return user info
    const user = result.rows[0];

    logger.info(password + " " + user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Check if password is valid
    if (!isPasswordValid) {
      ctx.throw(401, "Invalid login credentials");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const insertResult = await query(
      "UPDATE users SET password = $1 WHERE user_id = $2",
      [hashedPassword, userId]
    );

    ctx.body = { message: "Password changed successfully" };
  } catch (error) {
    logger.error(error);
    ctx.throw(401, "Invalid login credentials");
  }
};

export const requestPasswordReset = async (ctx) => {};

export const emailPasswordReset = async (ctx) => {};

export const checkAdminRole = async (ctx, next) => {
  const token = ctx.request.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const userId = decoded.userId;

  //Check if the user has admin role
  const user = await query("SELECT * FROM users WHERE user_id=$1", [userId]);
  if (user.rows[0].role !== "admin") {
    ctx.response.status = 401;
    ctx.body = "Unauthorized";
    return;
  }

  // Add the admin_id to the context state
  ctx.state.admin_id = userId;

  await next();
};
