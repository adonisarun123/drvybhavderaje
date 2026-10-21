import { revalidatePath } from "next/cache";
import { toActionError, ValidationError, type ActionResult } from "@/lib/errors";
import type { z } from "zod";

export async function run<T>(fn: () => Promise<T>, revalidate: string[] = ["/admin"]): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    for (const p of revalidate) revalidatePath(p, "layout");
    return { ok: true, data };
  } catch (e) {
    return toActionError(e);
  }
}

export function parseOrThrow<S extends z.ZodTypeAny>(schema: S, input: unknown): z.infer<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    throw new ValidationError("Please check the highlighted fields.", fieldErrors);
  }
  return parsed.data;
}

export function formToObject(fd: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [k, v] of fd.entries()) {
    const val = typeof v === "string" ? v : "";
    if (k in out) {
      const cur = out[k];
      out[k] = Array.isArray(cur) ? [...cur, val] : [cur as string, val];
    } else out[k] = val;
  }
  return out;
}
