import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // We are hardcoding the URL here in the correct file to force the connection!
    url: "postgresql://neondb_owner:npg_Qbm60yqJrHoB@ep-tiny-dream-aira3ap9.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});