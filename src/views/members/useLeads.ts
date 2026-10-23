import { useCallback, useMemo, useRef, useState } from "react";
import type {
  Lead,
  LeadInterest,
  LeadSource,
  LeadStage,
  LeadTemp,
  LeadView,
} from "../../types/leads";
import { LEADS, OWNERS, STAGES } from "../../utils/json/leadsData";

/*
   Leads page state — the React equivalent of the `state` object plus
   renderKpis()/matches() in tailwind/src/assets/js/leads.js.
*/

export type SourceFilter = "All" | LeadSource;
export type TempFilter = "All" | LeadTemp;

export type NewLeadInput = {
  name: string;
  phone: string;
  interest: LeadInterest;
  source: LeadSource;
  temp: LeadTemp;
};

export type EditLeadInput = {
  id: number;
  name: string;
  phone: string;
  email: string;
  interest: LeadInterest;
  source: LeadSource;
  temp: LeadTemp;
  owner: string;
};

export const stageMeta = (key: LeadStage) => STAGES.find((stage) => stage.key === key)!;

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [view, setView] = useState<LeadView>("board");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<SourceFilter>("All");
  const [temp, setTemp] = useState<TempFilter>("All");

  /* Continues past the highest seeded id. */
  const idSeq = useRef(LEADS.length);

  const kpis = useMemo(() => {
    const converted = leads.filter((lead) => lead.stage === "Converted").length;
    return {
      total: leads.length,
      // "Hot" excludes leads that already converted.
      hot: leads.filter((lead) => lead.temp === "Hot" && lead.stage !== "Converted").length,
      converted,
      rate: leads.length ? Math.round((converted / leads.length) * 100) : 0,
    };
  }, [leads]);

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.phone.includes(query) ||
        lead.interest.toLowerCase().includes(query);
      const matchesSource = source === "All" || lead.source === source;
      const matchesTemp = temp === "All" || lead.temp === temp;
      return matchesQuery && matchesSource && matchesTemp;
    });
  }, [leads, search, source, temp]);

  /** Filtered leads grouped per Kanban column, in STAGES order. */
  const byStage = useMemo(
    () =>
      STAGES.map((stage) => ({
        stage,
        items: visible.filter((lead) => lead.stage === stage.key),
      })),
    [visible],
  );

  /** Moving a lead re-stamps `when`, as every mutation in the template did. */
  const moveStage = useCallback((id: number, stage: LeadStage) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, stage, when: "Just now" } : lead)),
    );
  }, []);

  const addLead = useCallback((input: NewLeadInput) => {
    setLeads((prev) => {
      idSeq.current += 1;
      const created: Lead = {
        id: idSeq.current,
        name: input.name.trim(),
        phone: input.phone.trim() || "—",
        email: "—",
        interest: input.interest,
        source: input.source,
        temp: input.temp,
        stage: "New",
        owner: OWNERS[prev.length % OWNERS.length],
        when: "Just now",
      };
      return [created, ...prev];
    });
  }, []);

  const updateLead = useCallback((input: EditLeadInput) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === input.id
          ? {
              ...lead,
              name: input.name.trim() || lead.name,
              phone: input.phone.trim() || "—",
              email: input.email.trim() || "—",
              interest: input.interest,
              source: input.source,
              temp: input.temp,
              owner: input.owner,
              when: "Just now",
            }
          : lead,
      ),
    );
  }, []);

  const removeLead = useCallback((id: number) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }, []);

  return {
    leads,
    visible,
    byStage,
    view,
    setView,
    search,
    setSearch,
    source,
    setSource,
    temp,
    setTemp,
    kpis,
    moveStage,
    addLead,
    updateLead,
    removeLead,
  };
}

export default useLeads;
