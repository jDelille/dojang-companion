"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizeLeads = organizeLeads;
const priorityOrder = { Now: 0, High: 1, Normal: 2, Low: 3 };
// Only recorded Hub evidence determines urgency. Missing evidence never means zero.
function organizeLeads(leads, filters) {
    const shown = leads.filter((lead) => {
        if (filters.owner && lead.owner !== filters.owner)
            return false;
        if (filters.tag && !lead.tags.some((tag) => tag.id === filters.tag))
            return false;
        if (filters.stage && lead.stageId !== filters.stage)
            return false;
        if (filters.source && lead.source !== filters.source)
            return false;
        if (filters.attention === "overdue" && !(lead.evidence && lead.evidence.overdueTasks > 0))
            return false;
        if (filters.attention === "today" && !(lead.evidence && lead.evidence.dueToday > 0))
            return false;
        if (filters.attention === "missing" && !(lead.evidence && lead.evidence.openTasks === 0 && lead.evidence.nextAction === "follow_up" && !["Won", "Lost"].includes(lead.evidence.journey) && !lead.lostReason))
            return false;
        return true;
    });
    if (filters.sort === "name")
        shown.sort((a, b) => a.name.localeCompare(b.name));
    if (filters.sort === "priority")
        shown.sort((a, b) => {
            const aRank = a.evidence ? priorityOrder[a.evidence.priority] : 4;
            const bRank = b.evidence ? priorityOrder[b.evidence.priority] : 4;
            return aRank - bRank || a.name.localeCompare(b.name);
        });
    return shown;
}
