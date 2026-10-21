"use client";

import { useActionState } from "react";
import { acceptInviteAction, setupAction, signInAction } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/errors";

function ErrorBox({ state }: { state: ActionResult | null }) {
  if (!state || state.ok) return null;
  return (
    <div className="alert error" role="alert">
      {state.message}
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInAction, null);
  return (
    <form action={action} className="form">
      <ErrorBox state={state} />
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}

export function SetupForm() {
  const [state, action, pending] = useActionState(setupAction, null);
  return (
    <form action={action} className="form">
      <ErrorBox state={state} />
      <label>
        Setup token
        <input name="token" type="password" autoComplete="off" required />
        <span className="help">The ADMIN_SETUP_TOKEN value from the server environment.</span>
      </label>
      <label>
        Your name
        <input name="name" required minLength={2} maxLength={80} />
      </label>
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="new-password" required minLength={10} />
        <span className="help">At least 10 characters.</span>
      </label>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create administrator"}
        </button>
      </div>
    </form>
  );
}

export function AcceptInviteForm({ token, name }: { token: string; name: string }) {
  const [state, action, pending] = useActionState(acceptInviteAction, null);
  return (
    <form action={action} className="form">
      <ErrorBox state={state} />
      <input type="hidden" name="token" value={token} />
      <label>
        Your name
        <input name="name" required defaultValue={name} minLength={2} maxLength={80} />
      </label>
      <label>
        Choose a password
        <input name="password" type="password" autoComplete="new-password" required minLength={10} />
        <span className="help">At least 10 characters.</span>
      </label>
      <label>
        Confirm password
        <input name="confirm" type="password" autoComplete="new-password" required minLength={10} />
      </label>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Creating account…" : "Create my account"}
        </button>
      </div>
    </form>
  );
}
