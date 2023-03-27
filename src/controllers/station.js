import logger from "pino";
import { query } from "../db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "HangMeOhHangMe";

export const viewAllStations = async (ctx) => {
  try {
    const result = await query("SELECT * FROM stations");
    ctx.response.status = 200;
    ctx.body = result.rows;
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.body = "Internal server error";
  }
};

// Create a new station
export const createStation = async (ctx) => {
  try {
    const { name, line_id } = ctx.request.body;
    const result = await query(
      "INSERT INTO stations (name, line_id) VALUES ($1, $2) RETURNING *",
      [name, line_id]
    );
    ctx.response.status = 201;
    ctx.body = result.rows[0];
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.body = "Internal server error";
  }
};

// Update an existing station
export const updateStation = async (ctx) => {
  try {
    const stationId = parseInt(ctx.params.station_id); // Change "id" to "station_id"
    const { name, line_id } = ctx.request.body;
    const result = await query(
      "UPDATE stations SET name=$1, line_id=$2, updated_at=NOW() WHERE station_id=$3 RETURNING *",
      [name, line_id, stationId]
    );
    if (result.rows.length === 0) {
      ctx.response.status = 404;
      ctx.body = `Station with ID ${stationId} not found`;
    } else {
      ctx.response.status = 200;
      ctx.body = result.rows[0];
    }
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.body = "Internal server error";
  }
};

// Delete an existing station
export const deleteStation = async (ctx) => {
  try {
    const stationId = parseInt(ctx.params.id);
    const result = await query(
      "DELETE FROM stations WHERE station_id=$1 RETURNING *",
      [stationId]
    );
    if (result.rows.length === 0) {
      ctx.response.status = 404;
      ctx.body = `Station with ID ${stationId} not found`;
    } else {
      ctx.response.status = 204;
    }
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.body = "Internal server error";
  }
};
