import { getPageMetadata } from "@/config/metadata";
import AttendanceClient from "./attendanceClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Attendance");
};
export default function Attendance() {
  return (
    <>
      <AttendanceClient />
    </>
  );
}
