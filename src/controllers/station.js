import { query } from "../db.js";

// Create a new station
export const createStation = async (ctx) => {
  try {
    const { name, zone, color_code, latitude, longitude } = ctx.request.body;
    const result = await query(
      "INSERT INTO stations (name, zone, color_code, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, zone, color_code, latitude, longitude]
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
    const stationId = parseInt(ctx.params.id);
    const { name, zone, color_code, latitude, longitude } = ctx.request.body;
    const result = await query(
      "UPDATE stations SET name=$1, zone=$2, color_code=$3, latitude=$4, longitude=$5, updated_at=NOW() WHERE station_id=$6 RETURNING *",
      [name, zone, color_code, latitude, longitude, stationId]
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
