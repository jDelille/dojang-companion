import type { CrmContext, LeadEvidence } from '@/domain/lead';

// A display projection, not a second business model. Missing deal value,
// currency, createdAt and vendor contact identity are deliberately not invented.
export type RosterPipeline = {
  partial: boolean;
  // display: a group made up for leads whose stage isn't in the stage list; never a drop target
  stages: { id: string; name: string; color: null; display?: true }[];
  deals: {
    id: string;
    title: string;
    stageId: string;
    stageName: string;
    owner: string;
    source: string;
    tags: string[];
    evidence?: LeadEvidence;
    href: string;
    contact: { name: string; company: null } | null;
  }[];
};

export function toRosterPipeline(context: CrmContext): RosterPipeline {
  const stages: RosterPipeline['stages'] = context.stages.map((stage) => ({ ...stage, color: null }));
  const deals = context.leads.map((lead) => {
    // UI grouping only: never forwarded as an Odoo stage or a mutation payload.
    const stageId = lead.stageId ?? 'display:no-stage';
    if (!stages.some((stage) => stage.id === stageId)) {
      stages.push({ id: stageId, name: lead.stageId ? lead.stage || 'Stage not provided' : 'No stage assigned', color: null, display: true });
    }
    return {
      id: lead.id, title: lead.name, stageId, stageName: lead.stage,
      owner: lead.owner, source: lead.source, href: `/crm/leads/${encodeURIComponent(lead.id)}`,
      tags: lead.tags.map((tag) => tag.name), evidence: lead.evidence,
      contact: lead.contact ? { name: lead.contact, company: null } : null,
    };
  });
  return { stages, deals, partial: context.moreLeads };
}
