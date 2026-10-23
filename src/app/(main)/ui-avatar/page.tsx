import { getPageMetadata } from "@/config/metadata";
import UiAvatarClient from "./uiAvatarClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Avatar");
};
export default function UiAvatar() {
  return (
    <>
      <UiAvatarClient />
    </>
  );
}
