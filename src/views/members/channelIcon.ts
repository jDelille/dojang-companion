import { Bell, Mail, MessageCircle, MessageSquare } from "lucide-react";
import type { CampaignChannel } from "../../types/campaigns";

/*
   Campaign-channel icons as components — the React counterpart of the `icon`
   field in CHANNEL (assets/js/campaigns.js), which named a lucide glyph for
   the template's icons() pass to swap in.
*/
export const CHANNEL_ICON: Record<CampaignChannel, typeof Mail> = {
  Email: Mail,
  SMS: MessageSquare,
  WhatsApp: MessageCircle,
  Push: Bell,
};

export default CHANNEL_ICON;
