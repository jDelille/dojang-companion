import { getPageMetadata } from "@/config/metadata";
import AnnouncementsClient from "./announcementsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Announcements");
};
export default function Announcements() {
  return (
    <>
      <AnnouncementsClient />
    </>
  );
}
