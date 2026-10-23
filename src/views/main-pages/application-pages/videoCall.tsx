import { useState } from "react";

type Participant = {
  name: string;
  tileClass: string;
  speaking?: boolean;
};

const participants: Participant[] = [
  { name: "Ethan Cooper", tileClass: "bg-gradient-to-br from-gray-200 to-gray-400" },
  {
    name: "Sophia Carter",
    tileClass: "bg-gradient-to-br from-purple to-purple-hover",
    speaking: true,
  },
  { name: "Daniel Brooks", tileClass: "bg-gradient-to-br from-gray-300 to-gray-500" },
  { name: "Emily Hayes", tileClass: "bg-gradient-to-br from-pink to-pink-hover" },
  { name: "Olivia Bennett", tileClass: "bg-gradient-to-br from-danger to-danger-hover" },
];

const controlButtonClass =
  "size-7 sm:size-10 rounded-full bg-[var(--surface)] c-text inline-flex items-center justify-center hover:bg-[var(--surface)]-hover cursor-pointer";

const VideoCall = () => {
  // calls.js is not loaded for this page in the template. Only the mic/camera
  // button states are tracked locally — the call timer, participants panel,
  // screen-share source picker and leave/rejoin overlays are not ported.
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Video Call</h1>
        <button
          type="button"
          className="btn-sm bg-[var(--surface)] text-white border border-dark inline-flex items-center gap-2 hover:bg-primary-hover hover:border-primary-hover cursor-pointer"
        >
          <i className="ph ph-plus" /> Add New
        </button>
      </div>

      {/* Main video call wrapper */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4 flex flex-col gap-4 sm:h-[calc(100vh-200px)]">
        {/* Main speaker tile */}
        <div className="relative rounded-md overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 aspect-video flex items-center justify-center sm:h-[calc(100vh-364px)] h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-warning-transparent via-orange-transparent to-warning-transparent" />
          <div className="relative size-32 sm:size-40 rounded-full bg-gradient-to-br from-warning to-orange flex items-center justify-center text-white">
            <i className="ph-duotone ph-user text-6xl sm:text-8xl" />
          </div>
          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-[var(--card)] c-text text-sm font-medium px-2 py-1 rounded-md shadow-sm">
              Rachael Thomas
            </span>
            <span className="bg-[var(--card)] c-text text-sm font-medium px-2 py-1 rounded-md shadow-sm">
              01:45
            </span>
          </div>
          {/* Top-right fullscreen */}
          <button
            type="button"
            className="absolute top-3 right-3 size-8 rounded-md bg-[var(--card)] c-text inline-flex items-center justify-center shadow-sm hover:bg-[var(--surface)] cursor-pointer"
            aria-label="Fullscreen"
          >
            <i className="ph ph-arrows-out" />
          </button>
        </div>

        {/* Participant strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 gap-3">
          {participants.map((participant) => (
            <div
              key={participant.name}
              className={`relative lg:aspect-4/2 aspect-[4/3] rounded-md overflow-hidden ${participant.tileClass} flex items-center justify-center`}
            >
              <i className="ph-duotone ph-user text-white text-5xl opacity-60" />
              {participant.speaking && (
                <span className="absolute top-2 left-2 size-6 rounded-full bg-[var(--card)]/90 flex items-center justify-center">
                  <i className="ph-fill ph-waveform text-purple" />
                </span>
              )}
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[var(--card)] c-text text-[11px] font-medium px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap">
                {participant.name}
              </span>
            </div>
          ))}
        </div>

        {/* Control bar */}
        <div className="border-t border-[var(--border)] pt-4 flex items-center justify-center gap-3">
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

export default VideoCall;
