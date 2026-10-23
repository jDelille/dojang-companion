import { X } from "lucide-react";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/* This page's modals are Preline `hs-overlay` dialogs, not the template's
   `.modal-overlay`/`.modal-box` system that components/common/Modal.tsx
   implements — different DOM, different close affordance, and the triggers are
   `data-hs-overlay` rather than React state. Per the Preline rule the markup
   carries over verbatim; Preline is initialised globally by lazyRoute.tsx.

   All 17 dialogs share one shell and differ only in id, overlay/wrapper
   classes, body and footer, so they are rendered from typed data. */

type ModalTrigger = {
  target: string;
  label: string;
};

type ModalFooterButton = {
  label: string;
  variant: "ghost" | "primary";
  /** Set when the button opens or closes a dialog. */
  target?: string;
  /** True when the button opens `target` instead of dismissing this dialog. */
  opens?: boolean;
};

type ModalSpec = {
  id: string;
  overlayClassName: string;
  wrapperClassName: string;
  /** Only the full-screen dialog stretches its panel. */
  panelClassName?: string;
  bodyClassName?: string;
  paragraphs: string[];
  footer: ModalFooterButton[];
};

const TRIGGER_CLASS = "btn-sm text-white bg-primary inline-flex items-center";

const CLOSE_ICON_CLASS =
  "size-7 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-base hover:bg-danger hover:border-danger hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer";

const GHOST_BTN =
  "py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none";

const PRIMARY_BTN =
  "py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none";

const PANEL =
  "flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto";

const PANEL_FULL =
  "flex justify-between h-full flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto";

const OVERLAY =
  "hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none";

const OVERLAY_PADDED =
  "p-3 size-full hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none";

const OVERLAY_SCREEN =
  "size-full hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none";

const WRAP_LG = "sm:max-w-lg sm:w-full m-3 sm:mx-auto";

const LOREM = [
  "Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.",
  "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.",
  "Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.",
];

/** The scrolling demos repeat the placeholder to overflow the fixed-height body. */
const LOREM_LONG = [...LOREM, ...LOREM];

const closeAndSave = (id: string): ModalFooterButton[] => [
  { label: "Close", variant: "ghost", target: id },
  { label: "Save Changes", variant: "primary" },
];

const basicTrigger: ModalTrigger[] = [{ target: "standard-modal", label: "Launch Demo Modal" }];
const scrollTrigger: ModalTrigger[] = [{ target: "long-content", label: "Launch Demo Modal" }];
const toggleTrigger: ModalTrigger[] = [{ target: "btw-modal", label: "Launch Demo Modal" }];
const largeTrigger: ModalTrigger[] = [{ target: "large-modal", label: "Large Modal" }];
const mediumTrigger: ModalTrigger[] = [{ target: "medium-modal", label: "Medium Modal" }];
const smallTrigger: ModalTrigger[] = [{ target: "small-modal", label: "Small Modal" }];

const sizeTriggers: ModalTrigger[] = [
  { target: "full-screen", label: "Full screen" },
  { target: "sm-screen", label: "Full screen below sm" },
  { target: "md-screen", label: "Full screen below md" },
  { target: "lg-screen", label: "Full screen below lg" },
  { target: "xl-screen", label: "Full screen below xl" },
];

const directionTriggers: ModalTrigger[] = [
  { target: "center-modal", label: "Center Modal" },
  { target: "top-modal", label: "Top Modal" },
  { target: "bottom-modal", label: "Bottom Modal" },
  { target: "left-modal", label: "Left Modal" },
  { target: "right-modal", label: "Right Modal" },
];

const modals: ModalSpec[] = [
  {
    id: "standard-modal",
    overlayClassName: OVERLAY,
    wrapperClassName: WRAP_LG,
    paragraphs: LOREM,
    footer: closeAndSave("standard-modal"),
  },
  {
    id: "long-content",
    overlayClassName: OVERLAY,
    wrapperClassName: WRAP_LG,
    bodyClassName: "py-5 h-50 overflow-y-auto",
    paragraphs: LOREM_LONG,
    footer: closeAndSave("long-content"),
  },
  {
    id: "btw-modal",
    overlayClassName: OVERLAY,
    wrapperClassName: WRAP_LG,
    paragraphs: LOREM,
    footer: [
      { label: "Open Second Modal", variant: "primary", target: "btw-second-modal", opens: true },
    ],
  },
  {
    id: "btw-second-modal",
    overlayClassName: OVERLAY,
    wrapperClassName: WRAP_LG,
    bodyClassName: "py-5 h-50 overflow-y-auto",
    paragraphs: LOREM_LONG,
    footer: [{ label: "Back to first", variant: "primary", target: "btw-modal", opens: true }],
  },
  {
    id: "large-modal",
    overlayClassName: OVERLAY_PADDED,
    wrapperClassName: "w-full m-3 sm:mx-auto",
    paragraphs: LOREM,
    footer: closeAndSave("large-modal"),
  },
  {
    id: "medium-modal",
    overlayClassName: OVERLAY_PADDED,
    wrapperClassName: "md:max-w-xl m-3 md:mx-auto",
    paragraphs: LOREM,
    footer: closeAndSave("medium-modal"),
  },
  {
    id: "small-modal",
    overlayClassName: OVERLAY_PADDED,
    wrapperClassName: WRAP_LG,
    paragraphs: LOREM,
    footer: closeAndSave("small-modal"),
  },
  {
    id: "full-screen",
    overlayClassName: OVERLAY_SCREEN,
    wrapperClassName: "max-w-full max-h-full h-full",
    panelClassName: PANEL_FULL,
    paragraphs: LOREM,
    footer: closeAndSave("full-screen"),
  },
  {
    id: "sm-screen",
    overlayClassName: OVERLAY_SCREEN,
    wrapperClassName: "sm:max-w-lg sm:max-h-none sm:h-auto sm:mx-auto",
    paragraphs: LOREM,
    footer: closeAndSave("sm-screen"),
  },
  {
    id: "md-screen",
    overlayClassName: OVERLAY_SCREEN,
    wrapperClassName:
      "max-w-full max-h-full h-full md:hs-overlay-open:mt-10 md:mt-0 md:max-w-lg md:max-h-none md:h-auto md:mx-auto",
    paragraphs: LOREM,
    footer: closeAndSave("md-screen"),
  },
  {
    id: "lg-screen",
    overlayClassName: OVERLAY_SCREEN,
    wrapperClassName:
      "max-w-full max-h-full h-full lg:hs-overlay-open:mt-10 lg:mt-0 lg:max-w-lg lg:max-h-none lg:h-auto lg:mx-auto",
    paragraphs: LOREM,
    footer: closeAndSave("lg-screen"),
  },
  {
    id: "xl-screen",
    overlayClassName: OVERLAY_SCREEN,
    wrapperClassName:
      "max-w-full max-h-full h-full xl:hs-overlay-open:mt-10 xl:mt-0 xl:max-w-xl xl:max-h-none xl:h-auto xl:mx-auto",
    paragraphs: LOREM,
    footer: closeAndSave("xl-screen"),
  },
  {
    id: "center-modal",
    overlayClassName: OVERLAY,
    wrapperClassName: "min-h-screen flex items-center justify-center px-4",
    paragraphs: LOREM,
    footer: closeAndSave("center-modal"),
  },
  {
    id: "top-modal",
    overlayClassName: OVERLAY,
    wrapperClassName: "min-h-screen flex justify-center px-4",
    paragraphs: LOREM,
    footer: closeAndSave("top-modal"),
  },
  {
    id: "bottom-modal",
    overlayClassName: OVERLAY,
    wrapperClassName: "min-h-screen flex items-end px-4",
    paragraphs: LOREM,
    footer: closeAndSave("bottom-modal"),
  },
  {
    id: "left-modal",
    overlayClassName: OVERLAY,
    wrapperClassName: "min-h-screen flex items-center justify-start px-4",
    paragraphs: LOREM,
    footer: closeAndSave("left-modal"),
  },
  {
    id: "right-modal",
    overlayClassName: OVERLAY,
    wrapperClassName: "min-h-screen flex items-center justify-end px-4",
    paragraphs: LOREM,
    footer: closeAndSave("right-modal"),
  },
];

const ModalTriggers = ({ triggers }: { triggers: ModalTrigger[] }) => (
  <>
    {triggers.map((trigger) => (
      <button
        key={trigger.target}
        type="button"
        className={TRIGGER_CLASS}
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls={trigger.target}
        data-hs-overlay={`#${trigger.target}`}
      >
        {trigger.label}
      </button>
    ))}
  </>
);

const Modals = () => (
  <>
    {modals.map((modal) => (
      <div
        key={modal.id}
        id={modal.id}
        className={modal.overlayClassName}
        role="dialog"
        tabIndex={-1}
      >
        <div className={modal.wrapperClassName}>
          <div className={modal.panelClassName ?? PANEL}>
            <div className="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
              <h4>Modal Title</h4>
              <button
                type="button"
                className={CLOSE_ICON_CLASS}
                aria-label="Close"
                data-hs-overlay={`#${modal.id}`}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className={modal.bodyClassName ?? "py-5 overflow-y-auto"}>
              <p className="mt-1 text-gray-800 dark:text-neutral-400">
                {modal.paragraphs.join(" ")}
              </p>
            </div>
            <div className="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
              {modal.footer.map((button) => (
                <button
                  key={button.label}
                  type="button"
                  className={button.variant === "ghost" ? GHOST_BTN : PRIMARY_BTN}
                  {...(button.opens
                    ? {
                        "aria-haspopup": "dialog" as const,
                        "aria-expanded": false,
                        "aria-controls": button.target,
                      }
                    : {})}
                  {...(button.target ? { "data-hs-overlay": `#${button.target}` } : {})}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    ))}
  </>
);

const UiModals = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Modals</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-12 gap-6">
        <PreviewCodeToggle
          title="Basic Modal"
          cardClassName="sm:col-span-4 col-span-12"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
        <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="standard-modal" data-hs-overlay="#standard-modal">
        Launch Demo Modal
        </button>

        <div id="standard-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#standard-modal">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#standard-modal">
                            Close
                        </button>
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>`}
        >
          <ModalTriggers triggers={basicTrigger} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Scrolling Modal"
          cardClassName="sm:col-span-4 col-span-12"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
        <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="long-content" data-hs-overlay="#long-content">
        Scrolling Long Content
        </button>

        <div id="long-content" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#long-content">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 h-50 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#long-content">
                            Close
                        </button>
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>`}
        >
          <ModalTriggers triggers={scrollTrigger} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Toggle Between Modals"
          cardClassName="sm:col-span-4 col-span-12"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
        <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="btw-modal" data-hs-overlay="#btw-modal">
        Toggle Between Modals
        </button>

        <div id="btw-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#btw-modal">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none" aria-haspopup="dialog" aria-expanded="false" aria-controls="btw-second-modal" data-hs-overlay="#btw-second-modal">
                            Open Second Modal
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="btw-second-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#btw-second-modal">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 h-50 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none" aria-haspopup="dialog" aria-expanded="false" aria-controls="btw-modal" data-hs-overlay="#btw-modal">
                            Back to first
                        </button>
                    </div>
                </div>
            </div>
        </div>`}
        >
          <ModalTriggers triggers={toggleTrigger} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Large Modal"
          cardClassName="sm:col-span-4 col-span-12"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
        <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="large-modal" data-hs-overlay="#large-modal">
        Large Modal
        </button>

        <div id="large-modal" class="p-3 size-full hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="w-full m-3 sm:mx-auto">
                <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#large-modal">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#large-modal">
                            Close
                        </button>
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>`}
        >
          <ModalTriggers triggers={largeTrigger} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Medium Modal"
          cardClassName="sm:col-span-4 col-span-12"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
        <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="medium-modal" data-hs-overlay="#medium-modal">
        Medium Modal
        </button>

        <div id="medium-modal" class="p-3 size-full hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="md:max-w-xl m-3 md:mx-auto">
                <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#medium-modal">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#medium-modal">
                            Close
                        </button>
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>`}
        >
          <ModalTriggers triggers={mediumTrigger} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Small Modal"
          cardClassName="sm:col-span-4 col-span-12"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
        <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="small-modal" data-hs-overlay="#small-modal">
        Small Modal
        </button>

        <div id="small-modal" class="p-3 size-full hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#small-modal">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#small-modal">
                            Close
                        </button>
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>`}
        >
          <ModalTriggers triggers={smallTrigger} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Modal Screen Sizes"
          cardClassName="col-span-12"
          contentClassName="flex flex-wrap items-center gap-6"
          codeMaxHeightClassName="max-h-[450px]"
          code={`
        <div class="flex items-center gap-6">
            <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="full-screen" data-hs-overlay="#full-screen">
                Full screen
            </button>
            <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="sm-screen" data-hs-overlay="#sm-screen">
                Full screen below sm
            </button>
            <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="md-screen" data-hs-overlay="#md-screen">
                Full screen below md
            </button>
            <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="lg-screen" data-hs-overlay="#lg-screen">
                Full screen below lg
            </button>
            <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="xl-screen" data-hs-overlay="#xl-screen">
                Full screen below xl
            </button>
        </div>

        <div id="full-screen" class="size-full hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="max-w-full max-h-full h-full">
                <div class="flex justify-between h-full flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#full-screen">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            ......
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#full-screen">
                            Close
                        </button>
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="sm-screen" class="size-full hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="sm:max-w-lg sm:max-h-none sm:h-auto sm:mx-auto">
                <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#sm-screen">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            ......
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#sm-screen">
                            Close
                        </button>
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="md-screen" class="size-full hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="max-w-full max-h-full h-full md:hs-overlay-open:mt-10 md:mt-0 md:max-w-lg md:max-h-none md:h-auto md:mx-auto">
                <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#md-screen">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            ......
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#md-screen">
                            Close
                        </button>
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="lg-screen" class="size-full hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="max-w-full max-h-full h-full lg:hs-overlay-open:mt-10 lg:mt-0 lg:max-w-lg lg:max-h-none lg:h-auto lg:mx-auto">
                <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#lg-screen">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            ......
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#lg-screen">
                            Close
                        </button>
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="xl-screen" class="size-full hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="max-w-full max-h-full h-full xl:hs-overlay-open:mt-10 xl:mt-0 xl:max-w-xl xl:max-h-none xl:h-auto xl:mx-auto">
                <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                    <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                        <h4>Modal Title</h4>
                        <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#xl-screen">
                            <i data-lucide="x" class="size-4"></i>
                        </button>
                    </div>
                    <div class="py-5 overflow-y-auto">
                        <p class="mt-1 text-gray-800 dark:text-neutral-400">
                            ......
                        </p>
                    </div>
                    <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#xl-screen">
                            Close
                        </button>
                        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>`}
        >
          <ModalTriggers triggers={sizeTriggers} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Modal Directions"
          cardClassName="col-span-12"
          contentClassName="flex flex-wrap items-center gap-6"
          codeMaxHeightClassName="max-h-[450px]"
          code={`
        <div class="flex items-center gap-6">
            <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="center-modal" data-hs-overlay="#center-modal">
                Center Modal
            </button>
            <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="top-modal" data-hs-overlay="#top-modal">
                Top Modal
            </button>
            <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="bottom-modal" data-hs-overlay="#bottom-modal">
                Bottom Modal
            </button>
            <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="left-modal" data-hs-overlay="#left-modal">
                Left Modal
            </button>
            <button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="right-modal" data-hs-overlay="#right-modal">
                Right Modal
            </button>
        </div>

        <div id="center-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="min-h-screen flex items-center justify-center px-4">
                <div class="sm:max-w-lg sm:w-full sm:mx-auto">
                    <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                        <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                            <h4>Modal Title</h4>
                            <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#center-modal">
                                <i data-lucide="x" class="size-4"></i>
                            </button>
                        </div>
                        <div class="py-5 overflow-y-auto">
                            <p class="mt-1 text-gray-800 dark:text-neutral-400">
                                Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                                Praesent commodo cursus magna,  Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                            </p>
                        </div>
                        <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                            <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#center-modal">
                                Close
                            </button>
                            <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="top-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="min-h-screen flex justify-center px-4">
                <div class="sm:max-w-lg sm:w-full sm:mx-auto">
                    <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                        <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                            <h4>Modal Title</h4>
                            <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#top-modal">
                                <i data-lucide="x" class="size-4"></i>
                            </button>
                        </div>
                        <div class="py-5 overflow-y-auto">
                            <p class="mt-1 text-gray-800 dark:text-neutral-400">
                                Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                                Praesent commodo cursus magna,  Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                            </p>
                        </div>
                        <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                            <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#top-modal">
                                Close
                            </button>
                            <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="bottom-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="min-h-screen flex items-end px-4">
                <div class="sm:max-w-lg sm:w-full sm:mx-auto">
                    <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                        <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                            <h4>Modal Title</h4>
                            <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#bottom-modal">
                                <i data-lucide="x" class="size-4"></i>
                            </button>
                        </div>
                        <div class="py-5 overflow-y-auto">
                            <p class="mt-1 text-gray-800 dark:text-neutral-400">
                                Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                                Praesent commodo cursus magna,  Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                            </p>
                        </div>
                        <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                            <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#bottom-modal">
                                Close
                            </button>
                            <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="left-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="min-h-screen flex items-center justify-start px-4">
                <div class="sm:max-w-lg sm:w-full">
                    <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                        <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                            <h4>Modal Title</h4>
                            <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#left-modal">
                                <i data-lucide="x" class="size-4"></i>
                            </button>
                        </div>
                        <div class="py-5 overflow-y-auto">
                            <p class="mt-1 text-gray-800 dark:text-neutral-400">
                                Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                                Praesent commodo cursus magna,  Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                            </p>
                        </div>
                        <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                            <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#left-modal">
                                Close
                            </button>
                            <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="right-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1">
            <div class="min-h-screen flex items-center justify-end px-4">
                <div class="sm:max-w-lg sm:w-full">
                    <div class="flex flex-col bg-[var(--card)] border p-6 border-[var(--border)] rounded-lg pointer-events-auto">
                        <div class="flex justify-between items-center pb-5 border-b border-[var(--border)] dark:border-neutral-700">
                            <h4>Modal Title</h4>
                            <button type="button" class="size-9 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] c-text text-xl hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white focus:outline-hidden focus:bg-danger cursor-pointer" aria-label="Close" data-hs-overlay="#right-modal">
                                <i data-lucide="x" class="size-4"></i>
                            </button>
                        </div>
                        <div class="py-5 overflow-y-auto">
                            <p class="mt-1 text-gray-800 dark:text-neutral-400">
                                Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                                Praesent commodo cursus magna,  Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
                            </p>
                        </div>
                        <div class="flex justify-end items-center gap-x-2 pt-5 border-t border-[var(--border)]">
                            <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark shadow-2xs hover:bg-primary hover:text-white focus:outline-hidden focus:bg-primary disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#right-modal">
                                Close
                            </button>
                            <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`}
        >
          <ModalTriggers triggers={directionTriggers} />
        </PreviewCodeToggle>
        {/* end card */}
      </div>
      {/* End grid */}

      <Modals />
    </div>
  );
};

export default UiModals;
