import { useState } from "react";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

const CARD =
  "preview-card bg-[var(--card)] rounded-md border border-[var(--border)] p-5";

const PANEL_TEXT =
  "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.";

const PANEL_BOX = "p-4 mt-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]";
const TRIGGER_BUTTON = "btn bg-primary text-white rounded-lg";

/*
   The listings show the template's `data-collapse` markup; the previews drive
   the same open/close from React state, since the React app does not load
   ui-preview.js.
*/
const COLLAPSE_CODE = [
  "<div>",
  '  <div class="flex flex-wrap items-center gap-2">',
  `    <a href="javascript:void(0)" class="${TRIGGER_BUTTON}" data-collapse-btn>`,
  "      Link with click",
  "    </a>",
  `    <button type="button" class="${TRIGGER_BUTTON}" data-collapse-btn>`,
  "      Button with click",
  "    </button>",
  "  </div>",
  '  <div class="overflow-hidden transition-all duration-300 max-h-0" data-collapse-box>',
  `    <div class="${PANEL_BOX}">`,
  `      ${PANEL_TEXT}`,
  "    </div>",
  "  </div>",
  "</div>",
].join("\n");

const COLLAPSE_HORIZONTAL_CODE = [
  "<div>",
  `  <button type="button" class="${TRIGGER_BUTTON}" data-collapse-btn>`,
  "    Toggle with collapse",
  "  </button>",
  '  <div class="overflow-hidden transition-all duration-300 w-0" data-collapse-box>',
  `    <div class="${PANEL_BOX} w-[350px]">`,
  `      ${PANEL_TEXT}`,
  "    </div>",
  "  </div>",
  "</div>",
].join("\n");

const MULTIPLE_TARGETS_CODE = [
  "<div>",
  '  <div class="flex flex-wrap items-center gap-2">',
  `    <button class="${TRIGGER_BUTTON}" data-collapse-target="#collapseOne">`,
  "      Toggle first element",
  "    </button>",
  `    <button class="${TRIGGER_BUTTON}" data-collapse-target="#collapseTwo">`,
  "      Toggle second element",
  "    </button>",
  `    <button class="${TRIGGER_BUTTON}" data-collapse-target="#collapseOne,#collapseTwo">`,
  "      Toggle both elements",
  "    </button>",
  "  </div>",
  '  <div class="lg:flex gap-3 block">',
  ...["collapseOne", "collapseTwo"].flatMap((id) => [
    `    <div id="${id}" class="overflow-hidden transition-all duration-300 max-h-0">`,
    `      <div class="${PANEL_BOX} mb-1">`,
    `        ${PANEL_TEXT}`,
    "      </div>",
    "    </div>",
  ]),
  "  </div>",
  "</div>",
].join("\n");

const UiCollapse = () => {
  const [verticalOpen, setVerticalOpen] = useState(false);
  const [horizontalOpen, setHorizontalOpen] = useState(false);
  const [firstOpen, setFirstOpen] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);

  const toggleBoth = () => {
    // "Toggle both" mirrors the template: if either is closed, open both.
    const shouldOpen = !(firstOpen && secondOpen);
    setFirstOpen(shouldOpen);
    setSecondOpen(shouldOpen);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Collapse</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-12 gap-6 items-baseline">
        <PreviewCodeToggle
          title="Collapse"
          cardShellClassName={`${CARD} sm:col-span-6 col-span-12`}
          contentClassName="preview-content"
          code={COLLAPSE_CODE}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={TRIGGER_BUTTON}
              aria-expanded={verticalOpen}
              onClick={() => setVerticalOpen((prev) => !prev)}
            >
              Link with click
            </button>
            <button
              type="button"
              className={TRIGGER_BUTTON}
              aria-expanded={verticalOpen}
              onClick={() => setVerticalOpen((prev) => !prev)}
            >
              Button with click
            </button>
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              verticalOpen ? "max-h-96" : "max-h-0"
            }`}
          >
            <div className={PANEL_BOX}>
              {PANEL_TEXT}
            </div>
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Collapse Horizontal"
          cardShellClassName={`${CARD} sm:col-span-6 col-span-12`}
          contentClassName="preview-content overflow-auto"
          code={COLLAPSE_HORIZONTAL_CODE}
        >
          <button
            type="button"
            className={TRIGGER_BUTTON}
            aria-expanded={horizontalOpen}
            onClick={() => setHorizontalOpen((prev) => !prev)}
          >
            Toggle with collapse
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              horizontalOpen ? "w-[350px]" : "w-0"
            }`}
          >
            <div className={`${PANEL_BOX} w-[350px]`}>
              {PANEL_TEXT}
            </div>
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Multiple Targets"
          cardShellClassName={`${CARD} col-span-12`}
          contentClassName="preview-content"
          code={MULTIPLE_TARGETS_CODE}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={TRIGGER_BUTTON}
              aria-expanded={firstOpen}
              onClick={() => setFirstOpen((prev) => !prev)}
            >
              Toggle first element
            </button>
            <button
              type="button"
              className={TRIGGER_BUTTON}
              aria-expanded={secondOpen}
              onClick={() => setSecondOpen((prev) => !prev)}
            >
              Toggle second element
            </button>
            <button
              type="button"
              className={TRIGGER_BUTTON}
              aria-expanded={firstOpen && secondOpen}
              onClick={toggleBoth}
            >
              Toggle both elements
            </button>
          </div>
          <div className="lg:flex gap-3 block mt-2">
            {[firstOpen, secondOpen].map((open, index) => (
              <div
                key={index === 0 ? "collapseOne" : "collapseTwo"}
                className={`overflow-hidden transition-all duration-300 ${
                  open ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className={`${PANEL_BOX} mb-1`}>
                  {PANEL_TEXT}
                </div>
              </div>
            ))}
          </div>
        </PreviewCodeToggle>
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiCollapse;
