import { getPageMetadata } from "@/config/metadata";
import VoiceCallClient from "./voiceCallClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Voice Call");
};
export default function VoiceCall() {
  return (
    <>
      <VoiceCallClient />
    </>
  );
}
