import { getPageMetadata } from "@/config/metadata";
import TodoClient from "./todoClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Todo");
};
export default function Todo() {
  return (
    <>
      <TodoClient />
    </>
  );
}
