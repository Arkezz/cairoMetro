import logger from "../modules/logger.js";
import { query } from "../db.js";

export const viewAllRoutes = async (ctx) => {
  try {
    const result = await query("SELECT * FROM routes");
    ctx.body = result.rows;
  } catch (error) {
    logger.error(`Error getting all routes: ${error}`);
    ctx.throw(500, "Unable to get routes");
  }
};

export const createRoute = async (ctx) => {
  const { name, start_station_id, end_station_id } = ctx.request.body;

  try {
    const result = await query(
      "INSERT INTO routes (name, start_station_id, end_station_id) VALUES ($1, $2, $3) RETURNING *",
      [name, start_station_id, end_station_id]
    );
    ctx.body = result.rows[0];
  } catch (error) {
    logger.error(`Error creating route: ${error}`);
    ctx.throw(500, "Unable to create route");
  }
};

export const updateRoute = async (ctx) => {
  const { id } = ctx.params;
  const { name, start_station_id, end_station_id } = ctx.request.body;

  try {
    const result = await query(
      "UPDATE routes SET name=$1, start_station_id=$2, end_station_id=$3 WHERE id=$4 RETURNING *",
      [name, start_station_id, end_station_id, id]
    );
    ctx.body = result.rows[0];
  } catch (error) {
    logger.error(`Error updating route: ${error}`);
    ctx.throw(500, "Unable to update route");
  }
};

export const deleteRoute = async (ctx) => {
  const { id } = ctx.params;

  try {
    const result = await query("DELETE FROM routes WHERE id=$1 RETURNING *", [
      id,
    ]);
    ctx.body = result.rows[0];
  } catch (error) {
    logger.error(`Error deleting route: ${error}`);
    ctx.throw(500, "Unable to delete route");
  }
};

export const updatePricingSchedule = async (ctx) => {
  const { id, pricing_schedule } = ctx.request.body;

  try {
    const result = await query(
      "UPDATE routes SET pricing_schedule=$1 WHERE id=$2 RETURNING *",
      [pricing_schedule, id]
    );
    ctx.body = result.rows[0];
  } catch (error) {
    logger.error(`Error updating pricing schedule for route: ${error}`);
    ctx.throw(500, "Unable to update pricing schedule for route");
  }
};
