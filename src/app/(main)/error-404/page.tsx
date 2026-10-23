import { getPageMetadata } from "@/config/metadata";
import Error404Client from "./error404Client";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("404 Not Found");
};
export default function Error404() {
  return (
    <>
      <Error404Client />
    </>
  );
}
