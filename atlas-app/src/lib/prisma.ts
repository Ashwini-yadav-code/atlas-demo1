import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Prisma 7 connects through a driver adapter rather than a schema-level
// datasource URL. Swapping to Postgres for production is: install
// @prisma/adapter-pg, change `provider = "postgresql"` in schema.prisma,
// and replace this adapter with `new PrismaPg({ connectionString: ... })`
// — nothing else in the app touches the datasource.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL?.replace(/^file:/, "") ?? "./prisma/dev.db",
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
