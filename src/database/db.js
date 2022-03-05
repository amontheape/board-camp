import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;

const connection = new Pool({
  connectionString: process.env.DB_URI,
});

export default connection;