import { useState } from "react";
import {
  BarChart2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  LayoutTemplate,
  MailOpen,
  MoreVertical,
  MousePointerClick,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import CommonSelect from "../../components/common-select/commonSelect";
import useToast from "../../hooks/useToast";
import type { Campaign } from "../../types/campaigns";
import {
  CAMPAIGN_STATUS_BADGE,
  CHANNEL_META,
  CHANNEL_OPTIONS,
} from "../../utils/json/campaignsData";
import { number } from "../../utils/formatUtils";
import CHANNEL_ICON from "./channelIcon";
import useCampaigns, {
  CAMPAIGN_TABS,
  percent,
  type CampaignTab,
  type ChannelFilter,
} from "./useCampaigns";
import CampaignDetailModal from "./modal/campaignDetailModal";
import CampaignFormModal from "./modal/campaignFormModal";
import CampaignScheduleModal from "./modal/campaignScheduleModal";
import CampaignSendModal from "./modal/campaignSendModal";
import CampaignDeleteModal from "./modal/campaignDeleteModal";
import CampaignExportModal from "./modal/campaignExportModal";

/*
   Campaigns — ported from tailwind/src/campaigns.html +
   assets/js/campaigns.js.

   The card's primary button and its overflow menu both vary by status, which
   the template rebuilt on every render; here both derive from the record.
*/

const CHANNEL_FILTER_OPTIONS = [
  { value: "All", label: "All Channels" },
  ...CHANNEL_OPTIONS.map((value) => ({ value, label: value })),
];

const TAB_ICON: Record<CampaignTab, typeof Clock | null> = {
  All: null,
  Sent: CheckCircle2,
  Scheduled: Clock,
  Draft: Pencil,
};

const Campaigns = () => {
  const {
    campaigns,
    visible,
    kpis,
    counts,
    tab,
    setTab,
    channel,
    setChannel,
    search,
    setSearch,
    funnelFor,
    setStatus,
    send,
    schedule,
    duplicate,
    removeCampaign,
    saveCampaign,
  } = useCampaigns();
  const { message, visible: toastVisible, showToast } = useToast();

  const [detail, setDetail] = useState<Campaign | null>(null);
  const [sendTarget, setSendTarget] = useState<Campaign | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const openForm = (campaign: Campaign | null) => {
    setEditing(campaign);
    setFormOpen(true);
  };

  const pause = (campaign: Campaign) => {
    setStatus(campaign.id, "Paused", "Paused");
    showToast(`${campaign.name} paused`);
  };
  const resume = (campaign: Campaign) => {
    setStatus(campaign.id, "Scheduled", "Scheduled");
    showToast(`${campaign.name} resumed`);
  };
  const duplicateOne = (campaign: Campaign) => {
    duplicate(campaign.id);
    showToast("Campaign duplicated as draft");
  };

  /** The card's leading action, which the template swapped by status. */
  const primaryButton = (campaign: Campaign) => {
    if (campaign.status === "Sent")
      return (
        <button
          type="button"
          className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
          onClick={() => setDetail(campaign)}
        >
          <BarChart2 className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          Report
        </button>
      );
    if (campaign.status === "Draft")
      return (
        <button
          type="button"
          className="btn-gold px-3 py-1.5 text-xs flex items-center gap-1.5"
          onClick={() => setSendTarget(campaign)}
        >
          <Send className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          Send Now
        </button>
      );
    if (campaign.status === "Scheduled")
      return (
        <button
          type="button"
          className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
          onClick={() => pause(campaign)}
        >
          <Pause className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          Pause
        </button>
      );
    return (
      <button
        type="button"
        className="btn-gold px-3 py-1.5 text-xs flex items-center gap-1.5"
        onClick={() => resume(campaign)}
      >
        <Play className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
        Resume
      </button>
    );
  };

  /* Menu contents depend on status, exactly as menuItems() decided. */
  const menuItemsFor = (campaign: Campaign) => (
    <>
      <button type="button" className="dropdown-item" onClick={() => setDetail(campaign)}>
        <BarChart2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Report
      </button>
      {campaign.status !== "Sent" && (
        <button type="button" className="dropdown-item" onClick={() => openForm(campaign)}>
          <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Edit
        </button>
      )}
      {(campaign.status === "Draft" || campaign.status === "Paused") && (
        <button
          type="button"
          className="dropdown-item"
          onClick={() => setSendTarget(campaign)}
        >
          <Send className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Send Now
        </button>
      )}
      {(campaign.status === "Draft" || campaign.status === "Scheduled") && (
        <button
          type="button"
          className="dropdown-item"
          onClick={() => setScheduleTarget(campaign)}
        >
          <CalendarClock className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          {campaign.status === "Scheduled" ? "Reschedule" : "Schedule"}
        </button>
      )}
      {campaign.status === "Scheduled" && (
        <button type="button" className="dropdown-item" onClick={() => pause(campaign)}>
          <Pause className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Pause
        </button>
      )}
      {campaign.status === "Paused" && (
        <button type="button" className="dropdown-item" onClick={() => resume(campaign)}>
          <Play className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Resume
        </button>
      )}
      <button type="button" className="dropdown-item" onClick={() => duplicateOne(campaign)}>
        <Copy className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Duplicate
      </button>
      <div className="menu-sep" />
      <button
        type="button"
        className="dropdown-item danger"
        onClick={() => setDeleteTarget(campaign)}
      >
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Campaigns</h2>
          <p className="text-sm mt-0.5 c-dim">
            Email &amp; SMS marketing to members &amp; leads · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Opening template library…")}
          >
            <LayoutTemplate className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Templates
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setExportOpen(true)}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => openForm(null)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            New Campaign
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Send className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {number(kpis.sent)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Messages Sent</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <MailOpen className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.openRate}%</div>
            <div className="text-xs font-medium mt-1 c-dim">Avg Open Rate</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <MousePointerClick
              className="w-[18px] h-[18px] c-gold shrink-0"
              aria-hidden="true"
            />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.clickRate}%</div>
            <div className="text-xs font-medium mt-1 c-dim">Avg Click Rate</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Target className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {number(kpis.conversions)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Conversions</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CAMPAIGN_TABS.map((name) => {
            const Icon = TAB_ICON[name];
            return (
              <button
                key={name}
                type="button"
                className={name === tab ? "ord-tab active" : "ord-tab"}
                onClick={() => setTab(name)}
              >
                {Icon && <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
                {name} <span className="cnt">{counts[name]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <CommonSelect
            className="w-auto"
            fieldClassName="py-2 text-sm"
            ariaLabel="Filter by channel"
            options={CHANNEL_FILTER_OPTIONS}
            value={channel}
            onChange={(option) => setChannel((option?.value as ChannelFilter) ?? "All")}
          />
          <div className="relative min-w-[170px]">
            <Search
              className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
              aria-hidden="true"
            />
            <input
              type="text"
              className="fp-input pl-9 py-2 text-sm"
              placeholder="Search campaign…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {visible.map((campaign) => {
          const meta = CHANNEL_META[campaign.channel];
          const Icon = CHANNEL_ICON[campaign.channel];
          const isSent = campaign.status === "Sent";
          return (
            <div key={campaign.id} className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className={`chan-ic ${meta.cls}`}>
                  <Icon
                    className={`w-[18px] h-[18px] ${meta.c} shrink-0`}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-bold c-text">{campaign.name}</span>
                    <span className={`badge ${CAMPAIGN_STATUS_BADGE[campaign.status]}`}>
                      <span className="dot" />
                      {campaign.status}
                    </span>
                    <span className="text-[10px] c-dim2 ml-auto">{campaign.when}</span>
                    <RowMenu
                      triggerTitle="More"
                      trigger={
                        <MoreVertical
                          className="w-[15px] h-[15px] shrink-0"
                          aria-hidden="true"
                        />
                      }
                    >
                      {menuItemsFor(campaign)}
                    </RowMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="seg-chip">
                      <Icon className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                      {campaign.channel}
                    </span>
                    <span className="seg-chip">
                      <Users className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                      {campaign.segment}
                    </span>
                    {isSent && (
                      <span className="seg-chip">
                        <Send className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                        {number(campaign.sent)} sent
                      </span>
                    )}
                  </div>
                  {isSent && (
                    <div className="grid grid-cols-4 gap-3 mt-3 pt-3 bd-t">
                      <div className="metric-mini">
                        <div className="v c-green">
                          {percent(campaign.opened, campaign.sent)}%
                        </div>
                        <div className="l">Opened</div>
                      </div>
                      <div className="metric-mini">
                        <div className="v c-cyan">
                          {percent(campaign.clicked, campaign.sent)}%
                        </div>
                        <div className="l">Clicked</div>
                      </div>
                      <div className="metric-mini">
                        <div className="v c-gold">{number(campaign.converted)}</div>
                        <div className="l">Converted</div>
                      </div>
                      <div className="metric-mini">
                        <div className="v c-text">
                          {percent(campaign.converted, campaign.sent)}%
                        </div>
                        <div className="l">Conv. Rate</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {primaryButton(campaign)}
                    <button
                      type="button"
                      className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
                      onClick={() => duplicateOne(campaign)}
                    >
                      <Copy className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                      Duplicate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {visible.length === 0 && (
        <div className="text-center py-16">
          <div className="text-[42px] opacity-30 mb-2">📣</div>
          <div className="text-sm font-bold c-text">No campaigns found</div>
          <div className="text-xs mt-1 c-dim">Try a different tab, channel, or search</div>
        </div>
      )}

      <CampaignDetailModal
        campaign={detail}
        funnel={detail ? funnelFor(detail) : []}
        onClose={() => setDetail(null)}
      />
      {/* Keyed so switching between new and edit reseeds the fields. */}
      <CampaignFormModal
        key={editing?.id ?? "new"}
        open={formOpen}
        campaign={editing}
        onClose={() => setFormOpen(false)}
        onSave={(input) => {
          const { status, size, editing: wasEditing } = saveCampaign(input);
          if (wasEditing) {
            showToast("Campaign updated");
          } else {
            showToast(
              status === "Sent"
                ? `Campaign sent to ${number(size)} recipients`
                : `Campaign ${status.toLowerCase()} saved`,
            );
          }
        }}
      />
      <CampaignScheduleModal
        key={scheduleTarget?.id ?? "schedule"}
        campaign={scheduleTarget}
        onClose={() => setScheduleTarget(null)}
        onSchedule={(campaign, label) => {
          schedule(campaign.id, label);
          setScheduleTarget(null);
          showToast(`${campaign.name} scheduled`);
        }}
      />
      <CampaignSendModal
        campaign={sendTarget}
        onClose={() => setSendTarget(null)}
        onSend={(campaign, size) => {
          send(campaign.id, size);
          setSendTarget(null);
          showToast(`${campaign.name} sent to ${number(size)} recipients!`);
        }}
      />
      <CampaignDeleteModal
        campaign={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(campaign) => {
          removeCampaign(campaign.id);
          setDeleteTarget(null);
          showToast(`${campaign.name} deleted`);
        }}
      />
      <CampaignExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={(format, scope) => {
          const count = scope === "all" ? campaigns.length : visible.length;
          showToast(`Exported ${count} campaigns as ${format}`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Campaigns;
