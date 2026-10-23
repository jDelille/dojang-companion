import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/* Preline `hs-tab` markup carries over verbatim — Preline is initialised
   globally, so the active panel is driven by data-hs-tab, not React state.

   Every demo is the same three-tab strip over three panels; only the nav
   layout, the button classes and the id offset change, so one component
   renders them all from typed data. */

type TabGroup = {
  /** First numeric id in the group; ids run `tab-N` / panels `tab-0N`. */
  startId: number;
  navClassName: string;
  buttonClassName: string;
  labels: string[];
  bodies: string[];
};

const SHORT_BODIES = [
  "This is the item's tab 1 body.",
  "This is the item's tab 2 body.",
  "This is the item's tab 3 body.",
];

const LONG_BODIES = [
  "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything.",
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries.",
  "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur.",
];

const TAB_LABELS = ["Home", "Profile", "Messages"];
const VERTICAL_LABELS = ["Home", "Profile", "About"];

const NAV_WRAP = "flex flex-wrap gap-2";
const NAV_BETWEEN = "flex justify-between gap-x-1";
const NAV_WRAP_BETWEEN = "flex flex-wrap justify-between gap-2";
const NAV_COLUMN = "flex flex-col";

const TOP_LINE_BTN =
  "py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-t-2 border-transparent whitespace-nowrap hover:text-primary hover:border-t-prim focus:outline-hidden focus:c-gold disabled:opacity-50 disabled:pointer-events-none";

const BOTTOM_LINE_BTN =
  "py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-b-2 border-transparent whitespace-nowrap hover:text-primary hover:border-b-primary focus:outline-hidden focus:c-gold disabled:opacity-50 disabled:pointer-events-none";

const SOLID_BTN =
  "py-2 px-4 hs-tab-active:font-semibold hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white hs-tab-active:border-primary hs-tab-active:text-white dark:hs-tab-active:text-white border-t-2 border-transparent whitespace-nowrap hover:bg-primary hover:text-white dark:hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none";

const ROUNDED_BTN =
  "py-2 px-4 hs-tab-active:font-semibold rounded-full hs-tab-active:bg-success hs-tab-active:text-white dark:hs-tab-active:text-white dark:hover:text-white border-t-2 border-transparent whitespace-nowrap hover:bg-success hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none";

const OUTLINE_BTN =
  "py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-primary hs-tab-active:border hs-tab-active:border-primary whitespace-nowrap hover:border-primary hover:text-primary";

const FILLED_BTN =
  "py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-white hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white whitespace-nowrap dark:hs-tab-active:text-white dark:hover:text-white hover:bg-primary hover:text-white";

const VERTICAL_OUTLINE_BTN =
  "py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-primary hs-tab-active:border hs-tab-active:border-primary dark:hs-tab-active:text-white whitespace-nowrap hover:border-primary hover:text-primary";

const VERTICAL_FILLED_BTN =
  "py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-white hs-tab-active:border-primary hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white whitespace-nowrap dark:hs-tab-active:text-white hover:border-primary hover:text-primary hs-tab-active:hover:text-white";

const topLine: TabGroup = { startId: 1, navClassName: NAV_WRAP, buttonClassName: TOP_LINE_BTN, labels: TAB_LABELS, bodies: SHORT_BODIES };
const bottomLine: TabGroup = { startId: 4, navClassName: NAV_WRAP, buttonClassName: BOTTOM_LINE_BTN, labels: TAB_LABELS, bodies: SHORT_BODIES };
const topJustified: TabGroup = { startId: 7, navClassName: NAV_BETWEEN, buttonClassName: TOP_LINE_BTN, labels: TAB_LABELS, bodies: SHORT_BODIES };
const bottomJustified: TabGroup = { startId: 10, navClassName: NAV_BETWEEN, buttonClassName: BOTTOM_LINE_BTN, labels: TAB_LABELS, bodies: SHORT_BODIES };
const solid: TabGroup = { startId: 13, navClassName: NAV_WRAP, buttonClassName: SOLID_BTN, labels: TAB_LABELS, bodies: SHORT_BODIES };
const solidJustified: TabGroup = { startId: 16, navClassName: NAV_WRAP_BETWEEN, buttonClassName: SOLID_BTN, labels: TAB_LABELS, bodies: SHORT_BODIES };
const rounded: TabGroup = { startId: 19, navClassName: NAV_WRAP, buttonClassName: ROUNDED_BTN, labels: TAB_LABELS, bodies: SHORT_BODIES };
const roundedJustified: TabGroup = { startId: 22, navClassName: NAV_WRAP_BETWEEN, buttonClassName: ROUNDED_BTN, labels: TAB_LABELS, bodies: SHORT_BODIES };
const defaultNav: TabGroup = { startId: 25, navClassName: NAV_WRAP, buttonClassName: OUTLINE_BTN, labels: TAB_LABELS, bodies: SHORT_BODIES };
const justifiedNav: TabGroup = { startId: 28, navClassName: NAV_WRAP_BETWEEN, buttonClassName: FILLED_BTN, labels: TAB_LABELS, bodies: SHORT_BODIES };
const verticalList: TabGroup = { startId: 31, navClassName: NAV_COLUMN, buttonClassName: VERTICAL_OUTLINE_BTN, labels: VERTICAL_LABELS, bodies: LONG_BODIES };
const verticalLink: TabGroup = { startId: 34, navClassName: NAV_COLUMN, buttonClassName: VERTICAL_FILLED_BTN, labels: VERTICAL_LABELS, bodies: LONG_BODIES };

/* The two "Static" demos are plain, non-interactive strips. */
type StaticTab = { label: string; className: string; disabled?: boolean };

const STATIC_LINK = "py-2 px-4 rounded-full border-t-2 border-transparent whitespace-nowrap";
const STATIC_DISABLED = `${STATIC_LINK} pointer-none`;

const staticTabs: StaticTab[] = [
  { label: "Active", className: "py-2 px-4 rounded-lg border border-[var(--border)] whitespace-nowrap" },
  { label: "Link", className: STATIC_LINK },
  { label: "Link", className: STATIC_LINK },
  { label: "Disabled", className: STATIC_DISABLED, disabled: true },
];

const staticPills: StaticTab[] = [
  { label: "Active", className: "py-2 px-4 rounded-lg bg-primary text-white whitespace-nowrap" },
  { label: "Link", className: STATIC_LINK },
  { label: "Link", className: STATIC_LINK },
  { label: "Disabled", className: STATIC_DISABLED, disabled: true },
];

const TabNav = ({ group }: { group: TabGroup }) => (
  <nav
    className={group.navClassName}
    aria-label="Tabs"
    role="tablist"
    aria-orientation="horizontal"
  >
    {group.labels.map((label, index) => {
      const tabId = group.startId + index;
      const panelId = `tab-0${tabId}`;

      return (
        <button
          key={label}
          type="button"
          className={index === 0 ? `${group.buttonClassName} active` : group.buttonClassName}
          id={`tab-${tabId}`}
          aria-selected={index === 0}
          data-hs-tab={`#${panelId}`}
          aria-controls={panelId}
          role="tab"
        >
          {label}
        </button>
      );
    })}
  </nav>
);

const TabPanels = ({ group }: { group: TabGroup }) => (
  <div>
    {group.bodies.map((body, index) => {
      const tabId = group.startId + index;

      return (
        <div
          key={body}
          id={`tab-0${tabId}`}
          className={index === 0 ? undefined : "hidden"}
          role="tabpanel"
          aria-labelledby={`tab-${tabId}`}
        >
          <p> {body} </p>
        </div>
      );
    })}
  </div>
);

const TabGroupView = ({ group, vertical = false }: { group: TabGroup; vertical?: boolean }) =>
  vertical ? (
    <>
      <div className="xl:col-span-3 lg:col-span-4 md:col-span-3 col-span-12">
        <TabNav group={group} />
      </div>
      <div className="xl:col-span-9 lg:col-span-8 md:col-span-9 col-span-12">
        <TabPanels group={group} />
      </div>
    </>
  ) : (
    <>
      <div className="mb-4">
        <TabNav group={group} />
      </div>
      <TabPanels group={group} />
    </>
  );

const UiNavTabs = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Nav Tabs</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 gap-6">
        <PreviewCodeToggle
          title="Top line tabs"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <div class="mb-4">
            <nav class="flex flex-wrap gap-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-t-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-t-prim focus:outline-hidden focus:c-gold disabled:opacity-50 disabled:pointer-events-none active" id="tab-1" aria-selected="true" data-hs-tab="#tab-01" aria-controls="tab-01" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-t-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-t-prim focus:outline-hidden focus:c-gold disabled:opacity-50 disabled:pointer-events-none" id="tab-2" aria-selected="false" data-hs-tab="#tab-02" aria-controls="tab-02" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-t-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-t-prim focus:outline-hidden focus:text-primary disabled:opacity-50 disabled:pointer-events-none" id="tab-3" aria-selected="false" data-hs-tab="#tab-03" aria-controls="tab-03" role="tab">
                    Messages
                </button>
            </nav>
        </div>
        <div>
            <div id="tab-01" role="tabpanel" aria-labelledby="tab-1">
                <p> This is the item's tab 1 body. </p>
            </div>
            <div id="tab-02" class="hidden" role="tabpanel" aria-labelledby="tab-2">
                <p> This is the item's tab 2 body. </p>
            </div>
            <div id="tab-03" class="hidden" role="tabpanel" aria-labelledby="tab-3">
                <p> This is the item's tab 3 body. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={topLine} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Bottom line tabs"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <div class="mb-4">
            <nav class="flex flex-wrap gap-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-b-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-b-primary focus:outline-hidden focus:c-gold disabled:opacity-50 disabled:pointer-events-none active" id="tab-4" aria-selected="true" data-hs-tab="#tab-04" aria-controls="tab-04" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-b-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-b-primary focus:outline-hidden focus:c-gold disabled:opacity-50 disabled:pointer-events-none" id="tab-5" aria-selected="false" data-hs-tab="#tab-05" aria-controls="tab-05" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-b-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-b-primary focus:outline-hidden focus:text-primary disabled:opacity-50 disabled:pointer-events-none" id="tab-6" aria-selected="false" data-hs-tab="#tab-06" aria-controls="tab-06" role="tab">
                    Messages
                </button>
            </nav>
        </div>
        <div>
            <div id="tab-04" role="tabpanel" aria-labelledby="tab-4">
                <p> This is the item's tab 1 body. </p>
            </div>
            <div id="tab-05" class="hidden" role="tabpanel" aria-labelledby="tab-5">
                <p> This is the item's tab 2 body. </p>
            </div>
            <div id="tab-06" class="hidden" role="tabpanel" aria-labelledby="tab-6">
                <p> This is the item's tab 3 body. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={bottomLine} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Top line justified"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <div class="mb-4">
            <nav class="flex justify-between gap-x-1" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-t-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-t-prim focus:outline-hidden focus:c-gold disabled:opacity-50 disabled:pointer-events-none active" id="tab-7" aria-selected="true" data-hs-tab="#tab-07" aria-controls="tab-07" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-t-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-t-prim focus:outline-hidden focus:c-gold disabled:opacity-50 disabled:pointer-events-none" id="tab-8" aria-selected="false" data-hs-tab="#tab-08" aria-controls="tab-08" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-t-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-t-prim focus:outline-hidden focus:text-primary disabled:opacity-50 disabled:pointer-events-none" id="tab-9" aria-selected="false" data-hs-tab="#tab-09" aria-controls="tab-09" role="tab">
                    Messages
                </button>
            </nav>
        </div>
        <div>
            <div id="tab-07" role="tabpanel" aria-labelledby="tab-7">
                <p> This is the item's tab 1 body. </p>
            </div>
            <div id="tab-08" class="hidden" role="tabpanel" aria-labelledby="tab-8">
                <p> This is the item's tab 2 body. </p>
            </div>
            <div id="tab-09" class="hidden" role="tabpanel" aria-labelledby="tab-9">
                <p> This is the item's tab 3 body. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={topJustified} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Bottom line justified"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <div class="mb-4">
            <nav class="flex justify-between gap-x-1" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-b-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-b-primary focus:outline-hidden focus:c-gold disabled:opacity-50 disabled:pointer-events-none active" id="tab-10" aria-selected="true" data-hs-tab="#tab-010" aria-controls="tab-010" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-b-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-b-primary focus:outline-hidden focus:c-gold disabled:opacity-50 disabled:pointer-events-none" id="tab-11" aria-selected="false" data-hs-tab="#tab-011" aria-controls="tab-011" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:border-primary hs-tab-active:text-primary border-b-2 border-transparent  whitespace-nowrap hover:text-primary hover:border-b-primary focus:outline-hidden focus:text-primary disabled:opacity-50 disabled:pointer-events-none" id="tab-12" aria-selected="false" data-hs-tab="#tab-012" aria-controls="tab-012" role="tab">
                    Messages
                </button>
            </nav>
        </div>
        <div>
            <div id="tab-010" role="tabpanel" aria-labelledby="tab-10">
                <p> This is the item's tab 1 body. </p>
            </div>
            <div id="tab-011" class="hidden" role="tabpanel" aria-labelledby="tab-11">
                <p> This is the item's tab 2 body. </p>
            </div>
            <div id="tab-012" class="hidden" role="tabpanel" aria-labelledby="tab-12">
                <p> This is the item's tab 3 body. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={bottomJustified} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Solid tabs"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <div class="mb-4">
            <nav class="flex flex-wrap gap-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-primary hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none active" id="tab-13" aria-selected="true" data-hs-tab="#tab-013" aria-controls="tab-013" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-primary hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none" id="tab-14" aria-selected="false" data-hs-tab="#tab-014" aria-controls="tab-014" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-primary hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none" id="tab-15" aria-selected="false" data-hs-tab="#tab-015" aria-controls="tab-015" role="tab">
                    Messages
                </button>
            </nav>
        </div>
        <div>
            <div id="tab-013" role="tabpanel" aria-labelledby="tab-13">
                <p> This is the item's tab 1 body. </p>
            </div>
            <div id="tab-014" class="hidden" role="tabpanel" aria-labelledby="tab-14">
                <p> This is the item's tab 2 body. </p>
            </div>
            <div id="tab-015" class="hidden" role="tabpanel" aria-labelledby="tab-15">
                <p> This is the item's tab 3 body. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={solid} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Solid justified"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <div class="mb-4">
            <nav class="flex justify-between gap-x-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-primary hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none active" id="tab-16" aria-selected="true" data-hs-tab="#tab-016" aria-controls="tab-016" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-primary hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none" id="tab-17" aria-selected="false" data-hs-tab="#tab-017" aria-controls="tab-017" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-primary hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none" id="tab-18" aria-selected="false" data-hs-tab="#tab-018" aria-controls="tab-018" role="tab">
                    Messages
                </button>
            </nav>
        </div>
        <div>
            <div id="tab-016" role="tabpanel" aria-labelledby="tab-16">
                <p> This is the item's tab 1 body. </p>
            </div>
            <div id="tab-017" class="hidden" role="tabpanel" aria-labelledby="tab-17">
                <p> This is the item's tab 2 body. </p>
            </div>
            <div id="tab-018" class="hidden" role="tabpanel" aria-labelledby="tab-18">
                <p> This is the item's tab 3 body. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={solidJustified} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Solid Rounded"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <div class="mb-4">
            <nav class="flex flex-wrap gap-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-full hs-tab-active:bg-success hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-success hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none active" id="tab-19" aria-selected="true" data-hs-tab="#tab-019" aria-controls="tab-019" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-full hs-tab-active:bg-success hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-success hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none" id="tab-20" aria-selected="false" data-hs-tab="#tab-020" aria-controls="tab-020" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-full hs-tab-active:bg-success hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-success hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none" id="tab-21" aria-selected="false" data-hs-tab="#tab-021" aria-controls="tab-021" role="tab">
                    Messages
                </button>
            </nav>
        </div>
        <div>
            <div id="tab-019" role="tabpanel" aria-labelledby="tab-19">
                <p> This is the item's tab 1 body. </p>
            </div>
            <div id="tab-020" class="hidden" role="tabpanel" aria-labelledby="tab-20">
                <p> This is the item's tab 2 body. </p>
            </div>
            <div id="tab-021" class="hidden" role="tabpanel" aria-labelledby="tab-21">
                <p> This is the item's tab 3 body. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={rounded} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Rounded justified"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <div class="mb-4">
            <nav class="flex justify-between gap-x-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-full hs-tab-active:bg-success hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-success hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none active" id="tab-22" aria-selected="true" data-hs-tab="#tab-022" aria-controls="tab-022" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-full hs-tab-active:bg-success hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-success hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none" id="tab-23" aria-selected="false" data-hs-tab="#tab-023" aria-controls="tab-023" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-full hs-tab-active:bg-success hs-tab-active:text-white border-t-2 border-transparent  whitespace-nowrap hover:bg-success hover:text-white focus:outline-hidden focus:text-white disabled:opacity-50 disabled:pointer-events-none" id="tab-24" aria-selected="false" data-hs-tab="#tab-024" aria-controls="tab-024" role="tab">
                    Messages
                </button>
            </nav>
        </div>
        <div>
            <div id="tab-022" role="tabpanel" aria-labelledby="tab-22">
                <p> This is the item's tab 1 body. </p>
            </div>
            <div id="tab-023" class="hidden" role="tabpanel" aria-labelledby="tab-23">
                <p> This is the item's tab 2 body. </p>
            </div>
            <div id="tab-024" class="hidden" role="tabpanel" aria-labelledby="tab-24">
                <p> This is the item's tab 3 body. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={roundedJustified} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Static Tabs"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <nav class="flex flex-wrap gap-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
            <button type="button" class="py-2 px-4 rounded-lg border border-[var(--border)]  whitespace-nowrap" aria-selected="false" role="tab">
                Active
            </button>
            <button type="button" class="py-2 px-4 rounded-full border-t-2 border-transparent  whitespace-nowrap" aria-selected="false" role="tab">
                Link
            </button>
            <button type="button" class="py-2 px-4 rounded-full border-t-2 border-transparent  whitespace-nowrap" aria-selected="false" role="tab">
                Link
            </button>
            <button type="button" class="py-2 px-4 rounded-full border-t-2 border-transparent  whitespace-nowrap pointer-none" aria-selected="false" role="tab" disabled>
                Disabled
            </button>
        </nav>
    </div>`}
        >
          <nav className="flex flex-wrap gap-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
            {staticTabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                className={tab.className}
                aria-selected="false"
                role="tab"
                disabled={tab.disabled}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Static Pills"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <nav class="flex flex-wrap gap-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
            <button type="button" class="py-2 px-4 rounded-lg border bg-primary text-white whitespace-nowrap" aria-selected="false" role="tab">
                Active
            </button>
            <button type="button" class="py-2 px-4 rounded-full border-t-2 border-transparent whitespace-nowrap" aria-selected="false" role="tab">
                Link
            </button>
            <button type="button" class="py-2 px-4 rounded-full border-t-2 border-transparent whitespace-nowrap" aria-selected="false" role="tab">
                Link
            </button>
            <button type="button" class="py-2 px-4 rounded-full border-t-2 border-transparent whitespace-nowrap pointer-none" aria-selected="false" role="tab" disabled>
                Disabled
            </button>
        </nav>
    </div>`}
        >
          <nav className="flex flex-wrap gap-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
            {staticPills.map((tab) => (
              <button
                key={tab.label}
                type="button"
                className={tab.className}
                aria-selected="false"
                role="tab"
                disabled={tab.disabled}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Default Nav Tabs"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <div class="mb-4">
            <nav class="flex flex-wrap gap-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-primary hs-tab-active:border hs-tab-active:border-primary whitespace-nowrap hover:border-primary hover:text-primary active" id="tab-25" aria-selected="true" data-hs-tab="#tab-025" aria-controls="tab-025" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-primary hs-tab-active:border hs-tab-active:border-primary whitespace-nowrap hover:border-primary hover:text-primary" id="tab-26" aria-selected="false" data-hs-tab="#tab-026" aria-controls="tab-026" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-primary hs-tab-active:border hs-tab-active:border-primary whitespace-nowrap hover:border-primary hover:text-primary" id="tab-27" aria-selected="false" data-hs-tab="#tab-027" aria-controls="tab-027" role="tab">
                    Messages
                </button>
            </nav>
        </div>
        <div>
            <div id="tab-025" role="tabpanel" aria-labelledby="tab-25">
                <p> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries. </p>
            </div>
            <div id="tab-026" class="hidden" role="tabpanel" aria-labelledby="tab-26">
                <p> Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur. </p>
            </div>
            <div id="tab-027" class="hidden" role="tabpanel" aria-labelledby="tab-27">
                <p> There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={defaultNav} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Justified Nav Tabs"
          contentClassName=""
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content">
        <div class="mb-4">
            <nav class="flex justify-between gap-x-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-white hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white whitespace-nowrap hover:bg-primary hover:text-white active" id="tab-28" aria-selected="true" data-hs-tab="#tab-028" aria-controls="tab-028" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-white hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white whitespace-nowrap hover:bg-primary hover:text-white" id="tab-29" aria-selected="false" data-hs-tab="#tab-029" aria-controls="tab-029" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-white hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white whitespace-nowrap hover:bg-primary hover:text-white" id="tab-30" aria-selected="false" data-hs-tab="#tab-030" aria-controls="tab-030" role="tab">
                    Messages
                </button>
            </nav>
        </div>
        <div>
            <div id="tab-028" role="tabpanel" aria-labelledby="tab-28">
                <p> Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur. </p>
            </div>
            <div id="tab-029" class="hidden" role="tabpanel" aria-labelledby="tab-29">
                <p> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries </p>
            </div>
            <div id="tab-030" class="hidden" role="tabpanel" aria-labelledby="tab-30">
                <p> There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={justifiedNav} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Vertical alignment with lists"
          contentClassName="grid grid-cols-12 gap-4"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content grid grid-cols-1 md:grid-cols-12 gap-4">
        <div class="col-span-3">
            <nav class="flex flex-col" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-primary hs-tab-active:border hs-tab-active:border-primary whitespace-nowrap hover:border-primary hover:text-primary active" id="tab-31" aria-selected="true" data-hs-tab="#tab-031" aria-controls="tab-031" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-primary hs-tab-active:border hs-tab-active:border-primary whitespace-nowrap hover:border-primary hover:text-primary" id="tab-32" aria-selected="false" data-hs-tab="#tab-032" aria-controls="tab-032" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-primary hs-tab-active:border hs-tab-active:border-primary whitespace-nowrap hover:border-primary hover:text-primary" id="tab-33" aria-selected="false" data-hs-tab="#tab-033" aria-controls="tab-033" role="tab">
                    About
                </button>
            </nav>
        </div>
        <div class="col-span-9">
            <div id="tab-031" role="tabpanel" aria-labelledby="tab-31">
                <p> There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything. </p>
            </div>
            <div id="tab-032" class="hidden" role="tabpanel" aria-labelledby="tab-32">
                <p> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries. </p>
            </div>
            <div id="tab-033" class="hidden" role="tabpanel" aria-labelledby="tab-33">
                <p> Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={verticalList} vertical />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Vertical alignment with links"
          contentClassName="grid grid-cols-12 gap-4"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
    <div class="preview-content grid grid-cols-1 md:grid-cols-12 gap-4">
        <div class="col-span-3">
            <nav class="flex flex-col" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-white hs-tab-active:border hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white whitespace-nowrap hover:border-primary hover:text-primary active" id="tab-34" aria-selected="true" data-hs-tab="#tab-034" aria-controls="tab-034" role="tab">
                    Home
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-white hs-tab-active:border hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white whitespace-nowrap hover:border-primary hover:text-primary" id="tab-35" aria-selected="false" data-hs-tab="#tab-035" aria-controls="tab-035" role="tab">
                    Profile
                </button>
                <button type="button" class="py-2 px-4 hs-tab-active:font-semibold rounded-lg hs-tab-active:text-white hs-tab-active:border hs-tab-active:bg-primary dark:hs-tab-active:hover:text-white whitespace-nowrap hover:border-primary hover:text-primary" id="tab-36" aria-selected="false" data-hs-tab="#tab-036" aria-controls="tab-036" role="tab">
                    About
                </button>
            </nav>
        </div>
        <div class="col-span-9">
            <div id="tab-034" role="tabpanel" aria-labelledby="tab-34">
                <p> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries. </p>
            </div>
            <div id="tab-035" class="hidden" role="tabpanel" aria-labelledby="tab-35">
                <p> Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur. </p>
            </div>
            <div id="tab-036" class="hidden" role="tabpanel" aria-labelledby="tab-36">
                <p> Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur. </p>
            </div>
        </div>
    </div>`}
        >
          <TabGroupView group={verticalLink} vertical />
        </PreviewCodeToggle>
        {/* end card */}
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiNavTabs;
