import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

let pool;

// In production, Render provides a DATABASE_URL connection string
// In development, we use individual env variables
if (process.env.DATABASE_URL) {
    pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
} else {
    pool = new pg.Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
    });
}

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ Error connecting to PostgreSQL:", err.message);
    } else {
        console.log("✅ Connected to PostgreSQL database");
        release();
    }
});

export default pool;
