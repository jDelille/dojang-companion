import { getPageMetadata } from "@/config/metadata";
import TablesBasicClient from "./tablesBasicClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Tables Basic");
};
export default function TablesBasic() {
  return (
    <>
      <TablesBasicClient />
    </>
  );
}
