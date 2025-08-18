const dotenv = require("dotenv");
const pkg = require("pg");

dotenv.config();
const { Pool } = pkg;

const db = new Pool({
  host: dotenv.PGHOST,
  port: dotenv.PGPORT,
  user: dotenv.PGUSER,
  password: dotenv.PGPASSWORD,
  database: dotenv.PGDATABASE,
});

module.exports = db;
