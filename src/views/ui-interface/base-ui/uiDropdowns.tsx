import { ChevronDown, Eye, PencilLine, Trash2 } from "lucide-react";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/* Preline markup carries over verbatim — hs-dropdown is initialised globally. */
const TOGGLE_CLASS =
  "hs-dropdown-toggle cursor-pointer py-1.75 px-4 inline-flex items-center gap-x-2 text-sm font-normal rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark dark:text-white hover:bg-[var(--card)] focus:outline-hidden focus:white";

const MENU_CLASS =
  "hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-50 bg-[var(--card)] border border-[var(--border)] shadow rounded-lg mt-2 z-1";

const ITEM_CLASS =
  "flex items-center px-4 py-1.75 rounded-lg text-sm c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]";

const ICON_ITEM_CLASS =
  "flex items-center px-4 py-1.75 rounded-lg text-sm text-default hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]";

const basicItems: string[] = ["Action", "Another Action", "Other Action", "Seperate Action"];

const dividerGroups: string[][] = [
  ["Action", "Another Action"],
  ["Action", "Another Action"],
  ["Action", "Another Action"],
];

const iconItems: { label: string; Icon: typeof Eye }[] = [
  { label: "View Details", Icon: Eye },
  { label: "Edit", Icon: PencilLine },
  { label: "Delete", Icon: Trash2 },
];

const headerGroups: string[][] = [["Profile", "Settings"], ["Sign out"]];

const DropdownToggle = () => (
  <button
    type="button"
    className={TOGGLE_CLASS}
    aria-haspopup="menu"
    aria-expanded="false"
    aria-label="Dropdown"
  >
    Dropdown
    <ChevronDown className="size-4" aria-hidden="true" />
  </button>
);

const UiDropdowns = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Dropdowns</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-12 gap-6">
        <PreviewCodeToggle
          title="Basic Dropdown"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="text-center"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="text-center">
	<div class="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
		<button type="button" class="hs-dropdown-toggle cursor-pointer py-1.75 px-2 inline-flex items-center gap-x-2 text-sm font-normal rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark dark:text-white hover:bg-[var(--card)] focus:outline-hidden focus:white" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
			Dropdown<i data-lucide="chevron-down" class="size-4"></i>
		</button>
		<div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-50 bg-[var(--card)] border border-[var(--border)] shadow rounded-lg mt-2 z-1" role="menu" aria-orientation="vertical">
			<div class="p-2 space-y-1">
				<a class="flex items-center px-4 py-1.75 rounded-lg c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Action
				</a>
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Another Action
				</a>
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Other Action
				</a>
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Seperate Action
				</a>
			</div>
		</div>
	</div>
</div>`}
        >
          <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
            <DropdownToggle />
            <div className={MENU_CLASS} role="menu" aria-orientation="vertical">
              <div className="p-2 space-y-1">
                {basicItems.map((item) => (
                  <a key={item} className={ITEM_CLASS} href="#">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Dropdown with Divider"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="text-center"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="text-center">
	<div class="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
		<button type="button" class="hs-dropdown-toggle cursor-pointer py-1.75 px-2 inline-flex items-center gap-x-2 text-sm font-normal rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark dark:text-white hover:bg-[var(--card)] focus:outline-hidden focus:white" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
			Dropdown<i data-lucide="chevron-down" class="size-4"></i>
		</button>
		<div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-50 bg-[var(--card)] border border-[var(--border)] shadow rounded-lg mt-2 z-1 divide-y divide-[var(--border)]" role="menu" aria-orientation="vertical">
			<div class="p-2 space-y-1">
				<a class="flex items-center px-4 py-1.75 rounded-lg c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Action
				</a>
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Another Action
				</a>
			</div>
			<div class="p-2 space-y-1">
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Action
				</a>
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Another Action
				</a>
			</div>
			<div class="p-2 space-y-1">
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Action
				</a>
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Another Action
				</a>
			</div>
		</div>
	</div>
</div>`}
        >
          <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
            <DropdownToggle />
            <div
              className={`${MENU_CLASS} divide-y divide-[var(--border)]`}
              role="menu"
              aria-orientation="vertical"
            >
              {dividerGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="p-2 space-y-1">
                  {group.map((item) => (
                    <a key={item} className={ITEM_CLASS} href="#">
                      {item}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Dropdown with Icons"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="text-center"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="text-center">
	<div class="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
		<button type="button" class="hs-dropdown-toggle cursor-pointer py-1.75 px-2 inline-flex items-center gap-x-2 text-sm font-normal rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark dark:text-white hover:bg-[var(--card)] focus:outline-hidden focus:white" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
			Dropdown<i data-lucide="chevron-down" class="size-4"></i>
		</button>
		<div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-50 bg-[var(--card)] border border-[var(--border)] shadow rounded-lg mt-2 z-1" role="menu" aria-orientation="vertical">
			<div class="p-2 space-y-1">
				<a class="flex items-center px-4 py-1.75 rounded-lg text-default hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					<i class="icon-eye c-text me-2"></i>View Details
				</a>
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm text-default hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					<i class="icon-pencil-line me-2"></i>Edit
				</a>
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm text-default hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					<i class="icon-trash-2 c-text me-2"></i>Delete
				</a>
			</div>
		</div>
	</div>
</div>`}
        >
          <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
            <DropdownToggle />
            <div className={MENU_CLASS} role="menu" aria-orientation="vertical">
              <div className="p-2 space-y-1">
                {iconItems.map(({ label, Icon }) => (
                  <a key={label} className={ICON_ITEM_CLASS} href="#">
                    <Icon className="size-4 me-2" aria-hidden="true" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Dropdown with Simple Header"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="text-center"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="text-center">
	<div class="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
		<button type="button" class="hs-dropdown-toggle cursor-pointer py-1.75 px-2 inline-flex items-center gap-x-2 text-sm font-normal rounded-lg border border-[var(--border)] bg-[var(--card)] text-dark dark:text-white hover:bg-[var(--card)] focus:outline-hidden focus:white" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
			Dropdown<i data-lucide="chevron-down" class="size-4"></i>
		</button>
		<div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-50 bg-[var(--card)] border border-[var(--border)] shadow rounded-lg mt-2 z-1 divide-y divide-[var(--border)]" role="menu" aria-orientation="vertical">
			<div class="py-3 px-6 text-start">
				<p class="mb-1">Signed as</p>
				<p class="font-semibold c-text">admin@example.com</p>
			</div>
			<div class="p-2 space-y-1">
				<a class="flex items-center px-4 py-1.75 rounded-lg c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Profile
				</a>
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Settings
				</a>
			</div>
			<div class="p-2 space-y-1">
				<a class="flex items-center px-4 py-1.75 rounded-lg text-sm c-text hover:bg-primary/8 hover:text-primary focus:outline-hidden focus:bg-[var(--card)]" href="#">
					Sign out
				</a>
			</div>
		</div>
	</div>
</div>`}
        >
          <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
            <DropdownToggle />
            <div
              className={`${MENU_CLASS} divide-y divide-[var(--border)]`}
              role="menu"
              aria-orientation="vertical"
            >
              <div className="py-3 px-6 text-start">
                <p className="mb-1">Signed as</p>
                <p className="font-semibold c-text">admin@example.com</p>
              </div>
              {headerGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="p-2 space-y-1">
                  {group.map((item) => (
                    <a key={item} className={ITEM_CLASS} href="#">
                      {item}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </PreviewCodeToggle>
        {/* end card */}
      </div>
      {/* end grid */}
    </div>
  );
};

export default UiDropdowns;
