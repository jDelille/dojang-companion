import type { AgentTurn } from "@/domain/companionAgent";

export default function AgentAnswerContent({ turn }: { turn: AgentTurn }) {
  return <>
    {turn.focus && <p className="mb-2 text-[10px] text-(--crm-muted)">
      {turn.focus.kind === "site" ? "Site-level answer · not specific to a lead, message or member"
        : `${turn.focus.kind === "member" ? "Member" : "Class"} #${turn.focus.id}`} · No actions executed
    </p>}
    {turn.text && <p className="leading-relaxed whitespace-pre-wrap text-(--crm-text-secondary)">{turn.text}</p>}
  </>;
}
