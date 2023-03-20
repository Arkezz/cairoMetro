import { query } from "../db.js";

export const viewSeniorRequests = async (ctx) => {};

// Upload a senior request
export const uploadSeniorRequest = async (ctx) => {
  try {
    const { userId, idImageUrl } = ctx.request.body;

    // Check if user already has a senior request
    const existingRequest = await query(
      "SELECT * FROM senior_requests WHERE user_id=$1",
      [userId]
    );
    if (existingRequest.rows.length > 0) {
      ctx.status = 400;
      ctx.body = {
        message: "You have already submitted a senior request.",
      };
      return;
    }

    // Insert senior request into the database
    const result = await query(
      "INSERT INTO senior_requests (user_id, status, id_image_url) VALUES ($1, $2, $3) RETURNING *",
      [userId, "pending", idImageUrl]
    );
    const seniorRequest = result.rows[0];

    ctx.status = 201;
    ctx.body = {
      message: "Senior request uploaded successfully.",
      seniorRequest,
    };
  } catch (err) {
    console.error(err);
    ctx.status = 500;
    ctx.body = {
      message: "An error occurred while uploading senior request.",
    };
  }
};

// Approve a senior request
export const approveSeniorRequest = async (ctx) => {
  try {
    const { seniorRequestId } = ctx.request.body;

    // Update senior request status to approved
    const result = await query(
      "UPDATE senior_requests SET status=$1 WHERE senior_request_id=$2 RETURNING *",
      ["approved", seniorRequestId]
    );
    const seniorRequest = result.rows[0];

    ctx.status = 200;
    ctx.body = {
      message: "Senior request approved successfully.",
      seniorRequest,
    };
  } catch (err) {
    console.error(err);
    ctx.status = 500;
    ctx.body = {
      message: "An error occurred while approving senior request.",
    };
  }
};
