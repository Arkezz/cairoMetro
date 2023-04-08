import pg from "pg";

// Replace with your own database connection details
const dbConfig = {
  user: "postgres",
  password: "25122003Wuzzy",
  host: "localhost",
  port: 3000,
  database: "postgres",
};

// Create a pool of database connections

const pool = new pg.Pool(dbConfig);

// Export a function for executing SQL queries
export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("executed query", { text, duration, rows: res.rowCount });
  return res;
};

//Query that deletes a user from the database by their ID
export const deleteUser = async (id) => {
  const res = await query("DELETE FROM users WHERE user_id = $1", [id]);
  return res;
};

// Handle errors in the database connection
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});
