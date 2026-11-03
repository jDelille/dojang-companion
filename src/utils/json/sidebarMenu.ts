import { all_routes } from "../../routes/all_routes";
import { SHOW_TEMPLATE_UI } from "../../config/dojang";

export type SidebarLeaf = {
  label: string;
  routeKey?: keyof typeof all_routes;
  activeRouteKeys?: (keyof typeof all_routes)[];
  /** Also selected on the route's sub-pages, e.g. People on /people/5001. */
  matchSubpaths?: boolean;
  externalUrl?: string;
  icon?: string;
  badge?: string;
  badgeClass?: string;
  permission?: string;
};

export type SidebarSubmenu = {
  label: string;
  icon?: string;
  permission?: string;
  children: (SidebarLeaf | SidebarSubmenu)[];
};

export type SidebarSection = {
  title: string;
  items: (SidebarLeaf | SidebarSubmenu)[];
};

/*
   The Dojang staff navigation: only the surfaces that exist. Today (C01) goes
   first in Workspace, in Jodi's order (implementation handoff, 9 Oct 2026).

   Also the Dojang shell's icon rail (src/views/shell/navRail.tsx).
*/
export const dojangMenu: SidebarSection[] = [
  {
    title: "Workspace",
    items: [
      { label: "Today", icon: "calendar-check", routeKey: "today" },
      { label: "People", icon: "users", routeKey: "people", matchSubpaths: true },
      { label: "Sales", icon: "trending-up", routeKey: "crm", matchSubpaths: true },
      { label: "Inbox", icon: "inbox", routeKey: "inbox", matchSubpaths: true },
    ],
  },
  {
    title: "Front desk",
    items: [
      // Arrivals + communications + CRM attention + quick actions (WhatsMax writeup)
      { label: "Front Desk", icon: "door-open", routeKey: "frontDesk" },
      // The kiosk link is hidden from the sidebar for now; /kiosk still opens it
    ],
  },
];

// The stock Dreams Gym navigation. Hidden unless SHOW_TEMPLATE_UI (src/config/dojang.ts).
const templateMenu: SidebarSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: "layout-dashboard", routeKey: "dashboard" },
      {
        label: "Point of Sale",
        icon: "shopping-cart",
        routeKey: "pos",
        badge: "POS",
        badgeClass: "nav-badge nb-gold",
      },
    ],
  },
  {
    title: "Applications",
    items: [
      {
        label: "Applications",
        icon: "layout-grid",
        children: [
          { label: "Chat", icon: "message-circle", routeKey: "chatApp" },
          {
            label: "Calls",
            icon: "phone",
            children: [
              { label: "Voice Call", icon: "phone-call", routeKey: "voiceCall" },
              { label: "Video Call", icon: "video", routeKey: "videoCall" },
            ],
          },
          { label: "Calendar", icon: "calendar", routeKey: "calendarApp" },
          { label: "Email", icon: "mail", routeKey: "email" },
          { label: "File Manager", icon: "folder", routeKey: "fileManager" },
          { label: "Notes", icon: "sticky-note", routeKey: "notes" },
          { label: "To Do", icon: "check-square", routeKey: "todo" },
          {
            label: "Workflow & Approvals",
            icon: "git-branch",
            routeKey: "workflowApprovals",
          },
          {
            label: "Workflow Requests",
            icon: "inbox",
            routeKey: "workflowRequests",
          },
          {
            label: "Workflow Actions",
            icon: "zap",
            routeKey: "workflowActions",
          },
          {
            label: "Approval Levels",
            icon: "layers",
            routeKey: "workflowApprovalLevels",
          },
        ],
      },
    ],
  },
  {
    title: "Layouts",
    items: [
      {
        label: "Layouts",
        icon: "cuboid",
        children: [
          {
            label: "Mini Sidebar",
            icon: "panel-left-close",
            routeKey: "layoutMini",
          },
          {
            label: "Hover View",
            icon: "panel-left-open",
            routeKey: "layoutHoverview",
          },
          {
            label: "Hidden Menu",
            icon: "panel-left",
            routeKey: "layoutHidden",
          },
          {
            label: "Full Width",
            icon: "maximize-2",
            routeKey: "layoutFullWidth",
          },
          { label: "RTL", icon: "align-right", routeKey: "layoutRtl" },
        ],
      },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Orders", icon: "receipt", routeKey: "orders" },
      {
        label: "Payments",
        icon: "credit-card",
        routeKey: "payments",
        badge: "3",
        badgeClass: "nav-badge nb-red",
      },
      { label: "Invoices", icon: "file-text", routeKey: "invoices" },
      { label: "Offers & Coupons", icon: "tag", routeKey: "offers" },
    ],
  },
  {
    title: "Members",
    items: [
      { label: "Leads & Enquiries", icon: "user-plus", routeKey: "leads" },
      {
        label: "Members",
        icon: "users",
        routeKey: "members",
        activeRouteKeys: ["memberProfile"],
      },
      { label: "Membership Plans", icon: "star", routeKey: "membershipPlans" },
      { label: "Renewals", icon: "refresh-cw", routeKey: "renewals" },
      { label: "Check-In", icon: "scan-line", routeKey: "checkin" },
      { label: "Day Passes", icon: "ticket", routeKey: "dayPasses" },
      { label: "Attendance", icon: "calendar-check", routeKey: "attendance" },
      { label: "Feedback", icon: "message-square", routeKey: "feedback" },
      { label: "Challenges", icon: "trophy", routeKey: "challenges" },
      { label: "Referrals", icon: "share-2", routeKey: "referrals" },
      { label: "Rewards", icon: "gift", routeKey: "rewards" },
      { label: "Campaigns", icon: "megaphone", routeKey: "campaigns" },
    ],
  },
  {
    title: "Fitness",
    items: [
      { label: "Class Schedule", icon: "dumbbell", routeKey: "classes" },
      {
        label: "Trainers",
        icon: "award",
        routeKey: "trainers",
        activeRouteKeys: ["trainerProfile"],
      },
      { label: "PT Sessions", icon: "calendar-check", routeKey: "ptSessions" },
      { label: "Workout Plans", icon: "zap", routeKey: "workouts" },
      { label: "Diet Plans", icon: "salad", routeKey: "diet" },
      {
        label: "Body Measurements",
        icon: "ruler",
        routeKey: "bodyMeasurements",
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      { label: "Products", icon: "package", routeKey: "products" },
      { label: "Inventory", icon: "boxes", routeKey: "inventory" },
      { label: "Suppliers", icon: "truck", routeKey: "suppliers" },
      { label: "Equipment", icon: "wrench", routeKey: "equipment" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Expenses", icon: "trending-down", routeKey: "expenses" },
      { label: "Payroll", icon: "banknote", routeKey: "payroll" },
      { label: "Reports", icon: "bar-chart-3", routeKey: "reports" },
      { label: "Analytics", icon: "trending-up", routeKey: "analytics" },
    ],
  },
  {
    title: "Facility",
    items: [
      { label: "Staff & Roster", icon: "id-card", routeKey: "staff" },
      { label: "Access Control", icon: "door-open", routeKey: "accessControl" },
      { label: "Locker Management", icon: "lock", routeKey: "lockers" },
      { label: "Branches", icon: "building-2", routeKey: "branches" },
      { label: "Calendar", icon: "calendar", routeKey: "facilityCalendar" },
      { label: "Chat", icon: "message-circle", routeKey: "facilityChat" },
      { label: "Announcements", icon: "megaphone", routeKey: "announcements" },
      { label: "Settings", icon: "settings", routeKey: "settings" },
    ],
  },
  {
    title: "UI Components",
    items: [
      {
        label: "Base UI",
        icon: "squares-unite",
        children: [
          { label: "Alerts", icon: "bell-ring", routeKey: "uiAlerts" },
          {
            label: "Accordion",
            icon: "chevrons-down-up",
            routeKey: "uiAccordion",
          },
          { label: "Avatar", icon: "circle-user", routeKey: "uiAvatar" },
          { label: "Badges", icon: "badge-check", routeKey: "uiBadges" },
          {
            label: "Buttons",
            icon: "square-mouse-pointer",
            routeKey: "uiButtons",
          },
          { label: "Button Group", icon: "group", routeKey: "uiButtonsGroup" },
          {
            label: "Breadcrumb",
            icon: "chevron-right",
            routeKey: "uiBreadcrumb",
          },
          { label: "Cards", icon: "square", routeKey: "uiCards" },
          { label: "Colors", icon: "palette", routeKey: "uiColors" },
          { label: "Collapse", icon: "fold-vertical", routeKey: "uiCollapse" },
          { label: "Dropdowns", icon: "chevron-down", routeKey: "uiDropdowns" },
          { label: "Grid", icon: "layout-grid", routeKey: "uiGrid" },
          { label: "Images", icon: "image", routeKey: "uiImages" },
          { label: "Modals", icon: "square-stack", routeKey: "uiModals" },
          { label: "Offcanvas", icon: "panel-right", routeKey: "uiOffcanvas" },
          { label: "Pagination", icon: "ellipsis", routeKey: "uiPagination" },
          {
            label: "Popovers",
            icon: "message-square-more",
            routeKey: "uiPopovers",
          },
          { label: "Progress", icon: "loader", routeKey: "uiProgress" },
          {
            label: "Tabs",
            icon: "rectangle-horizontal",
            routeKey: "uiNavTabs",
          },
          { label: "Typography", icon: "type", routeKey: "uiTypography" },
        ],
      },
      {
        label: "Advanced UI",
        icon: "sparkles",
        children: [
          { label: "Dragula", icon: "move", routeKey: "uiDragula" },
          { label: "Clipboard", icon: "clipboard", routeKey: "uiClipboard" },
          {
            label: "Range Slider",
            icon: "sliders-horizontal",
            routeKey: "uiRangeslider",
          },
          { label: "Lightbox", icon: "images", routeKey: "uiLightbox" },
        ],
      },
      {
        label: "Forms",
        icon: "square-pen",
        children: [
          {
            label: "Form Elements",
            icon: "text-cursor-input",
            routeKey: "formElements",
          },
          { label: "Select2", icon: "list-checks", routeKey: "formSelect2" },
          { label: "Form Editor", icon: "pen-line", routeKey: "formEditors" },
          {
            label: "Form Picker",
            icon: "calendar-days",
            routeKey: "formPickers",
          },
        ],
      },
      {
        label: "Tables",
        icon: "table",
        children: [
          { label: "Basic Tables", icon: "table", routeKey: "tablesBasic" },
          { label: "Data Table", icon: "table-2", routeKey: "dataTables" },
        ],
      },
      {
        label: "Charts",
        icon: "chart-pie",
        children: [
          { label: "Apex Charts", icon: "bar-chart-3", routeKey: "chartApex" },
          { label: "Chart Js", icon: "line-chart", routeKey: "chartJs" },
        ],
      },
      {
        label: "Icons",
        icon: "shapes",
        children: [
          {
            label: "Fontawesome Icons",
            icon: "flag",
            routeKey: "iconFontawesome",
          },
          { label: "Tabler Icons", icon: "hash", routeKey: "iconTabler" },
          { label: "Lucide", icon: "feather", routeKey: "iconLucide" },
          { label: "Phosphor", icon: "atom", routeKey: "iconPhosphor" },
        ],
      },
    ],
  },
];

// What the sidebar shows. The breadcrumbs and the header search are built from
// this too (routeMeta.ts), so hidden template pages don't appear in search either.
export const sidebarMenu: SidebarSection[] = SHOW_TEMPLATE_UI
  ? [...dojangMenu, ...templateMenu]
  : dojangMenu;
