import { sql } from "drizzle-orm";
import type { Tx, Db } from "./db/client";

export async function nextEnquiryReference(tx: Tx | Db): Promise<string> {
  const res = await tx.execute(sql`SELECT nextval('enquiry_reference_seq') AS n`);
  const n = Number((res.rows[0] as { n: string | number }).n);
  return `ENQ-${new Date().getUTCFullYear()}-${String(n).padStart(5, "0")}`;
}

export async function nextAppointmentReference(tx: Tx | Db): Promise<string> {
  const res = await tx.execute(sql`SELECT nextval('appointment_reference_seq') AS n`);
  const n = Number((res.rows[0] as { n: string | number }).n);
  return `APT-${new Date().getUTCFullYear()}-${String(n).padStart(5, "0")}`;
}
