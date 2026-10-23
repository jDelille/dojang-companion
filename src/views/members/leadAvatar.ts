import { AVATAR_CLASSES } from "../../utils/formatUtils";

/*
   Leads pick an avatar colour by plain id modulo, not by hashing the id like
   the Sales pages do — `avatarFor = id => AV[id % AV.length]` in
   assets/js/leads.js. Kept separate so the colours match the template.
*/
export const leadAvatar = (id: number): string =>
  AVATAR_CLASSES[id % AVATAR_CLASSES.length];

export default leadAvatar;
