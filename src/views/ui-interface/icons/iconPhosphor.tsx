/** Icon classes rendered as tiles; each tooltip shows the class itself. */
const phosphorIcons: readonly string[] = [
  "ph-duotone ph-house",
  "ph-duotone ph-user",
  "ph-duotone ph-users",
  "ph-duotone ph-magnifying-glass",
  "ph-duotone ph-gear",
  "ph-duotone ph-bell",
  "ph-duotone ph-lock",
  "ph-duotone ph-lock-open",
  "ph-duotone ph-trash",
  "ph-duotone ph-pencil",
  "ph-duotone ph-plus",
  "ph-duotone ph-minus",
  "ph-duotone ph-check",
  "ph-duotone ph-x",
  "ph-duotone ph-warning-circle",
  "ph-duotone ph-info",
  "ph-duotone ph-question",
  "ph-duotone ph-download",
  "ph-duotone ph-upload",
  "ph-duotone ph-eye",
  "ph-duotone ph-eye-slash",
  "ph-duotone ph-heart",
  "ph-duotone ph-star",
  "ph-duotone ph-bookmark",
  "ph-duotone ph-share-network",
  "ph-duotone ph-link",
  "ph-duotone ph-copy",
  "ph-duotone ph-paper-plane-tilt",
  "ph-duotone ph-chat-circle",
  "ph-duotone ph-chat-teardrop-text",
  "ph-duotone ph-chat-dots",
  "ph-duotone ph-envelope",
  "ph-duotone ph-phone",
  "ph-duotone ph-calendar",
  "ph-duotone ph-clock",
  "ph-duotone ph-map-pin",
  "ph-duotone ph-globe",
  "ph-duotone ph-play",
  "ph-duotone ph-pause",
  "ph-duotone ph-stop",
  "ph-duotone ph-skip-forward",
  "ph-duotone ph-skip-back",
  "ph-duotone ph-speaker-high",
  "ph-duotone ph-speaker-low",
  "ph-duotone ph-speaker-none",
  "ph-duotone ph-microphone",
  "ph-duotone ph-microphone-slash",
  "ph-duotone ph-camera",
  "ph-duotone ph-camera-slash",
  "ph-duotone ph-video-camera",
  "ph-duotone ph-video-camera-slash",
  "ph-duotone ph-music-notes",
  "ph-duotone ph-film-strip",
  "ph-duotone ph-television",
  "ph-duotone ph-folder",
  "ph-duotone ph-folder-open",
  "ph-duotone ph-file",
  "ph-duotone ph-file-text",
  "ph-duotone ph-file-pdf",
  "ph-duotone ph-file-doc",
  "ph-duotone ph-file-xls",
  "ph-duotone ph-file-ppt",
  "ph-duotone ph-archive",
  "ph-duotone ph-cloud",
  "ph-duotone ph-cloud-arrow-up",
  "ph-duotone ph-cloud-arrow-down",
  "ph-duotone ph-hard-drives",
  "ph-duotone ph-database",
  "ph-duotone ph-shield",
  "ph-duotone ph-shield-check",
];

const IconPhosphor = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Phosphor Icon</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1">
        <div id="hs-tooltip" className="preview-card glass-card p-5">
          <div className="pb-5 mb-5 flex items-center xxl:gap-0 gap-3 justify-between flex-wrap border-b border-[var(--border)]">
            <div className="text-[17px] c-text font-bold">Phosphor Icon</div>
          </div>

          <div className="flex flex-wrap gap-6">
            {phosphorIcons.map((icon) => (
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

export default IconPhosphor;
