import { getPageMetadata } from "@/config/metadata";
import CalendarAppClient from "./calendarAppClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Calendar");
};
export default function CalendarApp() {
  return (
    <>
      <CalendarAppClient />
    </>
  );
}
