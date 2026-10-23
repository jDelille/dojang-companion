import { getPageMetadata } from "@/config/metadata";
import UiPaginationClient from "./uiPaginationClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Pagination");
};
export default function UiPagination() {
  return (
    <>
      <UiPaginationClient />
    </>
  );
}
