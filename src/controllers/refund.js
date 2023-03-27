import { query } from "../db.js";
import logger from "../modules/logger.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "HangMeOhHangMe";

export const viewRefundRequests = async (ctx) => {
  try {
    const refunds = await query("SELECT * FROM refund_requests");
    ctx.status = 200;
    ctx.body = refunds;
    logger.info(refunds);
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = "An error occurred while fetching refund requests.";
  }
};

export const uploadRefundRequest = async (ctx) => {
  const { ticket_id, reason } = ctx.request.body;

  try {
    const token = ctx.headers.authorization.split(" ")[1]; // extract token from authorization header
    const decoded = jwt.verify(token, JWT_SECRET); // verify token and get the decoded payload
    const user_id = decoded.userId; // get user ID from decoded payload

    // insert refund request into the database
    const result = await query(
      "INSERT INTO refund_requests (ticket_id, user_id, reason) VALUES (?, ?, ?)",
      [ticket_id, user_id, reason]
    );
    const newRefundRequestId = result.insertId;
    const newRefundRequest = {
      id: newRefundRequestId,
      ticket_id,
      user_id,
      reason,
    };
    ctx.status = 201;
    ctx.body = newRefundRequest;
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = "An error occurred while uploading refund request.";
  }
};

export const approveRefundRequest = async (ctx) => {
  const { id, approved } = ctx.request.body;

  try {
    const token = ctx.headers.authorization.split(" ")[1]; // extract token from authorization header
    const decoded = jwt.verify(token, JWT_SECRET); // verify token and get the decoded payload
    const admin_id = decoded.userId; // get user ID from decoded payload

    // Check if user has admin role
    const adminQuery = await query(
      "SELECT * FROM user_roles WHERE user_id=? AND role='admin'",
      [admin_id]
    );
    if (adminQuery.length === 0) {
      ctx.status = 401;
      ctx.body = "You do not have permission to approve refund requests.";
      return;
    }

    // update refund request status in the database
    const result = await query(
      "UPDATE refund_requests SET approved=?, admin_id=? WHERE id=?",
      [approved, admin_id, id]
    );
    if (result.changedRows === 0) {
      ctx.status = 404;
      ctx.body = `Refund request with id ${id} not found.`;
    } else {
      ctx.status = 200;
      ctx.body = `Refund request with id ${id} approved: ${approved}.`;
    }
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = "An error occurred while approving refund request.";
  }
};
