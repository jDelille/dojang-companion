/** Icon classes rendered as tiles; each tooltip shows the class itself. */
const lucideIcons: readonly string[] = [
  "icon icon-eye",
  "icon icon-house",
  "icon icon-user",
  "icon icon-users",
  "icon icon-search",
  "icon icon-settings",
  "icon icon-bell",
  "icon icon-lock",
  "icon icon-key",
  "icon icon-trash",
  "icon icon-square-pen",
  "icon icon-plus",
  "icon icon-minus",
  "icon icon-check",
  "icon icon-x",
  "icon icon-octagon-alert",
  "icon icon-info",
  "icon icon-hand-helping",
  "icon icon-download",
  "icon icon-upload",
  "icon icon-refresh-cw",
  "icon icon-log-in",
  "icon icon-log-out",
  "icon icon-mail",
  "icon icon-phone",
  "icon icon-calendar",
  "icon icon-clock",
  "icon icon-map-pin",
  "icon icon-heart",
  "icon icon-star",
  "icon icon-camera",
  "icon icon-image",
  "icon icon-file",
  "icon icon-folder",
  "icon icon-credit-card",
  "icon icon-shopping-cart",
  "icon icon-chart-bar",
  "icon icon-chart-pie",
  "icon icon-layout-grid",
  "icon icon-menu",
  "icon icon-chevron-left",
  "icon icon-chevron-right",
  "icon icon-arrow-left",
  "icon icon-arrow-right",
  "icon icon-share",
  "icon icon-copy",
  "icon icon-link",
  "icon icon-globe",
  "icon icon-wifi",
  "icon icon-sun",
  "icon icon-moon",
  "icon icon-cloud",
  "icon icon-cloud-rain",
  "icon icon-cloud-snow",
  "icon icon-wind",
  "icon icon-umbrella",
  "icon icon-thermometer",
  "icon icon-droplet",
  "icon icon-flame",
  "icon icon-zap",
  "icon icon-battery",
  "icon icon-battery-charging",
  "icon icon-cpu",
  "icon icon-hard-drive",
  "icon icon-monitor",
  "icon icon-smartphone",
  "icon icon-tablet",
  "icon icon-mouse",
  "icon icon-play",
  "icon icon-pause",
  "icon icon-square-pause",
  "icon icon-fast-forward",
  "icon icon-rewind",
  "icon icon-volume",
  "icon icon-volume-1",
  "icon icon-volume-2",
  "icon icon-volume-x",
  "icon icon-mic",
  "icon icon-mic-off",
  "icon icon-video",
  "icon icon-video-off",
  "icon icon-headphones",
  "icon icon-music",
  "icon icon-radio",
  "icon icon-film",
  "icon icon-tv",
];

const IconLucide = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Lucide Icon</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1">
        <div id="hs-tooltip" className="preview-card glass-card p-5">
          <div className="pb-5 mb-5 flex items-center xxl:gap-0 gap-3 justify-between flex-wrap border-b border-[var(--border)]">
            <div className="text-[17px] c-text font-bold">Lucide Icon</div>
          </div>

          <div className="flex flex-wrap gap-6">
            {lucideIcons.map((icon) => (
              <div
                key={icon}
                className="hs-tooltip-toggle hs-tooltip [--placement:top] w-12.5 h-12.5 flex items-center justify-center rounded-full bg-[var(--card)] border border-[var(--border)] text-[18px] hover:text-[22px] hover:text-primary"
              >
                <i className={icon} />
                <div
                  role="tooltip"
                  className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 invisible transition-opacity duration-300 absolute z-90 inline-block px-2 py-1 text-sm text-white bg-gray-900 rounded-lg shadow-sm"
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

export default IconLucide;
