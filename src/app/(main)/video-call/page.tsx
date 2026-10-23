import { getPageMetadata } from "@/config/metadata";
import VideoCallClient from "./videoCallClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Video Call");
};
export default function VideoCall() {
  return (
    <>
      <VideoCallClient />
    </>
  );
}
