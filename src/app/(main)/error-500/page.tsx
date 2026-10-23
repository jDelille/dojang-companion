import { getPageMetadata } from "@/config/metadata";
import Error500Client from "./error500Client";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("500 Server Error");
};
export default function Error500() {
  return (
    <>
      <Error500Client />
    </>
  );
}
