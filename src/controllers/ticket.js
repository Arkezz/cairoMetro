import { query } from "../db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "HangMeOhHangMe";

// Purchase a new ticket
export async function purchaseTicket(ctx) {
  try {
    const { user_id, start_date, end_date, zones, subscription_type } =
      ctx.request.body;
    const ticket = await query(
      "INSERT INTO tickets (user_id, start_date, end_date, zones, subscription_type, status) VALUES ($5, $7, $10, 'active') RETURNING *",
      [user_id, start_date, end_date, line_id, subscription_type]
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
    const token = ctx.request.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user_id = decoded.userId;
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
    const token = ctx.request.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user_id = decoded.userId;
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
    const token = ctx.request.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user_id = decoded.userId;
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
    const { ticket_id } = ctx.request.body;
    const token = ctx.request.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user_id = decoded.userId;
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
    const { origin, destination } = ctx.request.body;
    const numStations = calculateNumStations(origin, destination);
    let price;
    if (numStations <= 9) {
      price = 5;
    } else if (numStations <= 16) {
      price = 7;
    } else {
      price = 10;
    }
    ctx.response.status = 200;
    ctx.response.body = { price };
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
}

function calculateNumStations(origin, destination) {
  //query the database for the station_id of the origin and desintation then find their position on the line
  //then subtract the two positions to get the number of stations

  const start = query("SELECT station_id FROM stations WHERE name = $1", [
    origin,
  ]);
  const end = query("SELECT station_id FROM stations WHERE name = $1", [
    destination,
  ]);
  const line = query("SELECT line_id FROM stations WHERE name = $1", [origin]);
  const stations = query("SELECT * FROM stations WHERE line_id = $1", [
    line.rows[0].line_id,
  ]);
  const startStation = stations.rows.find(
    (station) => station.station_id === start.rows[0].station_id
  );
  const endStation = stations.rows.find(
    (station) => station.station_id === end.rows[0].station_id
  );
}
