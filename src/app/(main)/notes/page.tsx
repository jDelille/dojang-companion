import { getPageMetadata } from "@/config/metadata";
import NotesClient from "./notesClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Notes");
};
export default function Notes() {
  return (
    <>
      <NotesClient />
    </>
  );
}
