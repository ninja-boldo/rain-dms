import { config } from "dotenv";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

config({ path: "../.env" });

const dbUrl: string = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@postgres:5432/rain_dms`;
console.log("using this db url: ", dbUrl);
export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
