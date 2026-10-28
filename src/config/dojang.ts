// Dojang product mode for the staff shell.
//
// The stock Dreams Gym navigation, header menus and demo pages stay in the code
// base (their routes still work when typed) but are hidden from the Dojang staff
// experience. Set NEXT_PUBLIC_SHOW_TEMPLATE_UI=true to show them again, e.g. to
// look up a template component.
export const SHOW_TEMPLATE_UI = process.env.NEXT_PUBLIC_SHOW_TEMPLATE_UI === "true";

// The Dojang staff pages: People (C02), Sales (C03/C04), Inbox (C05) and Front
// Desk, and everything under them. They get the Dojang shell (src/views/shell)
// and the Do For Me rail; every other page under (main) keeps the template's shell.
export const DOJANG_PATHS = ["/people", "/crm", "/inbox", "/front-desk"];

export const isDojangPage = (pathname: string) =>
  DOJANG_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
