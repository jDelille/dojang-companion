import { getPageMetadata } from "@/config/metadata";
import LockersClient from "./lockersClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Lockers");
};
export default function Lockers() {
  return (
    <>
      <LockersClient />
    </>
  );
}
