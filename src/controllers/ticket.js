import { query } from "../db.js";

// Purchase a new ticket
export async function purchaseTicket(ctx) {
  try {
    const { user_id, start_date, end_date, zones, subscription_type } =
      ctx.request.body;
    const ticket = await query(
      "INSERT INTO tickets (user_id, start_date, end_date, zones, subscription_type, status) VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *",
      [user_id, start_date, end_date, zones, subscription_type]
    );
    ctx.response.status = 201;
    ctx.response.body = {
      message: "Ticket purchased successfully",
      ticket: ticket.rows[0],
    };
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
}

// View active ticket subscriptions for a user
export async function viewTicketSubscriptions(ctx) {
  try {
    const { user_id } = ctx.request.query;
    const tickets = await query(
      "SELECT * FROM tickets WHERE user_id = $1 AND status = 'active'",
      [user_id]
    );
    ctx.response.status = 200;
    ctx.response.body = { tickets: tickets.rows };
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
}

// View upcoming rides for a user
export async function viewUpcomingRides(ctx) {
  try {
    const { user_id } = ctx.request.query;
    const rides = await query(
      "SELECT * FROM rides WHERE user_id = $1 AND start_time > NOW() ORDER BY start_time ASC",
      [user_id]
    );
    ctx.response.status = 200;
    ctx.response.body = { rides: rides.rows };
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
}

// View completed rides for a user
export async function viewCompletedRides(ctx) {
  try {
    const { user_id } = ctx.request.query;
    const rides = await query(
      "SELECT * FROM rides WHERE user_id = $1 AND end_time < NOW() ORDER BY start_time DESC",
      [user_id]
    );
    ctx.response.status = 200;
    ctx.response.body = { rides: rides.rows };
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
}

// Refund a ticket
export async function refundTicket(ctx) {
  try {
    const { user_id, ticket_id } = ctx.request.body;
    const refundRequest = await query(
      "INSERT INTO refund_requests (user_id, ticket_id, status) VALUES ($1, $2, 'pending') RETURNING *",
      [user_id, ticket_id]
    );
    const ticket = await query(
      "UPDATE tickets SET status = 'refunded' WHERE ticket_id = $1 RETURNING *",
      [ticket_id]
    );
    ctx.response.status = 200;
    ctx.response.body = {
      message: "Refund request submitted successfully",
      refund_request: refundRequest.rows[0],
      refunded_ticket: ticket.rows[0],
    };
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
}

export async function checkPricing(ctx) {
  try {
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
}
