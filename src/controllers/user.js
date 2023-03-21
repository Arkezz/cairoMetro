import logger from "../modules/logger.js";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "HangMeOhHangMe";
export const getUserInfo = async (ctx) => {
  try {
    // Get user ID from token
    const token = ctx.request.headers.authorization.split(" ")[1];
    console.log(token);
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Query user info from database
    const result = await query(
      "SELECT email, username, role, status FROM users WHERE user_id=$1",
      [userId]
    );

    if (result.rows.length === 0) {
      ctx.throw(404, "User not found");
    }

    // Return user info
    const user = result.rows[0];
    ctx.body = {
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
    };
  } catch (error) {
    logger.error(error);
    ctx.throw(401, "Unauthorized");
  }
};
