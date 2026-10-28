// Who is using the staff shell and how it's connected: the CONTEXT layer of the
// WhatsMax writeup's screen grammar (site · role · connectivity). Built only from
// the Hub's context read (principal: { userId, name, role, siteId }).
//
//   signedIn     Odoo answered for this staff member on this site
//   signedOut    the Hub said nobody is signed in (never, signed out, or expired)
//   unavailable  Odoo or the connection isn't working; text says why
//   development  the development fixtures, not Odoo (DOJANG_HUB_ENABLED isn't set)

export type StaffConnection =
  | { state: "signedIn"; name: string; role: string; siteId: string }
  | { state: "signedOut" }
  | { state: "unavailable"; text: string }
  | { state: "development" };

// The Hub's grant roles ("owner", "manager", "instructor"…) as staff read them
export function roleLabel(role: string) {
  const words = role.replaceAll("_", " ").trim();
  return words ? words[0].toUpperCase() + words.slice(1) : "Staff";
}
