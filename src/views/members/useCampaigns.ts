import { useCallback, useMemo, useRef, useState } from "react";
import type {
  Campaign,
  CampaignChannel,
  CampaignSegment,
  CampaignStatus,
} from "../../types/campaigns";
import {
  AUDIENCE_SIZE,
  CAMPAIGNS,
  DELIVERED_RATE,
  SEND_RATES,
} from "../../utils/json/campaignsData";

/*
   Campaigns page state — the React equivalent of the `state` object plus
   renderKpis()/filtered() in tailwind/src/assets/js/campaigns.js.
*/

export type CampaignTab = "All" | "Sent" | "Scheduled" | "Draft";
export type ChannelFilter = "All" | CampaignChannel;

export const CAMPAIGN_TABS: CampaignTab[] = ["All", "Sent", "Scheduled", "Draft"];

/** Whole-number percentage, guarding divide-by-zero like the template's pct(). */
export const percent = (part: number, total: number): number =>
  total ? Math.round((part / total) * 100) : 0;

/** Reach of a segment; unlisted segments fall back to 500. */
export const audienceSize = (segment: CampaignSegment): number =>
  AUDIENCE_SIZE[segment] ?? 500;

export type CampaignFormInput = {
  id: number | null;
  name: string;
  channel: CampaignChannel;
  segment: CampaignSegment;
  subject: string;
  /** One of SEND_OPTIONS; decides the resulting status. */
  when: string;
};

/** Status implied by the form's "Send" choice. */
const statusFor = (when: string): CampaignStatus =>
  when === "Send now" ? "Sent" : when === "Schedule for later" ? "Scheduled" : "Draft";

/** The `when` label that goes with a freshly-saved campaign. */
const labelFor = (status: CampaignStatus): string =>
  status === "Sent" ? "Just now" : status === "Scheduled" ? "Scheduled" : "Draft";

/** Engagement numbers applied when a campaign goes out. */
const sendMetrics = (size: number) => ({
  sent: size,
  opened: Math.round(size * SEND_RATES.opened),
  clicked: Math.round(size * SEND_RATES.clicked),
  converted: Math.round(size * SEND_RATES.converted),
});

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [tab, setTab] = useState<CampaignTab>("All");
  const [channel, setChannel] = useState<ChannelFilter>("All");
  const [search, setSearch] = useState("");

  const idSeq = useRef(CAMPAIGNS.length);

  const kpis = useMemo(() => {
    const sentOnes = campaigns.filter((item) => item.status === "Sent");
    const totalSent = sentOnes.reduce((sum, item) => sum + item.sent, 0);
    return {
      sent: totalSent,
      openRate: percent(
        sentOnes.reduce((sum, item) => sum + item.opened, 0),
        totalSent,
      ),
      clickRate: percent(
        sentOnes.reduce((sum, item) => sum + item.clicked, 0),
        totalSent,
      ),
      conversions: sentOnes.reduce((sum, item) => sum + item.converted, 0),
    };
  }, [campaigns]);

  const counts = useMemo(() => {
    const base: Record<CampaignTab, number> = {
      All: campaigns.length,
      Sent: 0,
      Scheduled: 0,
      Draft: 0,
    };
    campaigns.forEach((item) => {
      // Paused has no tab of its own, so it is not counted here.
      if (item.status in base) base[item.status as CampaignTab] += 1;
    });
    return base;
  }, [campaigns]);

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return campaigns.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.segment.toLowerCase().includes(query);
      // Paused campaigns surface under the Scheduled tab.
      const matchesTab =
        tab === "All" ||
        item.status === tab ||
        (tab === "Scheduled" && item.status === "Paused");
      const matchesChannel = channel === "All" || item.channel === channel;
      return matchesQuery && matchesTab && matchesChannel;
    });
  }, [campaigns, search, tab, channel]);

  /** Five-step delivery funnel shown in the performance modal. */
  const funnelFor = useCallback((campaign: Campaign) => {
    const steps = [
      { label: "Sent", value: campaign.sent, cls: "fb-gold" },
      {
        label: "Delivered",
        value: Math.round(campaign.sent * DELIVERED_RATE),
        cls: "fb-cyan",
      },
      { label: "Opened", value: campaign.opened, cls: "fb-green" },
      { label: "Clicked", value: campaign.clicked, cls: "fb-indigo" },
      { label: "Converted", value: campaign.converted, cls: "fb-orange" },
    ];
    const max = campaign.sent || 1;
    return steps.map((step) => ({
      ...step,
      // Bars keep a 12% floor so a zero step is still legible.
      width: Math.max(12, Math.round((step.value / max) * 100)),
      pct: percent(step.value, campaign.sent),
    }));
  }, []);

  const setStatus = useCallback((id: number, status: CampaignStatus, when: string) => {
    setCampaigns((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, when } : item)),
    );
  }, []);

  const send = useCallback((id: number, size: number) => {
    setCampaigns((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "Sent", ...sendMetrics(size), when: "Just now" }
          : item,
      ),
    );
  }, []);

  const schedule = useCallback((id: number, label: string) => {
    setCampaigns((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Scheduled", when: label } : item,
      ),
    );
  }, []);

  /** A duplicate always lands as a fresh draft with no metrics. */
  const duplicate = useCallback((id: number) => {
    setCampaigns((prev) => {
      const source = prev.find((item) => item.id === id);
      if (!source) return prev;
      idSeq.current += 1;
      const copy: Campaign = {
        ...source,
        id: idSeq.current,
        name: `${source.name} (copy)`,
        status: "Draft",
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        when: "Draft",
      };
      return [copy, ...prev];
    });
  }, []);

  const removeCampaign = useCallback((id: number) => {
    setCampaigns((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /** Saves the new/edit form and reports what happened, for the toast. */
  const saveCampaign = useCallback((input: CampaignFormInput) => {
    const status = statusFor(input.when);
    const size = audienceSize(input.segment);

    setCampaigns((prev) => {
      if (input.id != null) {
        return prev.map((item) =>
          item.id === input.id
            ? {
                ...item,
                name: input.name.trim(),
                channel: input.channel,
                segment: input.segment,
                subject: input.subject.trim(),
                status,
                when: labelFor(status),
              }
            : item,
        );
      }
      idSeq.current += 1;
      const metrics =
        status === "Sent"
          ? sendMetrics(size)
          : { sent: 0, opened: 0, clicked: 0, converted: 0 };
      const created: Campaign = {
        id: idSeq.current,
        name: input.name.trim(),
        channel: input.channel,
        segment: input.segment,
        status,
        ...metrics,
        when: labelFor(status),
        subject: input.subject.trim(),
      };
      return [created, ...prev];
    });

    return { status, size, editing: input.id != null };
  }, []);

  return {
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
  };
}

export default useCampaigns;
