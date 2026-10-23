import { ChevronDown, ChevronLeft, ChevronRight, File } from "lucide-react";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

const GROUP_BUTTON =
  "btn inline-flex text-sm font-semibold first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--card2)] c-text hover:bg-dark hover:text-white dark:hover:text-white!";

const GROUP_ICON_BUTTON =
  "btn inline-flex items-center justify-center text-sm font-semibold first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--card2)] c-text hover:bg-dark hover:text-white dark:hover:text-white!";

const DROPDOWN_ITEM =
  "flex items-center px-4 py-1.75 rounded-lg c-text hover:c-gold hover:bg-[var(--card2)] focus:outline-hidden focus:bg-[var(--card)]";

const DROPDOWN_ACTIONS = ["Action", "Another Action", "Other Action", "Seperate Action"];

const COUNT_LABEL_BUTTON =
  "btn inline-flex items-center justify-center text-sm font-semibold first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--card2)] c-text";

const COUNT_VALUE_BUTTON =
  "btn text-sm font-semibold first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--card2)] c-text";

const DROPDOWN_LABEL_BUTTON =
  "btn inline-flex items-center justify-center text-sm font-semibold first:rounded-s-lg last:rounded-e-lg rounded-none c-text border border-[var(--border)] bg-[var(--card2)]";

const DROPDOWN_TOGGLE_BUTTON =
  "hs-dropdown-toggle cursor-pointer py-1.75 px-2 inline-flex items-center gap-x-2 text-sm font-normal first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--card2)] c-text focus:outline-hidden focus:white";

const DROPDOWN_MENU =
  "hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-50 bg-[var(--card)] border border-[var(--border)] shadow rounded-lg mt-2 z-1";

/*
   Listings are assembled from the same class constants the previews use, so a
   class edit updates both at once.
*/
const BASIC_CODE = [
  '<div class="inline-flex">',
  ...["one", "two", "three"].flatMap(() => [
    `  <button type="button" class="${GROUP_BUTTON}">`,
    "    Button",
    "  </button>",
  ]),
  "</div>",
].join("\n");

const ICONS_ONLY_CODE = [
  '<div class="inline-flex">',
  ...["chevron-left", "chevron-right"].flatMap((icon) => [
    `  <button type="button" class="${GROUP_ICON_BUTTON}">`,
    `    <i data-lucide="${icon}" class="w-4 h-4"></i>`,
    "  </button>",
  ]),
  "</div>",
].join("\n");

const WITH_COUNT_CODE = [
  '<div class="inline-flex">',
  `  <button type="button" class="${COUNT_LABEL_BUTTON}">`,
  '    <i data-lucide="file" class="w-4 h-4 me-1"></i> Invoices',
  "  </button>",
  `  <button type="button" class="${COUNT_VALUE_BUTTON}">`,
  "    10",
  "  </button>",
  "</div>",
].join("\n");

const WITH_DROPDOWN_CODE = [
  '<div class="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">',
  '  <div class="inline-flex">',
  `    <button type="button" class="${DROPDOWN_LABEL_BUTTON}">`,
  "      Save Changes",
  "    </button>",
  `    <button type="button" class="${DROPDOWN_TOGGLE_BUTTON}" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">`,
  '      <i data-lucide="chevron-down" class="size-4"></i>',
  "    </button>",
  "  </div>",
  `  <div class="${DROPDOWN_MENU}" role="menu" aria-orientation="vertical">`,
  '    <div class="p-2 space-y-1">',
  ...DROPDOWN_ACTIONS.map(
    (action, index) =>
      `      <a class="${index === 0 ? DROPDOWN_ITEM : `${DROPDOWN_ITEM} text-sm`}" href="#">${action}</a>`,
  ),
  "    </div>",
  "  </div>",
  "</div>",
].join("\n");

const UiButtonsGroup = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Buttons Group</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-baseline">
        <PreviewCodeToggle
          title="Basic"
          contentClassName="preview-content inline-flex"
          code={BASIC_CODE}
        >
          {["one", "two", "three"].map((key) => (
            <button key={key} type="button" className={GROUP_BUTTON}>
              Button
            </button>
          ))}
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Icons Only"
          contentClassName="preview-content inline-flex"
          code={ICONS_ONLY_CODE}
        >
          <button type="button" className={GROUP_ICON_BUTTON}>
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button type="button" className={GROUP_ICON_BUTTON}>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="With Count"
          contentClassName="preview-content inline-flex"
          code={WITH_COUNT_CODE}
        >
          <button type="button" className={COUNT_LABEL_BUTTON}>
            <File className="w-4 h-4 me-1" aria-hidden="true" /> Invoices
          </button>
          <button type="button" className={COUNT_VALUE_BUTTON}>
            10
          </button>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="With Dropdown"
          contentClassName="preview-content inline-flex"
          code={WITH_DROPDOWN_CODE}
        >
          <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
            <div className="inline-flex">
              <button type="button" className={DROPDOWN_LABEL_BUTTON}>
                Save Changes
              </button>
              <button
                type="button"
                className={DROPDOWN_TOGGLE_BUTTON}
                aria-haspopup="menu"
                aria-expanded="false"
                aria-label="Dropdown"
              >
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className={DROPDOWN_MENU} role="menu" aria-orientation="vertical">
              <div className="p-2 space-y-1">
                {DROPDOWN_ACTIONS.map((action, index) => (
                  <a
                    key={action}
                    className={index === 0 ? DROPDOWN_ITEM : `${DROPDOWN_ITEM} text-sm`}
                    href="#"
                  >
                    {action}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </PreviewCodeToggle>
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiButtonsGroup;
