import { getPageMetadata } from "@/config/metadata";
import Error403Client from "./error403Client";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("403 Forbidden");
};
export default function Error403() {
  return (
    <>
      <Error403Client />
    </>
  );
}
