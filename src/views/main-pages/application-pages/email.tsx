
import Link from "next/link";
import ImageWithBasePath from "../../../components/image-with-base-path";
import { all_routes } from "../../../routes/all_routes";

type NavItem = {
  label: string;
  icon: string;
  badge?: string;
  active?: boolean;
};

type LabelItem = {
  label: string;
  dot: string;
};

type EmailRow = {
  id: number;
  avatar: string;
  sender: string;
  count?: string;
  subject: string;
  preview: string;
  tag?: { label: string; className: string };
  time: string;
  starred?: boolean;
  checked?: boolean;
};

const mailNav: NavItem[] = [
  { label: "Inbox", icon: "ph-duotone ph-tray", badge: "6", active: true },
  { label: "Starred", icon: "ph-duotone ph-star" },
  { label: "Snoozed", icon: "ph-duotone ph-alarm" },
  { label: "Sent", icon: "ph-duotone ph-paper-plane-right" },
  { label: "Drafts", icon: "ph-duotone ph-note-pencil" },
  { label: "Important", icon: "ph-duotone ph-flag" },
  { label: "Chats", icon: "ph-duotone ph-chat-circle" },
  { label: "Scheduled", icon: "ph-duotone ph-clock" },
];

const otherNav: NavItem[] = [
  { label: "All Emails", icon: "ph-duotone ph-envelope" },
  { label: "Spam", icon: "ph-duotone ph-warning-octagon" },
  { label: "Trash", icon: "ph-duotone ph-trash" },
];

const labelNav: LabelItem[] = [
  { label: "Personal", dot: "bg-success" },
  { label: "Client", dot: "bg-orange" },
  { label: "Marketing", dot: "bg-info" },
  { label: "Office", dot: "bg-info" },
];

const toolbarMenu: string[] = ["Unread", "Mark All Read", "Spam", "Delete All"];

const emails: EmailRow[] = [
  {
    id: 1,
    avatar: "assets/img/avatars/avatar-04.jpg",
    sender: "Sarah, me",
    count: "(7)",
    subject: "[Reminder] Client Meeting at 3 PM Today",
    preview: "Hi John, just a quick reminder about our meeting with ABC Corp at 3 PM...",
    time: "6:15 PM",
  },
  {
    id: 2,
    avatar: "assets/img/avatars/avatar-05.jpg",
    sender: "Mike, team",
    count: "(5)",
    subject: "Submit Project Proposal",
    preview: "Hi Team, please ensure that your sections of the project proposal are sub...",
    time: "5:00 PM",
  },
  {
    id: 3,
    avatar: "assets/img/avatars/avatar-06.jpg",
    sender: "Anna",
    subject: "[Team Outing Next Friday]",
    preview: "Hello Everyone, we're planning a team outing next Friday. Please RSVP by...",
    tag: { label: "Marketing", className: "bg-warning" },
    time: "1:00 PM",
  },
  {
    id: 4,
    avatar: "assets/img/avatars/avatar-07.jpg",
    sender: "Tom",
    subject: "[Update] New Design Guidelines Available",
    preview: "Hi all, the new design guidelines have been finalized and are now available...",
    tag: { label: "Client", className: "bg-orange" },
    time: "10:30 AM",
    starred: true,
  },
  {
    id: 5,
    avatar: "assets/img/avatars/avatar-08.jpg",
    sender: "Lisa",
    subject: "[Event] Webinar on Social Media Strategy",
    preview: "Don't forget to register for our webinar covering advanced social media stra...",
    time: "09:45 AM",
  },
  {
    id: 6,
    avatar: "assets/img/avatars/avatar-09.jpg",
    sender: "Jason, me",
    count: "(9)",
    subject: "[Reminder] Sales Targets Review",
    preview: "Hey Team, please prepare your sales reports for the review meeting schedul...",
    time: "Yesterday",
    checked: true,
  },
  {
    id: 7,
    avatar: "assets/img/avatars/avatar-10.jpg",
    sender: "Emily",
    subject: "[Alert] System Maintenance Scheduled",
    preview: "Dear Team, please be aware that there will be system maintenance this Satu...",
    tag: { label: "Personal", className: "bg-pink" },
    time: "Yesterday",
  },
  {
    id: 8,
    avatar: "assets/img/avatars/avatar-01.jpg",
    sender: "Kevin",
    subject: "Expense Reports Due",
    preview: "Hi everyone, please submit all expense reports for Q3 by the end of this week...",
    time: "Yesterday",
  },
  {
    id: 9,
    avatar: "assets/img/avatars/avatar-04.jpg",
    sender: "Rachel",
    subject: "Beta Testing",
    preview: "Hi Team, your feedback on the latest beta release is crucial. Please complete...",
    time: "12 Jul",
  },
  {
    id: 10,
    avatar: "assets/img/avatars/avatar-05.jpg",
    sender: "David",
    subject: "[Reminder] Contract Renewals",
    preview: "Attention all, please ensure that all contract renewals are reviewed and...",
    time: "12 Jul",
  },
  {
    id: 11,
    avatar: "assets/img/avatars/avatar-06.jpg",
    sender: "Nina, me",
    count: "(9)",
    subject: "[Notice] Policy Changes",
    preview: "Hello Team, we have implemented some policy changes effective immediately...",
    time: "11 Jul",
  },
  {
    id: 12,
    avatar: "assets/img/avatars/avatar-07.jpg",
    sender: "Mark",
    subject: "[Action Needed] Inventory Assessment",
    preview: "Team, an inventory assessment is required before our next shipment. Please...",
    time: "11 Jul",
  },
];

const navLinkClass =
  "flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]";

const Email = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="c-text text-xl max-lg:text-lg font-bold mb-0">Email</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 w-full">
        {/* Sidebar */}
        <div className="xl:col-span-3">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4">
            <Link
              href={all_routes.emailCompose}
              className="btn w-full bg-primary text-white border border-primary inline-flex items-center justify-center gap-2 hover:bg-primary-hover hover:border-primary-hover cursor-pointer mb-4"
            >
              <i className="ph-duotone ph-diamond" /> Compose New
            </Link>

            <div className="mb-4 hs-accordion active">
              <div
                className="flex items-center justify-between hs-accordion-toggle"
                aria-expanded="true"
                aria-controls="accordion-one"
              >
                <p className="text-sm font-semibold text-title mb-0">Mail</p>
                <button type="button" className="text-default hover:c-gold cursor-pointer">
                  <i className="ph ph-caret-down" />
                </button>
              </div>
              <div
                id="accordion-one"
                className="overflow-hidden transition-all duration-300 hs-accordion-content space-y-1 pt-2"
              >
                {mailNav.map((item) =>
                  item.active ? (
                    <a
                      key={item.label}
                      href="#"
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-[var(--card2)] c-gold text-sm font-semibold border border-[var(--border)]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <i className={item.icon} /> {item.label}
                      </span>
                      <span className="size-5 rounded-full bg-danger text-white text-[10px] flex items-center justify-center">
                        {item.badge}
                      </span>
                    </a>
                  ) : (
                    <a key={item.label} href="#" className={navLinkClass}>
                      <i className={item.icon} /> {item.label}
                    </a>
                  )
                )}
              </div>
            </div>

            <div className="mb-4 pt-3 border-t border-[var(--border)] hs-accordion active">
              <div
                className="flex items-center justify-between hs-accordion-toggle"
                aria-expanded="true"
                aria-controls="accordion-two"
              >
                <p className="text-sm font-semibold text-title mb-0">Others</p>
                <button type="button" className="text-default hover:c-gold cursor-pointer">
                  <i className="ph ph-caret-down" />
                </button>
              </div>
              <div
                id="accordion-two"
                className="overflow-hidden transition-all duration-300 hs-accordion-content space-y-1 pt-2"
              >
                {otherNav.map((item) => (
                  <a key={item.label} href="#" className={navLinkClass}>
                    <i className={item.icon} /> {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] hs-accordion active">
              <div
                className="flex items-center justify-between hs-accordion-toggle"
                aria-expanded="true"
                aria-controls="accordion-three"
              >
                <p className="text-sm font-semibold text-title mb-0">Labels</p>
                <button type="button" className="text-default hover:c-gold cursor-pointer">
                  <i className="ph ph-caret-down" />
                </button>
              </div>
              <div
                id="accordion-three"
                className="overflow-hidden transition-all duration-300 hs-accordion-content space-y-1 pt-2"
              >
                {labelNav.map((item) => (
                  <a key={item.label} href="#" className={navLinkClass}>
                    <span className={`size-2 rounded-full ${item.dot}`} /> {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Email Table */}
        <div className="xl:col-span-9">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 ps-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    id="select-all"
                    className="size-4 rounded border-[var(--border)] c-gold focus:ring-0"
                  />
                </label>
                <button
                  type="button"
                  className="size-8 rounded-md border border-[var(--border)] bg-[var(--card)] inline-flex items-center justify-center hover:bg-[var(--surface)] cursor-pointer"
                >
                  <i className="ph-duotone ph-archive" />
                </button>
                <button
                  type="button"
                  className="size-8 rounded-md border border-[var(--border)] bg-[var(--card)] inline-flex items-center justify-center hover:bg-[var(--surface)] cursor-pointer"
                >
                  <i className="ph-duotone ph-trash" />
                </button>
                <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
                  <button
                    type="button"
                    className="hs-dropdown-toggle cursor-pointer btn-sm size-8 bg-[var(--card)] border border-[var(--border)] c-dim inline-flex items-center justify-center hover:bg-[var(--surface)] hover:c-text focus:bg-[var(--surface)] focus:border-light focus:c-text focus:outline-hidden"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    aria-label="Dropdown"
                  >
                    <i className="icon-ellipsis-vertical font-normal" />
                  </button>
                  <div
                    className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-50 bg-[var(--card)] border border-[var(--border)] shadow rounded-md mt-2 z-1"
                    role="menu"
                    aria-orientation="vertical"
                    tabIndex={-1}
                  >
                    <div className="p-2 space-y-1">
                      {toolbarMenu.map((item) => (
                        <a
                          key={item}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm c-text hover:bg-[var(--surface)] hover:c-text focus:outline-hidden focus:bg-[var(--card)]"
                          href="#"
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative max-w-xs">
                <i className="ph ph-magnifying-glass absolute right-2.5 top-1/2 -translate-y-1/2 text-default text-sm" />
                <input
                  type="text"
                  className="w-full px-3 pe-8 py-2 text-sm border border-[var(--border)] rounded-md bg-[var(--card)] focus:outline-none focus:ring-0"
                  placeholder="Search"
                />
              </div>
            </div>

            {/* Email list */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {emails.map((email) => (
                    <tr
                      key={email.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--surface)] cursor-pointer"
                    >
                      <td className="py-2.5 px-2 w-1">
                        <input
                          type="checkbox"
                          className="email-checkbox size-4 rounded border-[var(--border)] c-gold focus:ring-0 block"
                          defaultChecked={email.checked}
                        />
                      </td>
                      <td className="py-2.5 px-2 w-1">
                        <button
                          type="button"
                          className={`size-6 inline-flex items-center justify-center fav-icon cursor-pointer${
                            email.starred ? "" : " text-default"
                          }`}
                        >
                          <i className={email.starred ? "ph-fill ph-star c-orange" : "ph ph-star"} />
                        </button>
                      </td>
                      <td className="py-2.5 px-2 w-1">
                        <div className="size-7">
                          <ImageWithBasePath
                            src={email.avatar}
                            className="rounded-full border border-[var(--border)]"
                            alt="user"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-2 w-24">
                        <p className="text-sm font-semibold text-title truncate mb-0">
                          {email.sender}
                          {email.count && (
                            <span className="text-default font-normal"> {email.count}</span>
                          )}
                        </p>
                      </td>
                      <td className="py-2.5 px-2 max-w-40">
                        <p
                          className={`text-sm text-title truncate mb-0${
                            email.tag ? " flex items-center" : ""
                          }`}
                        >
                          <span className={email.tag ? "font-semibold shrink-0" : "font-semibold"}>
                            {email.subject}
                          </span>
                          {email.tag && (
                            <span
                              className={`text-[10px] ${email.tag.className} text-white px-1.5 py-0.5 rounded ms-1 shrink-0`}
                            >
                              {email.tag.label}
                            </span>
                          )}
                          <span
                            className={email.tag ? "text-default ms-1 truncate" : "text-default ms-1"}
                          >
                            {email.preview}
                          </span>
                        </p>
                      </td>
                      <td className="py-2.5 px-2 w-1 text-end whitespace-nowrap">
                        <p className="text-[11px] text-default mb-0">{email.time}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Email;
