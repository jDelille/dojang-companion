import { getPageMetadata } from "@/config/metadata";
import PayrollClient from "./payrollClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Payroll");
};
export default function Payroll() {
  return (
    <>
      <PayrollClient />
    </>
  );
}
