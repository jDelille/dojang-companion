"use client";

import { useEffect, useRef, useState } from "react";
import { explainHubError, newRequestKey } from "@/domain/hubAction";
import { isCreateLeadPayload, type CreateLeadPayload, type CreateLeadResult } from "@/domain/crmWrites";
import { createLead } from "@/integrations/crmWrites";
import { useStaffSessionReset } from "@/views/shell/staffSession";
import { useMarkSignedOut } from "@/views/shell/staffConnection";
import { Button } from "@/templates/roster/components/ui/button";
import { Field, Input } from "@/templates/roster/components/ui/form";
import { Modal } from "@/templates/roster/components/ui/overlay";

/*
   New lead (Sales), in Roster's New deal modal. Creates a real Odoo lead
   through the Hub's create_lead: name, contact, email, phone; the Hub starts it
   in the intake stage, unassigned. Owners and managers only.

   Like CrmWriteForm: an uncertain attempt keeps its exact payload and request
   key, so "Retry" resends the same request and the Hub can't create it twice.
*/

type Status = "editing" | "pending" | "uncertain" | "failed";

const EMPTY: CreateLeadPayload = { name: "", contact: "", email: "", phone: "" };

export default function NewLeadForm({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (result: CreateLeadResult) => void;
}) {
  const [form, setForm] = useState<CreateLeadPayload>(EMPTY);
  const [status, setStatus] = useState<Status>("editing");
  const [error, setError] = useState("");
  const frozen = useRef<{ key: string; payload: CreateLeadPayload } | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const resetSession = useStaffSessionReset();
  const markSignedOut = useMarkSignedOut();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const locked = status === "pending" || status === "uncertain";
  const trimmed: CreateLeadPayload = {
    name: form.name.trim(),
    contact: form.contact.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
  };
  const valid = isCreateLeadPayload(trimmed);
  const emailInvalid = trimmed.email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email);

  function close() {
    if (locked) return;
    setForm(EMPTY);
    setStatus("editing");
    setError("");
    onClose();
  }

  async function submit() {
    if (inFlight.current) return;
    if (!frozen.current && !valid) return;
    frozen.current ??= { key: newRequestKey(), payload: trimmed };
    const { key, payload } = frozen.current;
    inFlight.current = true;
    setStatus("pending");
    setError("");
    const answer = await createLead(payload, key);
    inFlight.current = false;
    if (!mounted.current) return;
    if (answer.outcome === "notConfirmed") {
      setStatus("uncertain");
      return;
    }
    frozen.current = null;
    if (answer.outcome === "failed") {
      if (answer.code === "SIGN_IN_REQUIRED" || answer.code === "UNAUTHENTICATED") {
        resetSession();
        markSignedOut();
      }
      setError(answer.code);
      setStatus("failed");
      return;
    }
    setForm(EMPTY);
    setStatus("editing");
    onCreated(answer.result);
  }

  function update(key: keyof CreateLeadPayload, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="New lead"
      description="Creates the lead in Odoo. It starts in the intake stage, unassigned. Nothing is sent to the contact."
      width="sm"
      onSubmit={() => void submit()}
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" disabled={locked} onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={status === "pending" || (!locked && !valid)}>
            {status === "pending" ? "Waiting for Odoo…" : status === "uncertain" ? "Retry the same request" : "Create lead"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Lead name" required>
          <Input
            value={form.name}
            maxLength={200}
            disabled={locked}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Maya Chen - kids karate"
          />
        </Field>
        <Field label="Contact name">
          <Input value={form.contact} maxLength={200} disabled={locked} onChange={(event) => update("contact", event.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" error={emailInvalid ? "Enter a valid email, or leave it empty." : undefined}>
            <Input type="email" value={form.email} maxLength={200} disabled={locked} onChange={(event) => update("email", event.target.value)} />
          </Field>
          <Field label="Phone">
            <Input type="tel" value={form.phone} maxLength={200} disabled={locked} onChange={(event) => update("phone", event.target.value)} />
          </Field>
        </div>
        {status === "uncertain" && (
          <p role="alert" className="text-xs">
            Odoo hasn&apos;t confirmed the result, so the lead may already exist. Retry the same request to get its
            result; it won&apos;t create a second lead.
          </p>
        )}
        {status === "failed" && (
          <p role="alert" className="text-xs text-[color:var(--color-alert)]">
            {explainHubError(error)} No lead was created.
          </p>
        )}
      </div>
    </Modal>
  );
}
