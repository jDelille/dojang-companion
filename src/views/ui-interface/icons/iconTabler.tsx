import "../../../style/icons/@tabler/icons-webfont/tabler-icons.min.css";

/** Icon classes rendered as tiles; each tooltip shows the class itself. */
const tablerIcons: readonly string[] = [
  "ti ti-home",
  "ti ti-layout-dashboard",
  "ti ti-map-pin-check",
  "ti ti-message-2",
  "ti ti-user-circle",
  "ti ti-photo",
  "ti ti-file-description",
  "ti ti-chart-line",
  "ti ti-exchange",
  "ti ti-menu-2",
  "ti ti-settings-cog",
  "ti ti-activity",
  "ti ti-shopping-bag",
  "ti ti-brand-hipchat",
  "ti ti-bell",
  "ti ti-mail-cog",
  "ti ti-location",
  "ti ti-chart-pie",
  "ti ti-checkbox",
  "ti ti-checks",
  "ti ti-chevron-down",
  "ti ti-chevrons-right",
  "ti ti-cloud-download",
  "ti ti-database",
  "ti ti-device-analytics",
  "ti ti-discount",
  "ti ti-dots-vertical",
  "ti ti-download",
  "ti ti-trash",
  "ti ti-folder-open",
  "ti ti-calendar",
  "ti ti-calculator",
  "ti ti-clock",
  "ti ti-phone-call",
  "ti ti-video",
];

const IconTabler = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Tabler Icon</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1">
        <div id="hs-tooltip" className="preview-card glass-card p-5">
          <div className="pb-5 mb-5 flex items-center xxl:gap-0 gap-3 justify-between flex-wrap border-b border-[var(--border)]">
            <div className="text-[17px] c-text font-bold">Tabler Icon</div>
          </div>

          <div className="flex flex-wrap gap-6">
            {tablerIcons.map((icon) => (
              <div
                key={icon}
                className="hs-tooltip-toggle hs-tooltip [--placement:top] w-12.5 h-12.5 flex items-center justify-center rounded-full bg-[var(--card)] border border-[var(--border)] text-[18px] hover:text-[22px] hover:c-gold"
              >
                <i className={icon} />
                <div
                  role="tooltip"
                  className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 invisible transition-opacity duration-300 absolute z-90 inline-block px-2 py-1 text-sm text-white bg-gray-900  rounded-lg shadow-sm"
                >
                  {icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* End grid */}
    </div>
  );
};

export default IconTabler;
