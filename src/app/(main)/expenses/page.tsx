import { getPageMetadata } from "@/config/metadata";
import ExpensesClient from "./expensesClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Expenses");
};
export default function Expenses() {
  return (
    <>
      <ExpensesClient />
    </>
  );
}
