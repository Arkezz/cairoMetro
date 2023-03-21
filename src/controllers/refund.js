import { query } from "../db.js";
import logger from "../modules/logger.js";

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
  const user_id = ctx.state.user.id; // user must be authenticated

  try {
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
  const admin_id = ctx.state.user.id; // admin must be authenticated

  try {
    // update refund request status in the database
    const result = await query(
      "UPDATE refund_requests SET approved=?, admin_id=? WHERE id=?",
      [approved, admin_id, id]
    );
    if (result.affectedRows === 0) {
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
