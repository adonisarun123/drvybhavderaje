"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClinicAction, updateClinicAction } from "@/lib/actions/clinics";
import type { ActionResult } from "@/lib/errors";
import { ResultAlert } from "./ui";

export interface ClinicValues {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  addressLines: string;
  city: string;
  postcode: string;
  phone: string;
  email: string;
  mapsUrl: string;
  publicNotes: string;
  sortOrder: number;
  active: boolean;
}

export function ClinicForm({ initial, canEdit }: { initial?: ClinicValues; canEdit: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult<unknown> | null>(null);
  const [open, setOpen] = useState(!initial);
  if (!canEdit) return null;
  return (
    <div>
      {initial && (
        <button className="btn secondary sm" type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Close" : "Edit"}
        </button>
      )}
      {open && (
        <form
          className="form"
          style={{ marginTop: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => {
              const r = initial?.id ? await updateClinicAction(initial.id, fd) : await createClinicAction(fd);
              setResult(r);
              if (r.ok) {
                router.refresh();
                if (initial) setOpen(false);
              }
            });
          }}
        >
          <ResultAlert result={result} />
          {result?.ok && <div className="alert success">Saved.</div>}
          <div className="row">
            <label>
              Name
              <input name="name" required defaultValue={initial?.name ?? ""} />
            </label>
            <label>
              Slug (URL id)
              <input name="slug" required pattern="[a-z0-9-]{2,40}" defaultValue={initial?.slug ?? ""} />
            </label>
          </div>
          <div className="row">
            <label>
              Brand / hospital
              <input name="brand" defaultValue={initial?.brand ?? "Aesthetica Veda"} />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" defaultValue={initial?.phone ?? ""} />
            </label>
          </div>
          <label>
            Address
            <textarea name="addressLines" required defaultValue={initial?.addressLines ?? ""} />
          </label>
          <div className="row">
            <label>
              City
              <input name="city" required defaultValue={initial?.city ?? "Bengaluru"} />
            </label>
            <label>
              Postcode
              <input name="postcode" defaultValue={initial?.postcode ?? ""} />
            </label>
          </div>
          <div className="row">
            <label>
              Email (optional)
              <input name="email" type="email" defaultValue={initial?.email ?? ""} />
            </label>
            <label>
              Google Maps URL (optional — generated from the address if blank)
              <input name="mapsUrl" type="url" defaultValue={initial?.mapsUrl ?? ""} />
            </label>
          </div>
          <label>
            Public notes (optional)
            <input name="publicNotes" defaultValue={initial?.publicNotes ?? ""} />
          </label>
          <div className="row">
            <label>
              Sort order
              <input name="sortOrder" type="number" min={0} defaultValue={initial?.sortOrder ?? 0} />
            </label>
            <label className="check" style={{ alignSelf: "end" }}>
              <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} /> Active (shown publicly and bookable)
            </label>
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={pending}>
              {pending ? "Saving…" : initial ? "Save changes" : "Add clinic"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
