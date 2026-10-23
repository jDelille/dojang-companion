import { getPageMetadata } from "@/config/metadata";
import ChatAppClient from "./chatAppClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Chat");
};
export default function ChatApp() {
  return (
    <>
      <ChatAppClient />
    </>
  );
}
