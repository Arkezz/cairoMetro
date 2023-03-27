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

await query(
  `
  -- User table
CREATE TABLE users (
user_id SERIAL PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role VARCHAR(20) NOT NULL,
status VARCHAR(20) NOT NULL,
username VARCHAR(20) UNIQUE NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Line table
CREATE TABLE lines (
line_id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
color_code VARCHAR(20) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Station table
CREATE TABLE stations (
station_id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
line_id INTEGER REFERENCES lines(line_id) ON DELETE CASCADE,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Route table
CREATE TABLE routes (
route_id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Route_station table
CREATE TABLE route_stations (
route_station_id SERIAL PRIMARY KEY,
route_id INTEGER REFERENCES routes(route_id) ON DELETE CASCADE,
station_id INTEGER REFERENCES stations(station_id) ON DELETE CASCADE,
sequence_number INTEGER NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Pricing table
CREATE TABLE pricing (
pricing_id SERIAL PRIMARY KEY,
route_id INTEGER REFERENCES routes(route_id) ON DELETE CASCADE,
start_time TIMESTAMP NOT NULL,
end_time TIMESTAMP NOT NULL,
fare DECIMAL(8,2) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ticket table
CREATE TABLE tickets (
ticket_id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
start_date DATE NOT NULL,
end_date DATE NOT NULL,
line_id INTEGER REFERENCES lines(line_id) ON DELETE CASCADE,
color VARCHAR(20) NOT NULL,
subscription_type VARCHAR(20) NOT NULL,
status VARCHAR(20) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ride table
CREATE TABLE rides (
ride_id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
start_time TIMESTAMP NOT NULL,
end_time TIMESTAMP NOT NULL,
origin_station_id INTEGER REFERENCES stations(station_id) ON DELETE CASCADE,
destination_station_id INTEGER REFERENCES stations(station_id) ON DELETE CASCADE,
fare DECIMAL(8,2) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Senior_request table
CREATE TABLE senior_requests (
senior_request_id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
status VARCHAR(20) NOT NULL,
id_image_url VARCHAR(255) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Refund_request table
CREATE TABLE refund_requests (
refund_request_id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
ticket_id INTEGER REFERENCES tickets(ticket_id) ON DELETE CASCADE,
status VARCHAR(20) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
  `
);

// Handle errors in the database connection
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});
