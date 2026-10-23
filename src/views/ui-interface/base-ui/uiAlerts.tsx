import { type ReactNode } from "react";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";
import {
  BadgeCheck,
  BadgeInfo,
  CopyCheck,
  Info,
  OctagonAlert,
  TriangleAlert,
} from "lucide-react";

const PREVIEW_BOX = "preview-content border-dashed border-primary border px-4.5 py-5 rounded-md";

type Alert = {
  key: string;
  className: string;
  text: string;
  icon?: ReactNode;
  /** Lucide name matching `icon`, used to render the code listing. */
  iconName?: string;
};

const BASIC_ALERTS: Alert[] = [
  { key: "primary", className: "bg-primary text-white", text: "This is a simple alert" },
  { key: "dark", className: "bg-dark text-white", text: "This is a simple alert" },
  { key: "warning", className: "bg-warning text-white", text: "This is a simple alert" },
  { key: "info", className: "bg-info text-white", text: "This is a simple alert" },
  { key: "success", className: "bg-success text-white", text: "This is a simple alert" },
  { key: "danger", className: "bg-danger text-white", text: "This is a simple alert" },
];

const GHOST_ALERTS: Alert[] = [
  {
    key: "primary",
    className: "bg-primary-transparent c-gold",
    text: "This is a simple primary alert",
  },
  {
    key: "light",
    className: "bg-gray-transparent text-dark dark:text-white",
    text: "This is a simple light alert",
  },
  {
    key: "warning",
    className: "bg-warning-transparent c-orange",
    text: "This is a simple warning alert",
  },
  { key: "info", className: "bg-info-transparent c-cyan", text: "This is a simple info alert" },
  {
    key: "success",
    className: "bg-success-transparent c-green",
    text: "This is a simple success alert",
  },
  { key: "danger", className: "bg-danger-transparent c-red", text: "This is a simple error  alert" },
];

const OUTLINE_ALERTS: Alert[] = [
  {
    key: "primary",
    className: "border border-primary c-gold",
    text: "This is a simple primary alert",
  },
  {
    key: "dark",
    className: "border border-[var(--border)] text-dark dark:text-white",
    text: "This is a simple dark alert",
  },
  {
    key: "warning",
    className: "border border-warning c-orange",
    text: "This is a simple warning alert",
  },
  { key: "info", className: "border border-info c-cyan", text: "This is a simple info alert" },
  {
    key: "success",
    className: "border border-success c-green",
    text: "This is a simple success alert",
  },
  {
    key: "danger",
    className: "border border-danger c-red",
    text: "This is a simple error  alert",
  },
];

const ICON_ALERTS: Alert[] = [
  {
    key: "primary",
    className: "bg-primary-transparent c-gold",
    text: "This is a primary alert",
    icon: <Info className="w-4 h-4 me-1" aria-hidden="true" />,
    iconName: "info",
  },
  {
    key: "light",
    className: "bg-gray-transparent text-dark dark:text-white",
    text: "This is a light alert",
    icon: <CopyCheck className="w-4 h-4 me-1" aria-hidden="true" />,
    iconName: "copy-check",
  },
  {
    key: "warning",
    className: "bg-warning-transparent c-orange",
    text: "This is a  warning alert",
    icon: <TriangleAlert className="w-4 h-4 me-1" aria-hidden="true" />,
    iconName: "triangle-alert",
  },
  {
    key: "info",
    className: "bg-info-transparent c-cyan",
    text: "This is a info alert",
    icon: <BadgeInfo className="w-4 h-4 me-1" aria-hidden="true" />,
    iconName: "badge-info",
  },
  {
    key: "success",
    className: "bg-success-transparent c-green",
    text: "This is a success alert",
    icon: <BadgeCheck className="w-4 h-4 me-1" aria-hidden="true" />,
    iconName: "badge-check",
  },
  {
    key: "danger",
    className: "bg-danger-transparent c-red",
    text: "This is a error alert",
    icon: <OctagonAlert className="w-4 h-4 me-1" aria-hidden="true" />,
    iconName: "octagon-alert",
  },
];

const PASSWORD_RULES = [
  "Your password must be at least 8 characters",
  "Your password must include at least one special Character",
];

/* The two list cards share a shape, so both listings come from one builder. */
const ruleAlertCode = (tone: "red" | "green", heading: string) =>
  [
    `<div class="p-4 bg-${tone === "red" ? "danger" : "success"}-transparent rounded-lg">`,
    `  <p class="c-${tone} flex items-center font-medium mb-2.5">`,
    '    <i data-lucide="octagon-alert" class="w-4 h-4 me-1"></i>',
    `    ${heading}`,
    "  </p>",
    "  <ul>",
    ...PASSWORD_RULES.map((rule) => `    <li class="c-${tone}">${rule}</li>`),
    "  </ul>",
    "</div>",
  ].join("\n");

const LIST_ALERT_CODE = ruleAlertCode("red", "There were 2 errors with your submission");
const ACTION_ALERT_CODE = ruleAlertCode("green", "There were 2 success with your submission");

/*
   Built from the same `alerts` the card renders, so the listing cannot drift
   from the preview above it. `iconName` is the lucide name for the `<i>` tag
   the template uses; the preview renders the matching React component.
*/
const alertsCode = (alerts: Alert[]) =>
  [
    `<div class="${PREVIEW_BOX.replace("preview-content ", "")}">`,
    ...alerts.map((alert, index) => {
      const className = `${alert.icon ? "flex items-center " : ""}p-4 font-medium ${
        alert.className
      } rounded-lg${index < alerts.length - 1 ? " mb-3" : ""}`;
      const icon = alert.iconName
        ? `<i data-lucide="${alert.iconName}" class="w-4 h-4 me-1"></i>`
        : "";
      return `  <div role="alert" class="${className}">${icon}${alert.text}</div>`;
    }),
    "</div>",
  ].join("\n");

const AlertList = ({ alerts }: { alerts: Alert[] }) => (
  <>
    {alerts.map((alert, index) => (
      <div
        key={alert.key}
        role="alert"
        className={`${alert.icon ? "flex items-center " : ""}p-4 font-medium ${
          alert.className
        } rounded-lg${index < alerts.length - 1 ? " mb-3" : ""}`}
      >
        {alert.icon}
        {alert.text}
      </div>
    ))}
  </>
);

const UiAlerts = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Alerts</h1>
      </div>

      {/* start grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-baseline">
        <PreviewCodeToggle
          title="Basic Alerts"
          contentClassName={PREVIEW_BOX}
          code={alertsCode(BASIC_ALERTS)}
        >
          <AlertList alerts={BASIC_ALERTS} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Ghost Alerts"
          contentClassName={PREVIEW_BOX}
          code={alertsCode(GHOST_ALERTS)}
        >
          <AlertList alerts={GHOST_ALERTS} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Outline Alerts"
          contentClassName={PREVIEW_BOX}
          code={alertsCode(OUTLINE_ALERTS)}
        >
          <AlertList alerts={OUTLINE_ALERTS} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Alerts with Icons"
          contentClassName={PREVIEW_BOX}
          code={alertsCode(ICON_ALERTS)}
        >
          <AlertList alerts={ICON_ALERTS} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Alert with List"
          contentClassName="preview-content p-4 bg-danger-transparent rounded-lg"
          code={LIST_ALERT_CODE}
        >
          <p className="c-red flex items-center font-medium mb-2.5">
            <OctagonAlert className="w-4 h-4 me-1" aria-hidden="true" /> There were 2 errors with
            your submission
          </p>
          <ul>
            {PASSWORD_RULES.map((rule) => (
              <li key={rule} className="c-red">
                {rule}
              </li>
            ))}
          </ul>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Alert with Actions"
          contentClassName="preview-content p-4 bg-success-transparent rounded-lg"
          code={ACTION_ALERT_CODE}
        >
          <p className="c-green flex items-center font-medium mb-2.5">
            <OctagonAlert className="w-4 h-4 me-1" aria-hidden="true" /> There were 2 success with
            your submission
          </p>
          <ul>
            {PASSWORD_RULES.map((rule) => (
              <li key={rule} className="c-green">
                {rule}
              </li>
            ))}
          </ul>
        </PreviewCodeToggle>
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiAlerts;
