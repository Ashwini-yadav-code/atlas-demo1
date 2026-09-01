import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Runs once before the whole test run. Business logic in stage.ts/otp.ts
 * queries Prisma directly rather than taking it as an injectable dependency
 * — mocking it would mean re-encoding the same query logic in a fake and
 * testing that fake, not the app. Instead: point DATABASE_URL at a
 * throwaway sqlite file and `prisma db push` the real schema onto it, so
 * tests run against a real (just empty and disposable) database.
 */
export default async function setup() {
  const dir = mkdtempSync(path.join(tmpdir(), "atlas-test-db-"));
  const dbPath = path.join(dir, "test.db");
  process.env.DATABASE_URL = `file:${dbPath}`;

  execSync("npx prisma db push --accept-data-loss", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env },
    stdio: "inherit",
  });

  return () => {
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  };
}
