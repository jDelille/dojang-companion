import { useState } from "react";
import ImageWithBasePath from "../../../components/image-with-base-path";

type CallMenuItem = {
  icon: string;
  label: string;
};

const callMenuItems: CallMenuItem[] = [
  { icon: "icon-plus", label: "Add Participant" },
  { icon: "icon-octagon-pause", label: "Hold Call" },
  { icon: "icon-calendar-sync", label: "Transfer Call" },
  { icon: "icon-phone-off", label: "End Call" },
];

const controlButtonClass =
  "size-7 sm:size-10 rounded-full bg-[var(--surface)] c-text inline-flex items-center justify-center hover:bg-[var(--surface)]-hover cursor-pointer";

const VoiceCall = () => {
  // calls.js is not wired to this page in the template (script.html loads no
  // call script here). Only the mic/camera button states are tracked locally —
  // the call timer, WebRTC stubs and share-source flows are not ported.
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Voice Call</h1>
        <button
          type="button"
          className="btn-sm bg-[var(--surface)] text-white border border-dark inline-flex items-center gap-2 hover:bg-primary-hover hover:border-primary-hover cursor-pointer"
        >
          <i className="ph ph-plus" /> Add New
        </button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4 h-[calc(100vh-200px)]">
        {/* Caller bar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <ImageWithBasePath
              src="assets/img/avatars/avatar-04.jpg"
              className="size-10 rounded-full border border-[var(--border)] shrink-0"
              alt="user"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-title truncate mb-0">Edward Lietz</p>
              <p className="text-[11px] text-default mb-0">+22 555 345 11</p>
            </div>
          </div>
          <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
            <button
              type="button"
              className="hs-dropdown-toggle cursor-pointer btn-sm size-7 bg-[var(--card)] border border-[var(--border)] c-dim inline-flex items-center justify-center hover:bg-[var(--surface)] hover:border-light hover:c-text focus:bg-[var(--surface)] focus:border-light focus:c-text focus:outline-hidden"
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
                {callMenuItems.map((item) => (
                  <a
                    key={item.label}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm c-text hover:bg-[var(--surface)] hover:c-text focus:outline-hidden focus:bg-[var(--card)]"
                    href="#"
                  >
                    <i className={item.icon} /> {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Voice call canvas */}
        <div className="relative rounded-md overflow-hidden bg-[var(--surface)] flex items-center justify-center h-[calc(100vh-364px)]">
          <div className="size-40 sm:size-48 rounded-full bg-[var(--card)] border-2 border-white shadow-lg overflow-hidden">
            <ImageWithBasePath
              src="assets/img/avatars/avatar-04.jpg"
              className="size-full object-cover"
              alt="user"
            />
          </div>

          <span className="absolute left-1/2 -translate-x-1/2 bottom-3 bg-[var(--card)] border border-[var(--border)] c-text text-sm font-medium px-3 py-1 rounded-md shadow-sm">
            01:45
          </span>

          <div className="absolute bottom-3 right-3 size-10 sm:size-16 rounded-md overflow-hidden border-2 border-white shadow-md">
            <ImageWithBasePath
              src="assets/img/avatars/avatar-05.jpg"
              className="size-full object-cover"
              alt="user"
            />
          </div>
        </div>

        {/* Control bar */}
        <div className="border-t border-[var(--border)] pt-4 mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            className={controlButtonClass}
            aria-label="Mute"
            aria-pressed={muted}
            onClick={() => setMuted((v) => !v)}
          >
            <i className={muted ? "ph-duotone ph-microphone-slash" : "ph-duotone ph-microphone"} />
          </button>
          <button
            type="button"
            className={controlButtonClass}
            aria-label="Video"
            aria-pressed={cameraOff}
            onClick={() => setCameraOff((v) => !v)}
          >
            <i
              className={
                cameraOff ? "ph-duotone ph-video-camera-slash" : "ph-duotone ph-video-camera"
              }
            />
          </button>
          <button type="button" className={controlButtonClass} aria-label="Chat">
            <i className="ph-duotone ph-chat-circle" />
          </button>
          <button
            type="button"
            className="size-8 sm:size-11 rounded-full bg-danger text-white inline-flex items-center justify-center hover:bg-danger-hover cursor-pointer"
            aria-label="End call"
          >
            <i className="ph-fill ph-phone-slash" />
          </button>
          <button type="button" className={controlButtonClass} aria-label="Volume">
            <i className="ph-duotone ph-speaker-high" />
          </button>
          <button type="button" className={controlButtonClass} aria-label="Emoji">
            <i className="ph-duotone ph-smiley" />
          </button>
          <button type="button" className={controlButtonClass} aria-label="Screen share">
            <i className="ph-duotone ph-monitor-arrow-up" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCall;
