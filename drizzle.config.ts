import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default {
  schema: "./db/schema/",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
    port: Number(process.env.DB_PORT) || 5432,
    ssl: true,
  },
} satisfies Config;
